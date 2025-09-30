import { createStripeAccountLink } from "@/app/actions/onboarding/stripe/create-stripe-account-link";
import { getStripeAccountAction } from "@/app/actions/onboarding/stripe/get-stripe-account-action";
import { getStripeAccountRequirementStatus } from "@/app/onboarding/_stripe/stripe-account-requirements";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ReturnFromStripePage() {
  const result = await getStripeAccountAction();

  if (!result.success) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Your account seems to be hiding.
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            We couldn’t find your Stripe account ID in our system. This doesn’t
            mean it’s gone forever—just that something slipped between the
            cracks
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Try refreshing and signing in again. • If it still doesn’t show up,
            reach us at the support link below and we’ll sort it out.
          </p>
        </div>
      </div>
    );
  }

  const account = result.data.account;
  const { hasOutstandingRequirements } =
    getStripeAccountRequirementStatus(account);

  if (hasOutstandingRequirements) {
    const accountLinkResult = await createStripeAccountLink(account.id);

    if (!accountLinkResult.success) {
      return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16 min-h-dvh">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Our link machine coughed.
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              We tried to generate a fresh Stripe link for you, but the system
              threw us a curveball.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Wait a few seconds and retry. • If it keeps failing, ping us at
              the support link below and we’ll hand you a new link manually.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16 min-h-dvh">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Still a Few Dots to Connect
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Stripe says your profile setup isn’t fully complete yet.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            No stress—you can jump back into Stripe and finish where you left
            off. Once everything is squared away, your account will be fully
            ready to receive payments.
          </p>
        </div>
        <Button asChild size="lg">
          <a
            href={accountLinkResult.data.accountLink.url}
            rel="noopener noreferrer"
          >
            Complete Setup in Stripe
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 py-16 min-h-dvh">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Profile Complete—You’re Ready to Roll
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          You’ve crossed the finish line at Stripe.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Your profile is verified, your bank is connected, and payments will
          flow as soon as you start booking. Next stop: Let&rsquo;s talk about your
          hourly rate, availability, and more.
        </p>
        <Button asChild size="lg">
          <Link href="/onboarding/select-availability">
            Continue Onboarding
          </Link>
        </Button>
      </div>
    </div>
  );
}
