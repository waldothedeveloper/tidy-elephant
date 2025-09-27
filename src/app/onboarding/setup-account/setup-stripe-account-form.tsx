"use client";

import { useState, useTransition } from "react";

import type { ApiResponse } from "@/types/api-responses";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  // const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!acknowledged || isPending) {
      return;
    }

    setError(null);
    // setLinkUrl(null);

    startTransition(async () => {
      const result = await onCreate();

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      // setLinkUrl(result.data.url);
      window.location.assign(result.data.url);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/20 p-5">
        <div className="flex items-start gap-4">
          <Checkbox
            id="stripe-acknowledgement"
            checked={acknowledged}
            onCheckedChange={(value) => setAcknowledged(Boolean(value))}
            className="mt-0.5"
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
              className="text-sm text-muted-foreground"
            >
              I must complete all required fields in Stripe (identity, business
              details, bank account, and tax/taxpayer info). If I don’t finish
              or if verification fails, my Tidy Elephant onboarding and payouts
              will be paused until I resolve it. I consent to Stripe verifying
              my information and to Tidy Elephant using Stripe to process my
              payouts.
            </p>
          </div>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* {linkUrl && (
        <div className="space-y-2 rounded-xl bg-primary/5 p-5 text-sm">
          <p className="font-medium text-foreground">
            Stripe onboarding link ready.
          </p>
          <p className="text-muted-foreground">
            Follow the link below to complete the Stripe setup. We&apos;ll bring
            you back once everything is submitted.
          </p>
          <a
            href={linkUrl}
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            Open Stripe onboarding
            <ExternalLinkIcon className="size-4" />
          </a>
        </div>
      )} */}
    </div>
  );
}
