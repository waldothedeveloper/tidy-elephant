"use server";

import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";

import { Duration } from "@upstash/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { verifyTwilioCodeDAL } from "@/lib/dal/twilio";
import * as v from "valibot";
import { verificationCodeSchema, e164USPhoneNumberSchema } from "@/lib/schemas/phone-verification-schemas";

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
  const codeValidation = v.safeParse(
    verificationCodeSchema,
    { verificationCode: code?.toString().trim().replace(/\D/g, "") || "" }
  );

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

  const phoneValidation = v.safeParse(
    e164USPhoneNumberSchema,
    { phoneNumber: phoneNumber.trim() }
  );

  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format.",
    };
  }

  // 3. Rate limiting - check result without throwing (using verification-specific limits)
  const verificationLimits = getActionRateLimits("verification");

  const rateLimitResult = await rateLimiter(
    `verify-code:${userId}:${phoneValidation.output.phoneNumber}`,
    verificationLimits.attempts,
    verificationLimits.window as Duration
  );

  const dailyLimitResult = await rateLimiter(
    `verify-daily:${userId}:${phoneValidation.output.phoneNumber}`,
    verificationLimits.dailyAttempts,
    verificationLimits.dailyWindow as Duration
  );

  if (!rateLimitResult.success || !dailyLimitResult.success) {
    const failedResult = !rateLimitResult.success
      ? rateLimitResult
      : dailyLimitResult;
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((failedResult.reset - Date.now()) / 1000),
    };
  }

  // 4. Perform verification
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
