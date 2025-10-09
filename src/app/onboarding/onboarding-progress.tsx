import { Check } from "lucide-react";

import {
  getProviderOnboardingFlowDAL,
  type ProviderOnboardingFlowStep,
} from "@/lib/dal/onboarding";
import type {
  ProviderOnboardingStepName,
  ProviderOnboardingStepStatus,
} from "@/types/onboarding";

type StepState = {
  id?: string;
  stepName: ProviderOnboardingStepName;
  stepDescription: string;
  status: ProviderOnboardingStepStatus;
  sortOrder: number;
};

const FALLBACK_STEPS: StepState[] = [
  {
    stepName: "Build Profile",
    stepDescription: "Add your info, services, and photos.",
    status: "current",
    sortOrder: 1,
  },
  {
    stepName: "Provider Activation Fee",
    stepDescription: "Helps cover the cost of verification & account setup.",
    status: "upcoming",
    sortOrder: 2,
  },
  {
    stepName: "Trust & Safety",
    stepDescription: "Verify your identity & submit the background check.",
    status: "upcoming",
    sortOrder: 3,
  },
];

const toStepState = (step: ProviderOnboardingFlowStep): StepState => ({
  id: step.id,
  stepName: step.stepName,
  stepDescription: step.stepDescription,
  status: step.status,
  sortOrder: step.sortOrder,
});

export async function OnboardingProgress() {
  const flowResult = await getProviderOnboardingFlowDAL();

  const steps =
    flowResult.success && flowResult.data.length > 0
      ? flowResult.data.map(toStepState)
      : FALLBACK_STEPS;

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden flex space-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.id ?? step.stepName} className="relative flex-1">
            {step.status === "complete" ? (
              <>
                <div className="group relative flex flex-col items-center">
                  <span className="flex h-9 items-center mb-2">
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-primary group-hover:bg-primary/80">
                      <Check
                        aria-hidden="true"
                        className="size-5 text-primary-foreground"
                      />
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col text-center">
                    <span className="text-sm font-medium text-foreground">
                      {step.stepName}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.stepDescription}
                    </span>
                  </span>
                </div>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute top-4 left-full -translate-x-1/2 w-full h-0.5 bg-primary z-0"
                  />
                ) : null}
              </>
            ) : step.status === "current" ? (
              <>
                <div
                  aria-current="step"
                  className="group relative flex flex-col items-center"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 items-center mb-2"
                  >
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="size-2.5 rounded-full bg-primary" />
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col text-center">
                    <span className="text-sm font-medium text-primary">
                      {step.stepName}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.stepDescription}
                    </span>
                  </span>
                </div>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute top-4 left-full -translate-x-1/2 w-full h-0.5 bg-border z-0"
                  />
                ) : null}
              </>
            ) : (
              <>
                <div className="group relative flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className="flex h-9 items-center mb-2"
                  >
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-border bg-background group-hover:border-border/80">
                      <span className="size-2.5 rounded-full bg-transparent group-hover:bg-border" />
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {step.stepName}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.stepDescription}
                    </span>
                  </span>
                </div>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute top-4 left-full -translate-x-1/2 w-full h-0.5 bg-border z-0"
                  />
                ) : null}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
