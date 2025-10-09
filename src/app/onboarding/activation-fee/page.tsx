import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProviderOnboardingActivationFeePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pt-24">
        <div className="rounded-3xl bg-background px-8 py-12 shadow-sm sm:px-12 sm:py-16">
          <div className="space-y-12">
            <span className="text-sm font-medium text-muted-foreground">
              Verification &amp; Setup Fee
            </span>
            <h1 className="mt-12 text-4xl font-semibold text-pretty text-foreground sm:text-5xl">
              Why We Verify Every Professional
            </h1>
          </div>

          <div className="mt-10 space-y-10 text-base/7 text-muted-foreground">
            <div className="space-y-6">
              <p>
                Trust and safety are at the heart of Tidy Elephant. Every
                organizer must complete a verified background check before they
                can work with clients. This protects both sides — clients feel
                confident inviting professionals into their homes, and verified
                organizers stand out for their credibility and professionalism.
              </p>
            </div>

            <div className="space-y-6 py-10">
              <p className="dark:text-foreground text-background">
                To cover the cost of this process, there&apos;s a one-time $35
                Verification &amp; Setup Fee. <br />
                This fee ensures:
              </p>
              <ul className="space-y-4 text-sm/6 text-foreground" role="list">
                <li className="flex gap-3">
                  <span
                    className="mt-1 size-1.5 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span>
                    A professional background check through our verification
                    partner
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="mt-1 size-1.5 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span>Secure identity verification</span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="mt-1 size-1.5 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span>Account setup for Stripe payouts</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <p>
                We want to be transparent: this fee isn&apos;t a profit center —
                it simply covers the real costs of verification and account
                setup. Building a safe, trusted community takes effort and
                shared commitment. Your investment here helps keep the entire
                marketplace reliable, professional, and safe for everyone.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-6 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link
                href="https://buy.stripe.com/test_aFa4gs3pegrV8AcaaE2VG00"
                rel="noreferrer noopener"
              >
                Proceed to Secure Verification →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
