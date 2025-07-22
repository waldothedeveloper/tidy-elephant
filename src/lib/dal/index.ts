import "server-only";

import {
  FirebaseUser,
  ProviderDetails,
  ProviderRatings,
  ProviderReview,
  ServiceCategory,
  UserProfile,
  UserRoles,
} from "@/types/user";
import {
  createErrorResponse,
  createErrorResponseWithRetry,
  createSuccessResponse,
  createVerificationErrorResponse,
  createVerificationErrorResponseWithRetry,
  createVerificationSuccessResponse,
  DataOrError,
  OperationResult,
  OperationResultWithRetry,
  PhoneLoadupResult,
  VerificationResult,
} from "@/types/api-responses";
import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { User, auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  e164PhoneNumberSchema,
  userCategoriesSchema,
  userProfileCodeVerificationSchema,
  userProfileSchema,
} from "@/lib/schemas/index";

import { cache } from "react";
import twilio from "twilio";
import { z } from "zod";

// Retry delay constants for better maintainability
const RETRY_DELAY_RATE_LIMIT = 60; // 1 minute for rate limiting
const RETRY_DELAY_MAX_ATTEMPTS = 3600; // 1 hour for max attempts

// Add Twilio error interface at the top
interface TwilioError extends Error {
  status: number;
  code: number;
  moreInfo: string;
}

// Helper function to check if error is a Twilio error
function isTwilioError(error: unknown): error is TwilioError {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    typeof error.status === "number" &&
    typeof error.code === "number"
  );
}

// Function overloads for better type safety
function handleTwilioError(error: unknown, context: "send"): OperationResultWithRetry;
function handleTwilioError(error: unknown, context: "verify"): VerificationResult;
function handleTwilioError(error: unknown, context: "send" | "verify"): OperationResultWithRetry | VerificationResult {
  // Handle Twilio-specific errors
  if (isTwilioError(error)) {
    switch (error.status) {
      case 429:
        return context === "verify"
          ? createVerificationErrorResponseWithRetry(
              "Too many requests. Please wait before trying again.",
              RETRY_DELAY_RATE_LIMIT
            )
          : createErrorResponseWithRetry(
              "Too many requests. Please wait before trying again.",
              RETRY_DELAY_RATE_LIMIT
            );
      case 400:
        if (error.code === 60200) {
          return context === "verify"
            ? createVerificationErrorResponse("Invalid phone number format.")
            : createErrorResponse("Invalid phone number format.");
        }
        if (error.code === 60203) {
          return context === "verify"
            ? createVerificationErrorResponseWithRetry(
                "Maximum send attempts reached for this phone number.",
                RETRY_DELAY_MAX_ATTEMPTS
              )
            : createErrorResponseWithRetry(
                "Maximum send attempts reached for this phone number.",
                RETRY_DELAY_MAX_ATTEMPTS
              );
        }
        if (error.code === 60202 && context === "verify") {
          return createVerificationErrorResponse(
            "Maximum verification attempts reached. Please request a new code."
          );
        }
        break;
      case 403:
        return context === "verify"
          ? createVerificationErrorResponse(
              "Forbidden. Check your Twilio account permissions."
            )
          : createErrorResponse(
              "Forbidden. Check your Twilio account permissions."
            );
      case 404:
        if (error.code === 20404 && context === "verify") {
          return createVerificationErrorResponse(
            "Verification code has expired. Please request a new one."
          );
        }
        return context === "verify"
          ? createVerificationErrorResponse(
              "Verification service not found. Check your configuration."
            )
          : createErrorResponse(
              "Verification service not found. Check your configuration."
            );
      default:
        return context === "verify"
          ? createVerificationErrorResponse(`Twilio error: ${error.message}`)
          : createErrorResponse(`Twilio error: ${error.message}`);
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return context === "verify"
      ? createVerificationErrorResponse(error.message)
      : createErrorResponse(error.message);
  }

  const errorMessage =
    context === "send"
      ? "An unknown error occurred. Please try again later."
      : "An unknown error occurred during verification.";

  return context === "verify"
    ? createVerificationErrorResponse(errorMessage)
    : createErrorResponse(errorMessage);
}

/*

  !!!ABOUT ENFORCING AUTHENTICATION FOR ANY DAL OPERATIONS
  We enforce authentication for any DAL operations to ensure that only authenticated users can access or manipulate data.
  It is better here because any server action or API endpoint could FORGET to enforce authentication, leading to potential security issues.
  By enforcing authentication at the DAL level, we ensure that all database operations are secure and that
  only authorized users can perform actions on the database.

*/

class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const enforceAuth = async (): Promise<User["id"]> => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }
  return userId;
};

