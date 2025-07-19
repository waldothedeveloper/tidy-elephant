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
    const { status } = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    if (status === "max_attempts_reached") {
      throw new Error("Maximum attempts reached. Please try again later.");
    }

    if (status !== "pending") {
      throw new Error(
        "Something went wrong while sending the verification code. Please try again later."
      );
    }

    return { success: true, message: status };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to send verification code";
    return {
      success: false,
      error: `${errorMessage}`,
    };
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
    const { status } = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        code,
        to: phoneNumber,
      });

    if (status !== "approved") {
      throw new Error("Failed to verify code. Please try again.");
    }

    return { success: true, message: "Code verified successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to verify the code";
    return {
      success: false,
      error: `${errorMessage}`,
    };
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
