import { useState } from "react";

export const useSharedProviderPhoneNumber = () => {
  const [sharedPhoneNumber, setSharedPhoneNumber] = useState(null);

  const updatePhoneNumber = (phoneNumber) => {
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