// users that are not providers should not be able to access provider DAL functions
const enforceAuthProvider = async (): Promise<User["id"]> => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }

  const user = await currentUser();
  if (!user?.privateMetadata?.isAProvider) {
    throw new AuthorizationError("User is not a provider");
  }
  return userId;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!accountSid || !authToken) {
  throw new Error(
    "Twilio credentials are not set in environment variables. Please check that your .env file is configured correctly."
  );
}

const client = twilio(accountSid, authToken);

// *** TWILIO DAL FUNCTIONS ***
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLineTypeIntelligence(obj: any): obj is { type: string } {
  return obj && typeof obj === "object" && typeof obj.type === "string";
}
export async function lookupTwilioPhoneNumberDAL(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"]
): Promise<PhoneLoadupResult> {
  await enforceAuthProvider();

  try {
    const verifiedPhoneNumber = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: "line_type_intelligence" });

    if (verifiedPhoneNumber.valid !== true) {
      throw new Error("Phone number not found or invalid.");
    }

    if (
      !isLineTypeIntelligence(verifiedPhoneNumber.lineTypeIntelligence) ||
      verifiedPhoneNumber.lineTypeIntelligence.type !== "mobile"
    ) {
      throw new Error(
        "This phone is doesn't appear to be a mobile phone. Please use a phone number capable of receiving SMS messages."
      );
    }

    return {
      success: true,
      message: "Phone number lookup successful.",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to lookup phone number";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// *** Using Twilio we will send a verification code via SMS to an already previously verified phone number also by Twilio ***
export async function sendTwilioVerificationCodeDAL(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"]
): Promise<OperationResultWithRetry> {
  await enforceAuthProvider();

  if (!phoneNumber) {
    throw new Error("Phone number is required to provide this service.");
  }

  try {
    if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new Error(
        "Twilio Verify Service SID is not set in environment variables. Please check that your .env file is configured correctly."
      );
    }

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    if (verification.status === "max_attempts_reached") {
      return createErrorResponseWithRetry(
        "Maximum attempts reached. Please try again later.",
        RETRY_DELAY_MAX_ATTEMPTS
      );
    }

    if (verification.status !== "pending") {
      throw new Error(
        "Something went wrong while sending the verification code. Please try again later."
      );
    }

    return createSuccessResponse(verification.status);
  } catch (error: unknown) {
    return handleTwilioError(error, "send");
  }
}

export async function verifyTwilioCodeDAL(
  code: z.infer<typeof userProfileCodeVerificationSchema>["verificationCode"],
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"]
): Promise<VerificationResult> {
  await enforceAuthProvider();

  try {
    if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new Error(
        "Twilio Verify Service SID is not set in environment variables. Please check that your .env file is configured correctly."
      );
    }

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        code,
        to: phoneNumber,
      });

    if (verificationCheck.status !== "approved") {
      return createVerificationErrorResponse(
        "Invalid verification code. Please try again."
      );
    }

    return createVerificationSuccessResponse(
      "Code verified successfully."
    );
  } catch (error: unknown) {
    return handleTwilioError(error, "verify");
  }
}

// *** CLERK DAL FUNCTIONS ***
export async function addClerkProviderMetadataDAL(): Promise<OperationResult> {
  const userId = await enforceAuth();
  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        isAProvider: true,
        onboardingComplete: false,
      },
    });
    return createSuccessResponse("User metadata updated successfully.");
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred trying to update user metadata";
    return createErrorResponse(
      `There was an error updating the user metadata. ${errorMessage}`
    );
  }
}

