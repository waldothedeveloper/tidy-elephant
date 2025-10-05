"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { advanceToTrustSafetyAction } from "@/app/actions/onboarding/advance-to-trust-safety-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ContinueOnboardingButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleGoToBackGroundCheckStep = () => {
    startTransition(async () => {
      const result = await advanceToTrustSafetyAction();

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.data.message);
      router.push("/onboarding/background-check");
    });
  };

  return (
    <Button
      size="lg"
      disabled={isPending}
      onClick={handleGoToBackGroundCheckStep}
    >
      {isPending ? (
        <>
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          Updating progress...
        </>
      ) : (
        "Continue Onboarding"
      )}
    </Button>
  );
}
