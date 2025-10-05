"use server";

import { addClerkProviderMetadataDAL } from "@/lib/dal/clerk";
import { initializeProviderOnboardingFlowDAL } from "@/lib/dal/onboarding";
import { auth } from "@clerk/nextjs/server";

interface BeginProviderOnboardingResult {
  success: boolean;
  message?: string;
  error?: string;
  retryAfter?: number;
}

export async function beginProviderOnboardingAction(): Promise<BeginProviderOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  try {
    const result = await addClerkProviderMetadataDAL();

    if (!result.success) {
      return {
        success: false,
        error: "Unable to begin onboarding process. Please try again.",
      };
    }

    const onboardingFlowResult = await initializeProviderOnboardingFlowDAL();

    if (!onboardingFlowResult.success) {
      return {
        success: false,
        error: "Failed to set up onboarding steps. Please try again.",
      };
    }

    return {
      success: true,
      message: "Provider onboarding started successfully.",
    };
  } catch (error) {
    console.error("Begin provider onboarding error:", error);

    return {
      success: false,
      error:
        "Onboarding service temporarily unavailable. Please try again later.",
    };
  }
}
