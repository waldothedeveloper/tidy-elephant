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

import { lookupTwilioPhoneNumberDAL } from "@/lib/dal";
import { e164PhoneNumberSchema } from "@/lib/schemas/index";
import { getActionRateLimits, rateLimiter } from "@/lib/upstash-rate-limiter";
import { auth } from "@clerk/nextjs/server";
import { type Duration } from "@upstash/ratelimit";
import { z } from "zod";

interface LookupResult {
  success: boolean;
  data?: {
    phoneNumber: string;
    countryCode?: string;
    carrier?: string;
    type?: string;
    valid?: boolean;
  };
  error?: string;
  retryAfter?: number;
}

export async function lookupTwilioPhoneNumberAction(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>
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
  const sanitizedPhoneNumber = {
    phoneNumber: phoneNumber?.phoneNumber
      ?.toString()
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
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
    };
  }

  // 4. Perform phone lookup with error handling
  try {
    const result = await lookupTwilioPhoneNumberDAL(
      phoneValidation.data.phoneNumber
    );
    return result;
  } catch (error) {
    console.error("Twilio phone lookup error:", error);
    return {
      success: false,
      error:
        "Phone lookup service temporarily unavailable. Please try again later.",
    };
  }
}
