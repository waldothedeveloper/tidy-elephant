"use server";

import * as v from "valibot";

import { sendTwilioVerificationCodeDAL } from "@/lib/dal/twilio";
import { e164USPhoneNumberSchema } from "@/lib/schemas/phone-verification-schemas";
import { auth } from "@clerk/nextjs/server";

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
