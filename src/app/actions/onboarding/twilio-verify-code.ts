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


}
*** */

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
