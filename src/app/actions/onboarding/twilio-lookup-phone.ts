"use server";

import { lookupTwilioPhoneNumberDAL } from "@/lib/dal";
import { e164PhoneNumberSchema } from "@/lib/schemas/index";
import { z } from "zod";

export async function lookupTwilioPhoneNumberAction(
  phoneNumber: z.infer<typeof e164PhoneNumberSchema>
) {
  const parsed = e164PhoneNumberSchema.safeParse(phoneNumber);

  if (!parsed.success) {
    throw new Error(
      "The provided phone number is not valid. " + parsed.error.message
    );
  }
  const res = await lookupTwilioPhoneNumberDAL(parsed.data.phoneNumber);
  return res;
}
