import { e164PhoneNumberSchema } from "@/lib/schemas";
import { useState } from "react";
import { z } from "zod";

export const useSharedProviderPhoneNumber = () => {
  const [sharedPhoneNumber, setSharedPhoneNumber] = useState<
    z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
  >(null);

  const updatePhoneNumber = (
    phoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"]
  ) => {
    setSharedPhoneNumber(phoneNumber);
  };

  const clearPhoneNumber = () => {
    setSharedPhoneNumber(null);
  };

  return {
    sharedPhoneNumber,
    updatePhoneNumber,
    clearPhoneNumber,
  };
};
