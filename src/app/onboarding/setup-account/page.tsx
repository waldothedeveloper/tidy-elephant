import { createStripeAccountLink } from "@/app/actions/onboarding/stripe/create-stripe-account-link";
import { createStripeOnboardingSession } from "@/app/actions/onboarding/stripe/create-stripe-onboarding-session-action";
import { getStripeAccountAction } from "@/app/actions/onboarding/stripe/get-stripe-account-action";
import { getStripeAccountRequirementStatus } from "@/app/onboarding/_stripe/stripe-account-requirements";
import { Button } from "@/components/ui/button";
import { getProviderStripeAccountDAL } from "@/lib/dal/onboarding";
import Link from "next/link";
import { SetupStripeAccountForm } from "./setup-stripe-account-form";

const NEXT_STEP_PATH = "/onboarding/select-availability";

export default async function SetupStripeAccountPage() {
  const stripeAccountId = await getProviderStripeAccountDAL();

  if (!stripeAccountId) {
    return <SetupStripeAccountForm onCreate={createStripeOnboardingSession} />;
  }

  const accountResult = await getStripeAccountAction();

  if (!accountResult.success) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Setup account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your Profile Starts Here
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            We tried to peek at your Stripe setup, but looks like the system is
            busy doing yoga. Give it a moment and refresh, or contact support if
            this issue persists.
          </p>
        </div>
      </div>
    );
  }

  const account = accountResult.data.account;
  const { hasOutstandingRequirements } =
    getStripeAccountRequirementStatus(account);

  console.log("hasOutstandingRequirements: ", hasOutstandingRequirements);
  if (hasOutstandingRequirements) {
    const accountLinkResult = await createStripeAccountLink(account.id);

    if (!accountLinkResult.success) {
      return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Setup account
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your Profile Starts Here
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Stripe still needs a couple of details, but the portal back to
              them sputtered. Try again shortly—if it keeps acting up, or ping
              us (contact support) and we will grab a bigger wrench.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Setup account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your Profile Starts Here
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            There are still incomplete items from Stripe&rsquo;s onboarding form
            waiting for your magic touch. Jump back in, zap through them, and we
            will have the welcome mat ready when you come back.
          </p>
        </div>
        <Button className="max-w-xs" asChild size="lg">
          <a
            href={accountLinkResult.data.accountLink.url}
            rel="noopener noreferrer"
          >
            Resume in Stripe
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Setup account
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Create your account
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Looks like every Stripe checkbox is complete. You can head to the next
          step and work your scheduling magic.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={NEXT_STEP_PATH}>Continue to availability</Link>
      </Button>
    </div>
  );
}
