type StepsState = {
  id: string;
  name: string;
  status: "complete" | "current" | "upcoming";
};

const steps: StepsState[] = [
  { id: "Step 1", name: "Create Profile", status: "current" },
  { id: "Step 2", name: "Verify Eligibility", status: "upcoming" },
  { id: "Step 3", name: "Create Schedule", status: "upcoming" },
  { id: "Step 4", name: "Pay Registration Fee", status: "upcoming" },
  {
    id: "Step 5",
    name: "Start Accepting Clients",
    status: "upcoming",
  },
];

export function OnboardingProgress() {
  return (
    <nav className="w-full" aria-label="Progress">
      <ol
        role="list"
        aria-label="Onboarding steps"
        className="space-y-4 md:grid md:grid-cols-5 md:gap-5 md:space-y-0 md:space-x-8"
      >
        {steps.map((step) => (
          <li key={step.name} className="md:flex-1">
            {step.status === "complete" ? (
              <div className="group flex flex-col border-l-4 border-primary py-2 pl-4 hover:border-primary/80 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                <span className="text-sm font-medium text-foreground">
                  {step.name}
                </span>
              </div>
            ) : step.status === "current" ? (
              <div
                aria-current="step"
                className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
              >
                <span className="text-sm font-medium text-foreground">
                  {step.name}
                </span>
              </div>
            ) : (
              <div className="group flex flex-col border-l-4 border-border py-2 pl-4 hover:border-border/80 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                <span className="text-sm font-medium text-muted-foreground">
                  {step.name}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
