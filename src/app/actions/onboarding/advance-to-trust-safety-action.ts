"use server";

import { advanceProviderOnboardingToTrustSafetyDAL } from "@/lib/dal/onboarding";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

type AdvanceOnboardingResponse = ApiResponse<{ message: string }>;

export async function advanceToTrustSafetyAction(): Promise<AdvanceOnboardingResponse> {
  try {
    const result = await advanceProviderOnboardingToTrustSafetyDAL();

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
