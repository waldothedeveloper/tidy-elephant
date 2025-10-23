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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePhoneVerification } from "./usePhoneVerification";

export function VerifyProviderPhone({
  updatePhoneNumber,
}: {
  updatePhoneNumber: (phoneNumber: string) => void;
}) {
  const {
    phoneVerificationForm,
    verificationState,
    handlePhoneChange,
    onSubmit,
    canSubmit,
  } = usePhoneVerification(updatePhoneNumber);

  return (
    <Form {...phoneVerificationForm}>
      <form onSubmit={phoneVerificationForm.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-end gap-x-6">
            {/* <Button asChild type="button" variant="outline">
              <Link href="/onboarding/basic-info" type="button">
                Previous
              </Link>
            </Button> */}

            <div className="flex items-center gap-x-4">
              <Button variant="outline" type="button" disabled>
                Submit & Next Step
              </Button>
            </div>
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
            <div className="pb-12">
              <div className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <FormField
                    control={phoneVerificationForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="(555) 123-4567"
                            className="mt-2"
                            inputMode="numeric"
                            onChange={handlePhoneChange}
                            maxLength={14}
                          />
                        </FormControl>
                        <p
                          className={`mt-0.5 text-sm ${
                            verificationState.step === "phone-valid"
                              ? "text-primary"
                              : verificationState.step === "phone-invalid"
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          {verificationState.step === "validating-phone" &&
                            " Validating..."}
                          {verificationState.step === "phone-valid" &&
                            " ✓ Valid phone number"}
                        </p>
                        <FormMessage />
                        <FormDescription>
                          Enter your phone number below to receive an SMS
                          verification code. Only USA 🇺🇸 phone numbers are
                          supported at this time.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="sm:col-span-1 flex justify-start items-start pt-8 ml-3">
                  <Button disabled={!canSubmit} type="submit">
                    Send Verification Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
