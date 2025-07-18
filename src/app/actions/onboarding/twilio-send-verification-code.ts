"use server";

import { sendTwilioVerificationCodeDAL } from "@/lib/dal";
import { e164PhoneNumberSchema } from "@/lib/schemas";
import { z } from "zod";

export async function twilioSendVerificationCodeAction(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
) {
  if (!phoneNumber) {
    throw new Error("Phone number is required to send verification code.");
  }

  const parsed = e164PhoneNumberSchema.safeParse({ phoneNumber });
  if (!parsed.success) {
    throw new Error(
      "The provided phone number is not valid. " + parsed.error.message
    );
  }

  const res = await sendTwilioVerificationCodeDAL(parsed.data.phoneNumber);

  return res;
}
