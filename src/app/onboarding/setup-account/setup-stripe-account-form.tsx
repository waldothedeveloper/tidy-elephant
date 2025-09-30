"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ApiResponse } from "@/types/api-responses";
import { Loader2Icon } from "lucide-react";

type StripeOnboardingPayload = {
  accountId: string;
  url: string;
};

type SetupStripeAccountFormProps = {
  onCreate: () => Promise<ApiResponse<StripeOnboardingPayload>>;
};

export function SetupStripeAccountForm({
  onCreate,
}: SetupStripeAccountFormProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!acknowledged || isPending) {
      return;
    }

    setError(null);
    setLinkUrl(null);

    startTransition(async () => {
      const result = await onCreate();

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setLinkUrl(result.data.url);
      window.location.assign(result.data.url);
    });
  };

  return (
    <>
      {!linkUrl ? (
        <div className="bg-background px-4 py-16 sm:px-6 lg:px-8 min-h-dvh">
          <div className="mx-auto max-w-3xl space-y-12 text-muted-foreground">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Setup Account
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Your Profile Starts Here
              </h1>
              <p className="text-base leading-7 text-foreground">
                Stripe is where you’ll set up the account that actually pays
                you. Think of it as your digital wallet—but with stricter
                parents. By law, they need some paperwork (identity, banking
                details, business info, etc.). Do it once, do it right, and
                you’ll be ready to get paid.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  id="stripe-acknowledgement"
                  checked={acknowledged}
                  onCheckedChange={(value) => setAcknowledged(Boolean(value))}
                  aria-describedby="stripe-acknowledgement-description"
                />
                <div className="space-y-1.5">
                  <Label
                    htmlFor="stripe-acknowledgement"
                    className="text-base text-foreground"
                  >
                    I’ve read and understand these onboarding requirements.
                  </Label>
                  <p
                    id="stripe-acknowledgement-description"
                    className="text-sm dark:text-foreground/70"
                  >
                    To receive payouts through Tidy Elephant, I must complete
                    all required fields in Stripe (identity verification,
                    business details, bank account, and tax information). I
                    consent to Stripe securely verifying my information and to
                    Tidy Elephant using Stripe as the payment processor for my
                    payouts.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleContinue}
                disabled={!acknowledged || isPending}
                className="w-full sm:w-auto"
              >
                {isPending && <Loader2Icon className="size-4 animate-spin" />}
                Continue to Stripe
              </Button>
              <p className="text-xs -mt-4 max-w-xs">
                (Complete it once, and you’re all set. No payouts until it’s
                done, but once it is—you’ll never have to think about it again.)
              </p>

              {error && (
                <p className="text-base text-destructive max-w-xs">{error}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-16 sm:px-6 lg:px-8 size-full flex items-center justify-center min-h-dvh">
          <p className="text-foreground text-center animate-pulse">
            You’ll be redirected to Stripe in just a moment. Fill out the
            required form (yes, it’s a little long, but it’s one-time only).
            When you’re done, Stripe will send you right back here so you can
            continue...
          </p>
        </div>
      )}
    </>
  );
}
