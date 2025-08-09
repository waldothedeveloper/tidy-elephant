"use server";

import {
  e164PhoneNumberSchema,
  userProfileCodeVerificationSchema,
} from "@/lib/schemas";
import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";

import { Duration } from "@upstash/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { verifyTwilioCodeDAL } from "@/lib/dal/twilio";
import { z } from "zod";

interface VerificationResult {
  success: boolean;
  verified?: boolean;
  error?: string;
  retryAfter?: number;
}

export async function twilioVerifyCodeAction(
  code: z.infer<typeof userProfileCodeVerificationSchema>["verificationCode"],
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
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
  const codeValidation =
    userProfileCodeVerificationSchema.shape.verificationCode.safeParse(
      code?.toString().trim().replace(/\D/g, "")
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

  const phoneValidation = e164PhoneNumberSchema.safeParse({
    phoneNumber: phoneNumber.trim(),
  });

  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format.",
    };
  }

  // 3. Rate limiting - check result without throwing (using verification-specific limits)
  const verificationLimits = getActionRateLimits("verification");

  const rateLimitResult = await rateLimiter(
    `verify-code:${userId}:${phoneValidation.data.phoneNumber}`,
    verificationLimits.attempts,
    verificationLimits.window as Duration
  );

  const dailyLimitResult = await rateLimiter(
    `verify-daily:${userId}:${phoneValidation.data.phoneNumber}`,
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
      codeValidation.data,
      phoneValidation.data.phoneNumber
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
