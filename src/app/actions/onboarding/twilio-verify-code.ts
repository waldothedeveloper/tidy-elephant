"use server";

import {
  e164PhoneNumberSchema,
  userProfileCodeVerificationSchema,
} from "@/lib/schemas";

import { verifyTwilioCodeDAL } from "@/lib/dal";
import { z } from "zod";

export async function twilioVerifyCodeAction(
  code: z.infer<typeof userProfileCodeVerificationSchema>["verificationCode"],
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
) {
  const parsedCode =
    userProfileCodeVerificationSchema.shape.verificationCode.safeParse(code);
  if (!parsedCode.success) {
    throw new Error(
      "The provided verification code is not valid. " + parsedCode.error.message
    );
  }

  if (!phoneNumber) {
    throw new Error("Phone number is required for verification.");
  }

  const parsedPhoneNumber = e164PhoneNumberSchema.safeParse({ phoneNumber });
  if (!parsedPhoneNumber.success) {
    throw new Error(
      "The provided phone number is not valid. " +
        parsedPhoneNumber.error.message
    );
  }

  const res = await verifyTwilioCodeDAL(
    parsedCode.data,
    parsedPhoneNumber.data.phoneNumber
  );

  return res;
}
