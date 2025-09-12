"use server";

import * as v from "valibot";

import {
  e164PhoneNumberSchema,
  lookupTwilioPhoneNumberDAL,
} from "@/lib/dal/twilio";

import { auth } from "@clerk/nextjs/server";

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
