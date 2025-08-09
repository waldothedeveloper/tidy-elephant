import { useState } from "react";

export const useSharedProviderPhoneNumber = () => {
  const [sharedPhoneNumber, setSharedPhoneNumber] = useState<string | null>(
    null
  );

  const updatePhoneNumber = (phoneNumber: string) => {
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
