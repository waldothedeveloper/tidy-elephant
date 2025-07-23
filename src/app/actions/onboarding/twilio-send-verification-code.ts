"use server";

/* ***
=== SERVER ACTION SECURITY RULES ===
COPY/PASTE THIS TO ALL SERVER ACTIONS:

1. ✅ NEVER THROW EXCEPTIONS - Always return error objects
   WHY: Thrown exceptions bypass security checks like rate limiting and expose internal stack traces

2. ✅ AUTHENTICATE FIRST - Check auth before any logic
   WHY: Prevents unauthorized users from consuming resources or accessing data

3. ✅ VALIDATE ALL INPUTS - Use safeParse(), never parse()
   WHY: parse() throws exceptions (breaks rule #1), safeParse() returns validation results safely

4. ✅ SANITIZE INPUTS - Clean data before validation
   WHY: Removes malicious characters, normalizes data, prevents injection attacks

5. ✅ RATE LIMIT EARLY - Check limits before expensive operations
   WHY: Prevents abuse, protects external APIs (like Twilio), reduces server costs

6. ✅ TRY/CATCH EVERYTHING - Wrap all external calls
   WHY: Third-party services can fail unexpectedly, prevents application crashes

7. ✅ LOG ERRORS SAFELY - Never expose internal details to client
   WHY: Internal errors reveal system architecture to attackers, helps debugging without security risk

8. ✅ RETURN CONSISTENT TYPES - Always same interface structure
   WHY: Frontend can handle responses predictably, prevents runtime TypeScript errors

9. ✅ USE GENERIC ERROR MESSAGES - Don't leak validation details
   WHY: Specific validation errors help attackers understand your system structure

10. ✅ CHECK PERMISSIONS - Verify user can perform this action
    WHY: Authentication ≠ Authorization. User might be logged in but lack permission for specific actions

11. ✅ USE ENVIRONMENT VARIABLES - Never hardcode sensitive data
    WHY: Environment variables keep secrets out of source code, allows different configs for dev/staging
    Use process.env.VARIABLE_NAME to access them
    Example: process.env.TWILIO_API_KEY
    Make sure to set these in your .env files or deployment environment
*** */

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
