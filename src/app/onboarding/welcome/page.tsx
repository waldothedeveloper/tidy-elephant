import { Button } from "@/components/ui/button";
import Link from "next/link";
import { beginProviderOnboardingAction } from "@/app/actions/onboarding/begin-provider-onboarding-action";
import { redirect } from "next/navigation";

async function handleBeginOnboarding() {
  "use server";

  const result = await beginProviderOnboardingAction();

  if (!result.success) {
    // In a real app, you might want to pass this error to a client component
    // For now, we'll just redirect to an error page or back to this page
    console.error("Onboarding start error:", result.error);
    return;
  }

  redirect("/onboarding/basic-info");
}

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to Ease & Arrange
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Ready to become a provider? Let&apos;s set up your profile and get
            you started on your journey to help others organize their spaces.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-lg bg-muted/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What happens next?
              </h2>
              <ul className="text-left space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    1
                  </span>
                  <span>Complete your basic profile information</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    2
                  </span>
                  <span>Build your professional profile</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    3
                  </span>
                  <span>Verify your phone number</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    4
                  </span>
                  <span>Start helping clients organize their spaces</span>
                </li>
              </ul>
            </div>

            <form action={handleBeginOnboarding}>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto px-8 py-3"
              >
                Begin Onboarding
              </Button>
            </form>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link">
              <Link href="/provider/dashboard">Go to dashboard</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
