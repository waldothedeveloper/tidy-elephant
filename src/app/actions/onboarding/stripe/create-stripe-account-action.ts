"use server";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { stripe } from "@/lib/stripe/index";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

export type CreateStripeAccountResult = ApiResponse<{ accountId: string }>;

export const createStripeAccountAction = async (): Promise<CreateStripeAccountResult> => {
  try {
    await enforceAuthProvider();
  } catch {
    return createErrorResponse({
      message: "Authentication required. Please sign in and try again.",
    });
  }

  try {
    const account = await stripe.accounts.create({
      controller: {
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
        stripe_dashboard: {
          type: "express",
        },
      },
    });

    return createSuccessResponse({ accountId: account.id });
  } catch (error) {
    console.error("Failed to create Stripe account", error);

    return createErrorResponse({
      message:
        "Something went wrong when creating your Stripe account. Try again, or contact support if this issue persists.",
    });
  }
};
