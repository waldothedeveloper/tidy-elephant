import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { beginProviderOnboardingAction } from "@/app/actions/onboarding/begin-provider-onboarding-action";

async function handleBeginOnboarding() {
  "use server";

  const result = await beginProviderOnboardingAction();

  if (!result.success) {
    notFound();
  }

  redirect("/onboarding/type-of-business");
}

export default function OnboardingWelcomePage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <form action={handleBeginOnboarding}>
            <Button type="submit">
              Begin Onboarding
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <span className="mt-2 text-sm text-muted-foreground">Welcome</span>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            Ready to become a Tidy Specialist?
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-foreground">
            Let&apos;s set up your profile and get you started on your journey
            to help others organize their spaces.
          </p>
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              <div className="mt-10">
                <h3 className="text-lg font-medium text-foreground mb-6">
                  What happens next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Create Profile
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Verify Eligibility
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Create Schedule
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Pay Registration Fee
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Start Accepting Clients
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Already completed onboarding?{" "}
                    <Button asChild variant="link" className="h-auto p-0">
                      <Link href="/provider/dashboard">
                        Go to your dashboard
                      </Link>
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
