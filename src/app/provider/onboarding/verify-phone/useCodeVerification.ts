"use client";

import {
  e164PhoneNumberSchema,
  userProfileCodeVerificationSchema,
} from "@/lib/schemas/index";
import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "sonner";
import { twilioSendVerificationCodeAction } from "@/app/actions/onboarding/twilio-send-verification-code";
import { twilioVerifyCodeAction } from "@/app/actions/onboarding/twilio-verify-code";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type CodeVerificationState =
  | { step: "idle" }
  | { step: "sending-code" }
  | { step: "code-sent" }
  | { step: "verifying-code" }
  | { step: "code-invalid"; error: string }
  | { step: "code-verified" };

export function useCodeVerification(
  clearPhoneNumber: () => void,
  sharedPhoneNumber: z.infer<typeof e164PhoneNumberSchema>["phoneNumber"] | null
) {
  const router = useRouter();
  const [codeVerificationState, setCodeVerificationState] =
    useState<CodeVerificationState>({
      step: "idle",
    });

  const step = codeVerificationState.step;

  const codeVerificationForm = useForm<
    z.infer<typeof userProfileCodeVerificationSchema>
  >({
    resolver: zodResolver(userProfileCodeVerificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  // Step 1: Send verification code when component mounts
  useEffect(() => {
    const sendInitialCode = async () => {
      if (sharedPhoneNumber && step === "idle") {
        setCodeVerificationState({ step: "sending-code" });
        codeVerificationForm.clearErrors("verificationCode");

        try {
          const response =
            await twilioSendVerificationCodeAction(sharedPhoneNumber);
          if (response.success) {
            setCodeVerificationState({ step: "code-sent" });
            toast.success("Verification code sent to your phone!");
          } else {
            setCodeVerificationState({
              step: "code-invalid",
              error: response.error || "Failed to send verification code",
            });
            codeVerificationForm.setError("verificationCode", {
              type: "manual",
              message: response.error || "Failed to send verification code",
            });
            toast.error("Failed to send verification code. Please try again.");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          setCodeVerificationState({
            step: "code-invalid",
            error: errorMessage,
          });
          toast.error("Failed to send verification code. Please try again.");
          codeVerificationForm.setError("verificationCode", {
            type: "manual",
            message: errorMessage,
          });
        }
      }
    };

    sendInitialCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedPhoneNumber, step]);

  const codeVerificationCache = useRef<
    Map<string, { success: boolean; error?: string }>
  >(new Map());

  const handleCodeChange = useCallback(
    async (value: string) => {
      codeVerificationForm.setValue("verificationCode", value, {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Step 2: Verify the code when 6 digits are entered
      if (value.length === 6) {
        setCodeVerificationState({ step: "verifying-code" });

        // Check if this invalid code has been tried before
        const cachedInvalidCode = codeVerificationCache.current.get(value);
        if (cachedInvalidCode && !cachedInvalidCode.success) {
          // This code was already tried and was invalid - don't hit API again
          setCodeVerificationState({
            step: "code-invalid",
            error:
              "You already entered this code and it was invalid. Please try a different code.",
          });

          toast.error(
            "You already entered this code and it was invalid. Please try a different code."
          );
          // this is such a funny hack!
          setTimeout(() => {
            codeVerificationForm.setError("verificationCode", {
              type: "manual",
              message:
                "You already entered this code and it was invalid. Please try a different code.",
            });
          }, 0);
          return; // Exit early - don't make API call
        }

        try {
          const response = await twilioVerifyCodeAction(
            value,
            sharedPhoneNumber
          );

          if (response.success) {
            // DON'T cache successful codes - just proceed
            setCodeVerificationState({ step: "code-verified" });
            toast.success("Phone number verified successfully!");
            //! *** navigate to next step automatically ***
            router.push("/provider/onboarding/create-schedule");
          } else {
            // ONLY cache invalid codes
            const errorMsg = response.error || "Invalid verification code";
            codeVerificationCache.current.set(value, {
              success: false,
              error: errorMsg,
            });

            setCodeVerificationState({
              step: "code-invalid",
              error: errorMsg,
            });
            codeVerificationForm.setError("verificationCode", {
              type: "manual",
              message: errorMsg,
            });
            toast.error("Invalid verification code. Please try again.");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

          // Cache API errors as invalid codes too
          codeVerificationCache.current.set(value, {
            success: false,
            error: errorMessage,
          });

          setCodeVerificationState({
            step: "code-invalid",
            error: errorMessage,
          });
          codeVerificationForm.setError("verificationCode", {
            type: "manual",
            message: errorMessage,
          });
          toast.error("Failed to verify code. Please try again.");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sharedPhoneNumber]
  );

  const resendCode = useCallback(async () => {
    setCodeVerificationState({ step: "sending-code" });
    codeVerificationForm.setValue("verificationCode", "");

    try {
      const response =
        await twilioSendVerificationCodeAction(sharedPhoneNumber);
      if (response.success) {
        setCodeVerificationState({ step: "code-sent" });
        toast.success("New verification code sent to your phone!");
      } else {
        setCodeVerificationState({
          step: "code-invalid",
          error: response.error || "Failed to resend verification code",
        });
        codeVerificationForm.setError("verificationCode", {
          type: "manual",
          message: response.error || "Failed to resend verification code",
        });
        toast.error("Failed to resend verification code. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setCodeVerificationState({
        step: "code-invalid",
        error: errorMessage,
      });
      codeVerificationForm.setError("verificationCode", {
        type: "manual",
        message: errorMessage,
      });
      toast.error("Failed to resend verification code. Please try again.");
    }
  }, [sharedPhoneNumber, codeVerificationForm]);

  function onSubmit() {
    if (step === "code-verified") {
      clearPhoneNumber();
    }
    // TODO: It might be a good idea to navigate programmatically to the next onboarding step
  }

  const canSubmit = step === "code-verified";

  return {
    codeVerificationForm,
    step,
    handleCodeChange,
    resendCode,
    onSubmit,
    canSubmit,
  };
}
