"use server";

import type Stripe from "stripe";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { getProviderStripeAccountDAL } from "@/lib/dal/onboarding";
import { stripe } from "@/lib/stripe/index";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

export type GetStripeAccountResult = ApiResponse<{
  account: Stripe.Account;
}>;

export const getStripeAccountAction =
  async (): Promise<GetStripeAccountResult> => {
    let stripeAccountId: string | null;

    try {
      await enforceAuthProvider();
    } catch {
      return createErrorResponse({
        message: "Authentication required. Please sign in and try again.",
      });
    }

    try {
      stripeAccountId = await getProviderStripeAccountDAL();
    } catch {
      return createErrorResponse({
        message: "Authentication required. Please sign in and try again.",
      });
    }

    if (!stripeAccountId) {
      return createErrorResponse({
        message: "Stripe account not found. Please complete setup first.",
      });
    }

    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      return createSuccessResponse({ account });
    } catch (error) {
      console.error("Failed to retrieve Stripe account", error);

      return createErrorResponse({
        message:
          "We could not retrieve your Stripe account details. Please try again.",
      });
    }
  };
