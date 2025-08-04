"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useCodeVerification } from "./useCodeVerification";

export function VerifyProviderPhoneSMSCode({
  clearPhoneNumber,
  sharedPhoneNumber,
}: {
  clearPhoneNumber: () => void;
  sharedPhoneNumber;
}) {
  const {
    codeVerificationForm,
    step,
    handleCodeChange,
    resendCode,
    onSubmit,
    canSubmit,
    timeLeft,
    canResend,
    formatTime,
    maxAttemptsReached,
  } = useCodeVerification(clearPhoneNumber, sharedPhoneNumber);

  const inputClassNames =
    step === "code-invalid" ? "border-b-2 border-destructive" : "";

  // Get the last 4 digits of the phone number for display
  const maskedPhone = sharedPhoneNumber
    ? `******${sharedPhoneNumber.slice(-4)}`
    : "******0000";

  return (
    <Form {...codeVerificationForm}>
      <form onSubmit={codeVerificationForm.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-between gap-x-6">
            <Button asChild variant="outline">
              <Link href="/onboarding/basic-info" type="button">
                Previous
              </Link>
            </Button>

            <Button
              asChild
              disabled={!canSubmit}
              variant={!canSubmit ? "outline" : "default"}
              type="button"
            >
              <Link href={canSubmit ? "/onboarding/select-categories" : "#"}>
                Submit & Next Step
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
          <div className="pb-12">
            <span className="mt-2 text-sm text-muted-foreground">
              Create Profile
            </span>
            <h2 className="text-3xl font-semibold text-foreground">
              Great, now let&apos;s verify your phone number
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
              To ensure the security of your account, please verify your phone
              number. This will help us keep your account safe and allow you to
              receive important notifications.
            </p>
          </div>

          <div className="space-y-12">
            <div className="border-b border-border pb-12">
              <div className="mt-10 flex flex-col items-start gap-y-8">
                <div className="w-2/3">
                  <FormField
                    control={codeVerificationForm.control}
                    name="verificationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <InputOTP
                              disabled={
                                step === "sending-code" ||
                                step === "verifying-code" ||
                                step === "code-verified"
                              }
                              maxLength={6}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                handleCodeChange(value);
                              }}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot
                                  index={0}
                                  className={inputClassNames}
                                />
                                <InputOTPSlot
                                  index={1}
                                  className={inputClassNames}
                                />
                                <InputOTPSlot
                                  index={2}
                                  className={inputClassNames}
                                />
                                <InputOTPSlot
                                  index={3}
                                  className={inputClassNames}
                                />
                                <InputOTPSlot
                                  index={4}
                                  className={inputClassNames}
                                />
                                <InputOTPSlot
                                  index={5}
                                  className={inputClassNames}
                                />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          {step === "code-verified" && (
                            <CircleCheckBig className="size-6 text-primary ml-1" />
                          )}
                        </div>
                        <FormMessage />
                        {step === "code-verified" && (
                          <p className="text-sm text-primary font-medium mt-1">
                            Code verified successfully!
                          </p>
                        )}
                        <FormDescription>
                          Enter the 6-digit confirmation code we sent to your
                          phone ending with {maskedPhone}. <br /> You can also
                          <Button
                            type="button"
                            variant="link"
                            onClick={clearPhoneNumber}
                            className="px-1 py-0"
                          >
                            change your phone number
                          </Button>
                          if needed.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="-ml-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resendCode}
                    disabled={
                      !canResend ||
                      maxAttemptsReached ||
                      step === "sending-code" ||
                      step === "verifying-code" ||
                      step === "code-verified"
                    }
                  >
                    {maxAttemptsReached
                      ? "Maximum attempts reached"
                      : !canResend && timeLeft > 0
                        ? `Resend in ${formatTime(timeLeft)}`
                        : "Resend Verification Code"}
                  </Button>
                  {maxAttemptsReached && (
                    <p className="text-sm text-destructive mt-2">
                      You&apos;ve reached the maximum number of resend attempts.
                      Please contact support or try again later.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
