import { Check } from "lucide-react";

type StepsState = {
  id: string;
  name: string;
  description: string;
  status: "complete" | "current" | "upcoming";
};

const steps: StepsState[] = [
  {
    id: "Step 1",
    name: "Build Profile",
    description: "Add your info, services, and photos.",
    status: "current",
  },
  {
    id: "Step 2",
    name: "Trust & Safety",
    description: "Verify your identity & submit the background check.",
    status: "upcoming",
  },
  {
    id: "Step 3",
    name: "Onboarding Fee",
    description: "Pay your setup fee to go live.",
    status: "upcoming",
  },
];

export function OnboardingProgress() {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="overflow-hidden flex space-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative flex-1">
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
                      {step.name}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.description}
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
                      {step.name}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.description}
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
                      {step.name}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {step.description}
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