// *** FIRESTORE DAL FUNCTIONS ***
export async function createFirebaseUserProviderDAL(
  data: z.infer<typeof userProfileSchema>,
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  await enforceAuth();
  const clerkUser = await currentUser();

  try {
    const userProfile: UserProfile = {
      firstName: data.firstName,
      lastName: data.lastName,
      about: data.about,
      photo: data.photo,
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    };

    const userRoles: UserRoles = {
      provider: true,
    };

    const providerDetails: ProviderDetails = {
      isOnboarded: false,
      isActive: false,
      isPhoneVerified: false,
      categories: [],
    };

    const providerRatings: ProviderRatings = {
      averageRating: 0,
      totalReviews: 0,
    };

    const providerReviews: ProviderReview[] = [];

    const firebaseUser: Omit<FirebaseUser, "id"> = {
      createdAt: new Date(),
      updatedAt: null,
      clerkUserID: clerkUser?.id || "",
      isAProvider: true,
      profile: userProfile,
      roles: userRoles,
      providerDetails,
      providerRatings,
      providerReviews,
    };

    const docRef = await addDoc(
      collection(authenticatedFirebaseDB, "Users"),
      firebaseUser
    );

    if (!docRef.id) {
      throw new Error("Failed to create provider profile in Firestore");
    }

    return createSuccessResponse("Provider profile created successfully.");
  } catch (error) {
    console.error("Error creating provider profile:", error);
    return createErrorResponse("Failed to create provider profile");
  }
}

export const getFirebaseProviderCategoriesDAL = cache(
  async (
    authenticatedFirebaseDB: Firestore
  ): Promise<DataOrError<ServiceCategory[]>> => {
    await enforceAuth();

    try {
      const categoriesRef = collection(
        authenticatedFirebaseDB,
        "Provider_Categories"
      );
      const snapshot = await getDocs(categoriesRef);

      const categories = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Ensure the data matches our expected structure
        const category: ServiceCategory = {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          isActive: data.isActive ?? true,
        };

        return category;
      });

      // Filter to only return active categories
      return categories.filter((category) => category.isActive);
    } catch (error) {
      console.error("Error fetching provider categories:", error);

      return createErrorResponse(
        "Failed to retrieve provider categories"
      );
    }
  }
);

export async function getFirebaseUserByIdDAL(
  authenticatedFirebaseDB: Firestore
): Promise<DataOrError<FirebaseUser | null>> {
  const userId = await enforceAuth();

  try {
    const querySnapshot = await getDocs(
      query(
        collection(authenticatedFirebaseDB, "Users"),
        where("clerkUserID", "==", userId)
      )
    );

    if (querySnapshot.empty) {
      return null;
    }

    // Should only be one user per clerkUserID
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Map Firestore data to FirebaseUser interface
    const firebaseUser: FirebaseUser = {
      id: userDoc.id,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || null,
      clerkUserID: userData.clerkUserID || "",
      isAProvider: userData.isAProvider || false,
      profile: {
        firstName: userData.profile?.firstName || "",
        lastName: userData.profile?.lastName || "",
        about: userData.profile?.about || "",
        photo: userData.profile?.photo || "",
        email: userData.profile?.email || "",
        phoneNumber: userData.profile?.phoneNumber,
        address: userData.profile?.address,
      },
      roles: userData.roles || {},
      providerDetails: userData.providerDetails,
      providerRatings: userData.providerRatings,
      providerReviews: userData.providerReviews || [],
      clientDetails: userData.clientDetails,
      bookingHistory: userData.bookingHistory || [],
      clientPreferences: userData.clientPreferences,
    };

    return firebaseUser;
  } catch (error) {
    console.error("Error fetching Firebase user by ID:", error);
    return createErrorResponse("Failed to retrieve user");
  }
}

export async function saveFirebaseProviderCategoriesDAL(
  data: z.infer<typeof userCategoriesSchema>,
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  const userId = await enforceAuthProvider();

  try {
    // First, find the user's document by clerkUserID
    const userQuery = query(
      collection(authenticatedFirebaseDB, "Users"),
      where("clerkUserID", "==", userId)
    );
    
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return createErrorResponse(
        "User profile not found. Please complete your basic profile first."
      );
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(authenticatedFirebaseDB, "Users", userDoc.id);

    // Update the provider's categories in their providerDetails
    await updateDoc(userDocRef, {
      "providerDetails.categories": data.categories,
      updatedAt: new Date(),
    });

    return createSuccessResponse(
      `Successfully saved ${data.categories.length} service categories to your profile.`
    );
  } catch (error) {
    console.error("Error saving provider categories:", error);
    return createErrorResponse(
      "Failed to save service categories. Please try again."
    );
  }
}
