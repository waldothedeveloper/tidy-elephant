import "server-only";

import * as v from "valibot";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import twilio from "twilio";

// Import the shared US E.164 phone number schema
import { e164USPhoneNumberSchema } from "@/lib/schemas/phone-verification-schemas";

// Re-export for backward compatibility - extracts just the phone number validation
export const e164PhoneNumberSchema = e164USPhoneNumberSchema.entries.phoneNumber;

// Retry delay constants for better maintainability
const RETRY_DELAY_RATE_LIMIT = 60; // 1 minute for rate limiting
const RETRY_DELAY_MAX_ATTEMPTS = 3600; // 1 hour for max attempts

// Twilio client setup
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
  phoneNumber: v.InferInput<typeof e164PhoneNumberSchema>
) {
  await enforceAuthProvider();

  try {
    const verifiedPhoneNumber = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: "line_type_intelligence" });

    if (verifiedPhoneNumber.valid !== true) {
      throw new Error("Phone number not found or invalid.");
    }

    // Extract line type information
    let phoneLineType: string = "unknown";
    if (isLineTypeIntelligence(verifiedPhoneNumber.lineTypeIntelligence)) {
      phoneLineType = verifiedPhoneNumber.lineTypeIntelligence.type;
    }

    return {
      success: true,
      message: "Phone number lookup successful.",
      phoneLineType,
      e164Format: verifiedPhoneNumber.phoneNumber, // Twilio returns normalized E.164 format
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
  phoneNumber: v.InferInput<typeof e164PhoneNumberSchema>
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
        error:
          "Maximum verification attempts reached. Please request a new code.",
      };
    }

    if (verification.status !== "pending") {
      throw new Error(
        "Something went wrong while sending the verification code. Please try again later."
      );
    }

    return {
      success: true,
      message: verification.status,
    };
  } catch (error: unknown) {
    console.error("Error on sendTwilioVerificationCodeDAL: ", error);
    return {
      success: false,
      error:
        "An error occurred while sending the verification code. Please try again later.",
    };
  }
}

export async function verifyTwilioCodeDAL(
  code: string,
  phoneNumber: v.InferInput<typeof e164PhoneNumberSchema>
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
        error: "Verification failed. Please check your code and try again.",
      };
    }

    return {
      success: true,
      message: "Phone number verified successfully.",
    };
  } catch (error: unknown) {
    console.error("Error on verifyTwilioCodeDAL: ", error);
    return {
      success: false,
      error:
        "An error occurred while verifying the code. Please try again later.",
    };
  }
}
