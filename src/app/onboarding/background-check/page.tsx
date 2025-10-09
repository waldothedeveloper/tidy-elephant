import { advanceToTrustSafetyAction } from "@/app/actions/onboarding/advance-to-trust-safety-action";

export const dynamic = "force-dynamic";

export default async function ProviderOnboardingBackgroundCheck() {
  const response = await advanceToTrustSafetyAction();

  const statusMessage = response.success
    ? response.data.message
    : response.error.message;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex max-w-lg flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Trust &amp; Safety</h1>
        <p className="text-lg text-muted-foreground">
          Thanks for taking care of the activation fee. We&apos;re moving you into the
          Trust &amp; Safety step so you can finish onboarding.
        </p>
        <p
          className={response.success ? "text-sm text-muted-foreground" : "text-sm text-destructive"}
        >
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
