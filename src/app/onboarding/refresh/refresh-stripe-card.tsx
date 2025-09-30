"use client";

import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/types/api-responses";

type StripeRefreshLinkResult = ApiResponse<{ url: string }>;

type RefreshStripeCardProps = {
  onRequestLink: () => Promise<StripeRefreshLinkResult>;
};

export function RefreshStripeCard({ onRequestLink }: RefreshStripeCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await onRequestLink();

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      window.location.assign(result.data.url);
    });
  };

  return (
    <div className="space-y-8 rounded-3xl">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Looks Like This Link Took a Nap
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Don’t worry—Stripe links sometimes expire faster than milk in the sun.
          We’ll get you a fresh one
        </h1>
        <p className="text-base leading-7 text-foreground">
          Hit the button below and we’ll whisk you back to Stripe to pick up
          where you left off. Any info you’ve already filled out is safe. You
          won’t have to start from scratch.
        </p>
      </div>
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="inline-flex items-center gap-2"
        >
          {isPending ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcwIcon className="size-4" aria-hidden="true" />
          )}
          Resume with Stripe
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
