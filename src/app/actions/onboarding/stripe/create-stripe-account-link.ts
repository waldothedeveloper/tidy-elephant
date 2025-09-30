"use server";

import type Stripe from "stripe";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { stripe } from "@/lib/stripe/index";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

type CreateStripeAccountLinkResult = ApiResponse<{
  accountLink: Stripe.AccountLink;
}>;

const buildStripeUrl = (env: string, urlType: "refresh" | "return") => {
  if (env === "development") {
    return urlType === "refresh"
      ? "http://localhost:3000/onboarding/refresh"
      : "http://localhost:3000/onboarding/return";
  }

  return urlType === "refresh"
    ? "https://tidyelephant.com/onboarding/refresh"
    : "https://tidyelephant.com/onboarding/return";
};

export const createStripeAccountLink = async (
  accountId: string
): Promise<CreateStripeAccountLinkResult> => {
  try {
    await enforceAuthProvider();
  } catch {
    return createErrorResponse({
      message: "Authentication required. Please sign in and try again.",
    });
  }

  try {
    if (!accountId) {
      return createErrorResponse({
        message: "A Stripe account ID is required to continue.",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: buildStripeUrl(process.env.NODE_ENV, "refresh"),
      return_url: buildStripeUrl(process.env.NODE_ENV, "return"),
      type: "account_onboarding",
      collection_options: {
        fields: "eventually_due",
      },
    });

    return createSuccessResponse({ accountLink });
  } catch (error) {
    console.error("Failed to create Stripe account link", error);

    return createErrorResponse({
      message:
        "Something went wrong trying to create a redirect URL for your account. Try again, or contact support if this issue persists.",
    });
  }
};
