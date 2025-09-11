"use server";

import * as v from "valibot";

import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";

import { Duration } from "@upstash/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { e164USPhoneNumberSchema } from "@/lib/schemas/phone-verification-schemas";
import { sendTwilioVerificationCodeDAL } from "@/lib/dal/twilio";

interface SendVerificationResult {
  success: boolean;
  sent?: boolean;
  error?: string;
  retryAfter?: number;
}

export async function twilioSendVerificationCodeAction(
  phoneNumber: string | null
): Promise<SendVerificationResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  const phoneValidation = v.safeParse(e164USPhoneNumberSchema, { phoneNumber });

  if (!phoneValidation.success) {
    return {
      success: false,
      error:
        "Invalid phone number format. Please try again or verify the the phone number",
    };
  }

  const sendVerificationLimits = getActionRateLimits("send-verification");

  const rateLimitResult = await rateLimiter(
    `send-verification:${userId}:${phoneValidation.output.phoneNumber}`,
    sendVerificationLimits.attempts,
    sendVerificationLimits.window as Duration
  );

  const dailyLimitResult = await rateLimiter(
    `send-verification-daily:${userId}:${phoneValidation.output.phoneNumber}`,
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

  try {
    const result = await sendTwilioVerificationCodeDAL(
      phoneValidation.output.phoneNumber
    );

    return result;
  } catch (error) {
    console.error("Send verification error:", error);

    return {
      success: false,
      error:
        "Verification service temporarily unavailable. Please try again later.",
    };
  }
}
