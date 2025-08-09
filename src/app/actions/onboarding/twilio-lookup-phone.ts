"use server";

import {
  e164PhoneNumberSchema,
  lookupTwilioPhoneNumberDAL,
} from "@/lib/dal/twilio";
import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";
import { auth } from "@clerk/nextjs/server";
import { type Duration } from "@upstash/ratelimit";
import * as v from "valibot";

interface LookupResult {
  success: boolean;
  phoneLineType?: string;
  e164Format?: string;
  message?: string;
  error?: string;
  retryAfter?: number;
}

export async function lookupTwilioPhoneNumberAction(
  phoneNumber: string
): Promise<LookupResult> {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  // 2. Input validation with sanitization - NO THROWING
  const sanitizedPhoneNumber = phoneNumber?.toString().trim();

  if (!sanitizedPhoneNumber) {
    return {
      success: false,
      error: "Phone number is required.",
    };
  }

  const phoneValidation = v.safeParse(
    e164PhoneNumberSchema,
    sanitizedPhoneNumber
  );
  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format.",
    };
  }

  // 3. Rate limiting - Phone lookup attempts (using lookup-specific limits)
  const lookupLimits = getActionRateLimits("lookup");

  const rateLimitResult = await rateLimiter(
    `lookup-phone:${userId}`,
    lookupLimits.attempts,
    lookupLimits.window as Duration
  );

  const dailyLimitResult = await rateLimiter(
    `lookup-daily:${userId}`,
    lookupLimits.dailyAttempts,
    lookupLimits.dailyWindow as Duration
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

  // 4. Perform phone lookup with error handling
  try {
    const result = await lookupTwilioPhoneNumberDAL(phoneValidation.output);

    if (result.success) {
      return {
        success: true,
        phoneLineType: result.phoneLineType,
        e164Format: result.e164Format,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.message,
      };
    }
  } catch (error) {
    console.error("Twilio phone lookup error:", error);
    return {
      success: false,
      error:
        "Phone lookup service temporarily unavailable. Please try again later.",
    };
  }
}
