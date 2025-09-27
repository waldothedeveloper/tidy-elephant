import type Stripe from "stripe";

import { CheckCircleIcon } from "lucide-react";

import { stripe } from "@/lib/stripe/index";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";
import { SetupStripeAccountForm } from "./setup-stripe-account-form";

function provideURL(env: string, urlType: "refresh" | "return") {
  if (env === "development") {
    return urlType === "refresh"
      ? "http://localhost:3000/onboarding/refresh"
      : "http://localhost:3000/onboarding/return";
  }

  return urlType === "refresh"
    ? "https://tidyelephant.com/onboarding/refresh"
    : "https://tidyelephant.com/onboarding/return";
}

const env = process.env.NODE_ENV ?? "development";

type CreateStripeAccountResult = ApiResponse<{ accountId: string }>;
type CreateStripeAccountLinkResult = ApiResponse<{
  accountLink: Stripe.AccountLink;
}>;
type StripeOnboardingResult = ApiResponse<{ accountId: string; url: string }>;

async function createStripeAccount(): Promise<CreateStripeAccountResult> {
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
}

async function createStripeAccountLink(
  accountID: string
): Promise<CreateStripeAccountLinkResult> {
  try {
    if (!accountID) {
      return createErrorResponse({
        message: "A Stripe account ID is required to continue.",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountID,
      refresh_url: provideURL(env, "refresh"),
      return_url: provideURL(env, "return"),
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
}

async function createStripeOnboardingSession(): Promise<StripeOnboardingResult> {
  "use server";

  const accountResult = await createStripeAccount();

  if (!accountResult.success) {
    return accountResult;
  }

  const accountLinkResult = await createStripeAccountLink(
    accountResult.data.accountId
  );

  if (!accountLinkResult.success) {
    return accountLinkResult;
  }

  const onboardingUrl = accountLinkResult.data.accountLink.url;

  // redirect(onboardingUrl);

  return createSuccessResponse({
    accountId: accountResult.data.accountId,
    url: onboardingUrl,
  });
}

export default function SetupStripeAccountPage() {
  return (
    <div className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-12 text-muted-foreground">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Step 1 · Account Setup
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Create your account
          </h1>
          <p className="text-base leading-7 text-foreground">
            To get paid through Tidy Elephant, you’ll need a Stripe account.
            Stripe is the secure payment platform we use to send you your
            earnings. When you click below, you’ll be taken to Stripe’s
            onboarding form. There, you’ll:
          </p>
          <div className="space-y-6 my-12">
            <ul role="list" className="space-y-6">
              <li className="flex gap-4">
                <CheckCircleIcon
                  aria-hidden="true"
                  className="mt-1 size-5 flex-none text-primary"
                />
                <span>
                  Create your Stripe account (or connect an existing one).
                </span>
              </li>
              <li className="flex gap-4">
                <CheckCircleIcon
                  aria-hidden="true"
                  className="mt-1 size-5 flex-none text-primary"
                />
                <span>Enter your personal and/or business details.</span>
              </li>
              <li className="flex gap-4">
                <CheckCircleIcon
                  aria-hidden="true"
                  className="mt-1 size-5 flex-none text-primary"
                />
                <span>
                  Add your bank account information so payouts can be deposited
                  directly.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-base leading-7 text-foreground">
            Stripe requires you to complete all of the requested information
            (identity verification, business details, banking info, etc.). If
            anything is left unfinished, your onboarding process will be
            delayed, and you won’t be able to receive payments until it’s
            complete. Once you finish this step, you’ll return to Tidy Elephant
            and continue the onboarding process.
          </p>
        </div>

        <SetupStripeAccountForm onCreate={createStripeOnboardingSession} />
      </div>
    </div>
  );
}
