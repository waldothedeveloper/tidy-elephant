"use client";

import { useSharedProviderPhoneNumber } from "./useSharedProviderPhoneNumber";
import { VerifyProviderPhone } from "./verify-provider-phone";
import { VerifyProviderPhoneSMSCode } from "./verify-provider-sms-code";

export default function PhoneVerificationWrapper() {
  const { sharedPhoneNumber, updatePhoneNumber, clearPhoneNumber } =
    useSharedProviderPhoneNumber();

  if (!sharedPhoneNumber) {
    return <VerifyProviderPhone updatePhoneNumber={updatePhoneNumber} />;
  } else {
    return (
      <VerifyProviderPhoneSMSCode
        sharedPhoneNumber={sharedPhoneNumber}
        clearPhoneNumber={clearPhoneNumber}
      />
    );
  }
}
