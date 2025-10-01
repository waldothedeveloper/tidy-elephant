"use server";

import { createStripeAccountAction } from "@/app/actions/onboarding/stripe/create-stripe-account-action";
import { createStripeAccountLink } from "@/app/actions/onboarding/stripe/create-stripe-account-link";
import {
  getProviderStripeAccountDAL,
  saveProviderStripeAccountDAL,
} from "@/lib/dal/onboarding";
import { deleteStripeAccount } from "@/lib/stripe";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

export const createStripeOnboardingSession = async (): Promise<
  ApiResponse<{ accountId: string; url: string }>
> => {
  let existingAccountId: string | null;

  try {
    existingAccountId = await getProviderStripeAccountDAL();
  } catch {
    return createErrorResponse({
      message: "Authentication required. Please sign in and try again.",
    });
  }

  if (existingAccountId) {
    const accountLinkResult = await createStripeAccountLink(existingAccountId);

    if (!accountLinkResult.success) {
      return accountLinkResult;
    }

    return createSuccessResponse({
      accountId: existingAccountId,
      url: accountLinkResult.data.accountLink.url,
    });
  }

  const accountResult = await createStripeAccountAction();

  if (!accountResult.success) {
    return accountResult;
  }

  const saveResult = await saveProviderStripeAccountDAL(
    accountResult.data.accountId
  );

  if (!saveResult.success) {
    try {
      const deletedStripeAcc = await deleteStripeAccount(
        accountResult.data.accountId
      );

      if (deletedStripeAcc.deleted) {
        return createErrorResponse({
          message:
            "We were unable to save your Stripe account details in our databases. Please try again or contact support if the issue persists.",
        });
      }

      return createErrorResponse({
        message:
          "We were unable to save your Stripe account details in our databases. Please try again or contact support if the issue persists.",
      });
    } catch (error) {
      return createErrorResponse({
        message:
          "Something went wrong while trying to delete your Stripe account.",
      });
    }
  }

  const accountLinkResult = await createStripeAccountLink(
    accountResult.data.accountId
  );

  if (!accountLinkResult.success) {
    return accountLinkResult;
  }

  const onboardingUrl = accountLinkResult.data.accountLink.url;

  return createSuccessResponse({
    accountId: accountResult.data.accountId,
    url: onboardingUrl,
  });
};
