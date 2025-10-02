"use client";

import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { beginProviderOnboardingAction } from "@/app/actions/onboarding/begin-provider-onboarding-action";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const VERIFY_PHONE_PATH = "/onboarding/verify-phone";

export function BeginOnboardingButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBeginOnboarding = () => {
    startTransition(async () => {
      const result = await beginProviderOnboardingAction();

      if (!result.success) {
        return;
      }

      router.push(VERIFY_PHONE_PATH);
    });
  };

  return (
    <Button onClick={handleBeginOnboarding} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Please wait...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 size-4" />
        </>
      )}
    </Button>
  );
}
