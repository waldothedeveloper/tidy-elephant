"use server";

import * as v from "valibot";

import {
  e164USPhoneNumberSchema,
  verificationCodeSchema,
} from "@/lib/schemas/phone-verification-schemas";

import { verifyTwilioCodeDAL } from "@/lib/dal/twilio";
import { auth } from "@clerk/nextjs/server";

interface VerificationResult {
  success: boolean;
  verified?: boolean;
  error?: string;
  retryAfter?: number;
}

export async function twilioVerifyCodeAction(
  code: string,
  phoneNumber: string | null
): Promise<VerificationResult> {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  // 2. Input validation - NO THROWING, only return errors
  const codeValidation = v.safeParse(verificationCodeSchema, {
    verificationCode: code?.toString().trim().replace(/\D/g, "") || "",
  });

  if (!codeValidation.success) {
    return {
      success: false,
      error: "Invalid verification code format.",
    };
  }

  if (!phoneNumber?.trim()) {
    return {
      success: false,
      error: "Phone number is required for verification.",
    };
  }

  const phoneValidation = v.safeParse(e164USPhoneNumberSchema, {
    phoneNumber: phoneNumber.trim(),
  });

  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format.",
    };
  }

  try {
    const result = await verifyTwilioCodeDAL(
      codeValidation.output.verificationCode,
      phoneValidation.output.phoneNumber
    );

    return result;
  } catch (error) {
    // Log error without exposing internal details
    console.error("Verification error:", error);

    return {
      success: false,
      error:
        "Verification service temporarily unavailable. Please try again later.",
    };
  }
}
