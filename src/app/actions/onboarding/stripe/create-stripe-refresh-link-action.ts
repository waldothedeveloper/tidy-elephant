"use server";

import { createStripeAccountLink } from "@/app/actions/onboarding/stripe/create-stripe-account-link";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { getProviderStripeAccountDAL } from "@/lib/dal/onboarding";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

type StripeRefreshLinkResult = ApiResponse<{ url: string }>;

export const createStripeRefreshLinkAction =
  async (): Promise<StripeRefreshLinkResult> => {
    try {
      await enforceAuthProvider();
    } catch {
      return createErrorResponse({
        message: "Authentication required. Please sign in and try again.",
      });
    }

    try {
      const stripeAccountId = await getProviderStripeAccountDAL();

      if (!stripeAccountId) {
        return createErrorResponse({
          message:
            "We could not find a Stripe account connected to your profile. Please restart your Stripe onboarding.",
        });
      }

      const linkResult = await createStripeAccountLink(stripeAccountId);

      if (!linkResult.success) {
        return linkResult;
      }

      return createSuccessResponse({ url: linkResult.data.accountLink.url });
    } catch (error) {
      console.error("Failed to generate Stripe refresh link", error);

      return createErrorResponse({
        message:
          "Unable to generate a new Stripe onboarding link at the moment. Please try again later.",
      });
    }
  };
