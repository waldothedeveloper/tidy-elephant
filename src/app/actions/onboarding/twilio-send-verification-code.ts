"use server";

import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";

import { Duration } from "@upstash/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { e164PhoneNumberSchema } from "@/lib/schemas";
import { sendTwilioVerificationCodeDAL } from "@/lib/dal/twilio";
import { z } from "zod";

interface SendVerificationResult {
  success: boolean;
  sent?: boolean;
  error?: string;
  retryAfter?: number;
}

export async function twilioSendVerificationCodeAction(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
): Promise<SendVerificationResult> {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  // 2. Input validation with sanitization - NO THROWING
  if (!phoneNumber?.trim()) {
    return {
      success: false,
      error: "Phone number is required to send verification code.",
    };
  }

  const sanitizedPhoneNumber = {
    phoneNumber: phoneNumber
      .toString()
      .trim()
      .replace(/[^\d+]/g, ""),
  };

  const phoneValidation = e164PhoneNumberSchema.safeParse(sanitizedPhoneNumber);
  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format.",
    };
  }

  // 3. Rate limiting - Send verification attempts (strictest limits - SMS costs money!)
  const sendVerificationLimits = getActionRateLimits("send-verification");

  const rateLimitResult = await rateLimiter(
    `send-verification:${userId}:${phoneValidation.data.phoneNumber}`,
    sendVerificationLimits.attempts,
    sendVerificationLimits.window as Duration
  );

  const dailyLimitResult = await rateLimiter(
    `send-verification-daily:${userId}:${phoneValidation.data.phoneNumber}`,
    sendVerificationLimits.dailyAttempts,
    sendVerificationLimits.dailyWindow as Duration
  );

  if (!rateLimitResult.success || !dailyLimitResult.success) {
    const failedResult = !rateLimitResult.success
      ? rateLimitResult
      : dailyLimitResult;
    return {
      success: false,
      error: "Too many verification requests. Please try again later.",
      retryAfter: Math.ceil((failedResult.reset - Date.now()) / 1000),
    };
  }

  // 4. Send verification code with error handling
  try {
    const result = await sendTwilioVerificationCodeDAL(
      phoneValidation.data.phoneNumber
    );

    return result;
  } catch (error) {
    // Log error without exposing internal details
    console.error("Send verification error:", error);

    return {
      success: false,
      error:
        "Verification service temporarily unavailable. Please try again later.",
    };
  }
}
