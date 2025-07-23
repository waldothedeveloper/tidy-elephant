import "server-only";

import {
  OperationResultWithRetry,
  PhoneLoadupResult,
  VerificationResult,
  createErrorResponse,
  createErrorResponseWithRetry,
  createSuccessResponse,
  createVerificationErrorResponse,
  createVerificationErrorResponseWithRetry,
  createVerificationSuccessResponse,
} from "@/types/api-responses";
import {
  e164PhoneNumberSchema,
  userProfileCodeVerificationSchema,
} from "@/lib/schemas/index";

import { enforceAuthProvider } from "@/lib/dal/clerk";
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
function handleTwilioError(
  error: unknown,
  context: "send"
): OperationResultWithRetry;
function handleTwilioError(
  error: unknown,
  context: "verify"
): VerificationResult;
function handleTwilioError(
  error: unknown,
  context: "send" | "verify"
): OperationResultWithRetry | VerificationResult {
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

    return createVerificationSuccessResponse("Code verified successfully.");
  } catch (error: unknown) {
    return handleTwilioError(error, "verify");
  }
}
