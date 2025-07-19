import "server-only";

import { Firestore, addDoc, collection } from "firebase/firestore";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  e164PhoneNumberSchema,
  userProfileCodeVerificationSchema,
  userProfileSchema,
} from "@/lib/schemas/index";

// import { cache } from "react";
import { redirect } from "next/navigation";
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

function handleTwilioError(error: unknown, context: "send" | "verify") {
  // Handle Twilio-specific errors
  if (isTwilioError(error)) {
    switch (error.status) {
      case 429:
        return {
          success: false as const,
          error: "Too many requests. Please wait before trying again.",
          retryAfter: RETRY_DELAY_RATE_LIMIT,
          ...(context === "verify" && { verified: false }),
        };
      case 400:
        if (error.code === 60200) {
          return {
            success: false as const,
            error: "Invalid phone number format.",
            ...(context === "verify" && { verified: false }),
          };
        }
        if (error.code === 60203) {
          return {
            success: false as const,
            error: "Maximum send attempts reached for this phone number.",
            retryAfter: RETRY_DELAY_MAX_ATTEMPTS,
            ...(context === "verify" && { verified: false }),
          };
        }
        if (error.code === 60202 && context === "verify") {
          return {
            success: false as const,
            verified: false,
            error:
              "Maximum verification attempts reached. Please request a new code.",
          };
        }
        break;
      case 403:
        return {
          success: false as const,
          error: "Forbidden. Check your Twilio account permissions.",
          ...(context === "verify" && { verified: false }),
        };
      case 404:
        if (error.code === 20404 && context === "verify") {
          return {
            success: false as const,
            verified: false,
            error: "Verification code has expired. Please request a new one.",
          };
        }
        return {
          success: false as const,
          error: "Verification service not found. Check your configuration.",
          ...(context === "verify" && { verified: false }),
        };
      default:
        return {
          success: false as const,
          error: `Twilio error: ${error.message}`,
          ...(context === "verify" && { verified: false }),
        };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      success: false as const,
      error: error.message,
      ...(context === "verify" && { verified: false }),
    };
  }

  return {
    success: false as const,
    error:
      context === "send"
        ? "An unknown error occurred. Please try again later."
        : "An unknown error occurred during verification.",
    ...(context === "verify" && { verified: false }),
  };
}

/*

  !!!ABOUT ENFORCING AUTHENTICATION FOR ANY DAL OPERATIONS
  We enforce authentication for any DAL operations to ensure that only authenticated users can access or manipulate data.
  It is better here because any server action or API endpoint could FORGET to enforce authentication, leading to potential security issues.
  By enforcing authentication at the DAL level, we ensure that all database operations are secure and that
  only authorized users can perform actions on the database.

*/

const enforceAuth = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
};

// users that are not providers should not be able to access provider DAL functions
const enforceAuthProvider = async () => {
  const userId = await enforceAuth();
  const user = await currentUser();
  if (!user || !user?.publicMetadata?.isAProvider) {
    throw new Error("Unauthorized: User is not a provider.");
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
) {
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
) {
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
      return {
        success: false,
        error: "Maximum attempts reached. Please try again later.",
        retryAfter: RETRY_DELAY_MAX_ATTEMPTS, // 1 hour in seconds
      };
    }

    if (verification.status !== "pending") {
      throw new Error(
        "Something went wrong while sending the verification code. Please try again later."
      );
    }

    return { success: true, message: verification.status };
  } catch (error: unknown) {
    return handleTwilioError(error, "send");
  }
}

export async function verifyTwilioCodeDAL(
  code: z.infer<typeof userProfileCodeVerificationSchema>["verificationCode"],
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"]
) {
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
      return {
        success: false,
        verified: false,
        error: "Invalid verification code. Please try again.",
      };
    }

    return {
      success: true,
      verified: true,
      message: "Code verified successfully.",
    };
  } catch (error: unknown) {
    return handleTwilioError(error, "verify");
  }
}

// *** CLERK DAL FUNCTIONS ***
export async function addClerkProviderMetadataDAL() {
  const userId = await enforceAuth();
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        isAProvider: true,
        onboardingComplete: false,
      },
    });
    return { success: true, message: res.publicMetadata };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred trying to update user metadata";
    return {
      success: false,
      error: `There was an error updating the user metadata. ${errorMessage}`,
    };
  }
}

// *** FIRESTORE DAL FUNCTIONS ***
export async function createFirebaseUserProviderDAL(
  data: z.infer<typeof userProfileSchema>,
  authenticatedFirebaseDB: Firestore
) {
  await enforceAuth();
  const clerkUser = await currentUser();

  try {
    const docRef = await addDoc(collection(authenticatedFirebaseDB, "Users"), {
      createdAt: new Date(),
      updatedAt: null,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        about: data.about,
        photo: data.photo,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
      },
      isAProvider: true,
      roles: {
        provider: true,
      },
      providerDetails: {
        isOnboarded: false,
        isActive: false,
        isPhoneVerified: false,
      },
      providerRatings: {
        averageRating: 0,
        totalReviews: 0,
      },
      providerReviews: [],
    });

    if (!docRef.id) {
      throw new Error("Failed to create provider profile in Firestore");
    }

    return { success: true, message: "Provider profile created successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to update user metadata";
    return {
      success: false,
      error: `Failed to create provider profile: ${errorMessage}`,
    };
  }
}
