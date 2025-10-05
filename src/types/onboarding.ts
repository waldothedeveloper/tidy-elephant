export type ProviderOnboardingStepName =
  | "Build Profile"
  | "Trust & Safety"
  | "Onboarding Fee";

export type ProviderOnboardingStepStatus =
  | "complete"
  | "current"
  | "upcoming";

export type ProviderOnboardingFlowMutationResult =
  | { success: true; message: string }
  | { success: false; error: string };
