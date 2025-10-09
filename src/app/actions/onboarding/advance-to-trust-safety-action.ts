"use server";

import {
  advanceProviderOnboardingToTrustSafetyDAL,
  type ProviderOnboardingStepUpdateInput,
} from "@/lib/dal/onboarding";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

type AdvanceOnboardingResponse = ApiResponse<{ message: string }>;

type AdvanceToTrustSafetyActionOptions = {
  updates?: ProviderOnboardingStepUpdateInput[];
};

const defaultStepUpdates: ProviderOnboardingStepUpdateInput[] = [
  { stepName: "Provider Activation Fee", status: "complete" },
  { stepName: "Trust & Safety", status: "current" },
];

export async function advanceToTrustSafetyAction(
  options: AdvanceToTrustSafetyActionOptions = {}
): Promise<AdvanceOnboardingResponse> {
  try {
    const updates = options.updates ?? defaultStepUpdates;

    const result = await advanceProviderOnboardingToTrustSafetyDAL({
      updates,
    });

    if (!result.success) {
      return createErrorResponse({
        message: result.error,
      });
    }

    return createSuccessResponse({
      message: result.message,
    });
  } catch (error) {
    console.error("advanceToTrustSafetyAction error:", error);
    return createErrorResponse({
      message: "Unable to update onboarding progress. Please try again.",
    });
  }
}
