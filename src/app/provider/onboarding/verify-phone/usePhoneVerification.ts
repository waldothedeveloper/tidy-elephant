import { useCallback, useRef, useState } from "react";

import { formatPhoneNumber } from "@/app/utils";
import { lookupTwilioPhoneNumberAction } from "@/app/actions/onboarding/twilio-lookup-phone";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { userProfilePhoneVerificationSchema } from "@/lib/schemas/index";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type PhoneVerificationState =
  | { step: "idle" }
  | { step: "validating-phone" }
  | { step: "phone-invalid"; error: string }
  | { step: "phone-valid" };

type TwilioVerifyType = {
  message: string;
  verified?: boolean;
};
export function usePhoneVerification(
  updatePhoneNumber: (phoneNumber: string) => void
) {
  const [verificationState, setVerificationState] =
    useState<PhoneVerificationState>({
      step: "idle",
    });

  const phoneVerificationForm = useForm<
    z.infer<typeof userProfilePhoneVerificationSchema>
  >({
    resolver: zodResolver(userProfilePhoneVerificationSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  // Client-side cache for phone number validation
  const phoneValidationCache = useRef<
    Map<string, { success: boolean; error?: string }>
  >(new Map());

  const handlePhoneChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      const e164Formatted = formatted.replace(/\D/g, "");

      // Always update the phoneVerificationForm value first to maintain proper binding
      phoneVerificationForm.setValue("phoneNumber", formatted, {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Reset to idle when phone number changes
      setVerificationState({ step: "idle" });

      // Auto-validate with Twilio Lookup API v2 when it's complete (10 digits)
      if (e164Formatted.length === 10) {
        const phoneNumber = `+1${e164Formatted}`;
        const cached = phoneValidationCache.current.get(phoneNumber);

        if (cached) {
          // If cached result exists, use it
          if (cached.success) {
            setVerificationState({ step: "phone-valid" });
            return;
          } else {
            // If cached result is an error, show it
            setVerificationState({
              step: "phone-invalid",
              error: cached.error || "Cached phone number validation failed",
            });
            setTimeout(() => {
              phoneVerificationForm.setError("phoneNumber", {
                type: "manual",
                message:
                  cached.error ||
                  "Your phone number is invalid. Please try again.",
              });
            }, 0);

            return;
          }
        } else {
          // If no cached result exists, perform a lookup
          const lookUpValidationResponse: Promise<TwilioVerifyType | Error> =
            new Promise(async (resolve, reject) => {
              try {
                const res = await lookupTwilioPhoneNumberAction({
                  phoneNumber,
                });

                if (!res.success) {
                  throw new Error(res.error || "Phone number lookup failed");
                } else {
                  // Cache successful result
                  phoneValidationCache.current.set(phoneNumber, {
                    success: true,
                  });
                  setVerificationState({ step: "phone-valid" });
                  resolve({ message: "Your phone number is valid!" });
                }
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "An unknown error occurred trying to validate phone number";

                // Cache error result
                phoneValidationCache.current.set(phoneNumber, {
                  success: false,
                  error: errorMessage,
                });

                setVerificationState({
                  step: "phone-invalid",
                  error: errorMessage,
                });
                phoneVerificationForm.setError("phoneNumber", {
                  type: "manual",
                  message:
                    errorMessage ||
                    "Your phone number is invalid. Please try again.",
                });
                reject(new Error(`${errorMessage}`));
              }
            });

          toast.promise(lookUpValidationResponse, {
            loading: "Validating phone number...",
            success: (data) => data.message,
            error: (error) => `${error.message}`,
          });
        }
      }
    },
    [phoneVerificationForm, setVerificationState]
  );

  async function onSubmit(
    values: z.infer<typeof userProfilePhoneVerificationSchema>
  ) {
    const phoneNumber = values.phoneNumber.replace(/\D/g, "");
    if (phoneNumber.length !== 10) {
      phoneVerificationForm.setError("phoneNumber", {
        type: "manual",
        message: "Phone number must be exactly 10 digits",
      });
      return;
    }
    updatePhoneNumber(`+1${phoneNumber}`);
    // send the actual verification code
  }

  const canSubmit = verificationState.step === "phone-valid";

  return {
    phoneVerificationForm,
    verificationState,
    handlePhoneChange,
    onSubmit,
    canSubmit,
  };
}
