import { auth } from "@clerk/nextjs/server";
import { Flower } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingProgress } from "./onboarding-progress";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    (await auth()).sessionClaims?.metadata.onboardingComplete === true &&
    (await auth()).sessionClaims?.metadata.isAProvider === true
  ) {
    redirect("/provider/dashboard");
  }

  return (
    <div>
      <div className="relative flex px-4 sm:px-6 lg:px-8 py-12 justify-between items-center border-b border-muted-foreground/10">
        <Link href="/" className="flex shrink-0 items-center">
          <Flower className="h-8 w-auto text-primary" />
          <p className="text-foreground text-base ml-1 font-semibold">
            Ease & Arrange
          </p>
        </Link>
        <div className="hidden md:flex md:mx-auto md:max-w-lg xl:max-w-7xl xl:flex-1">
          <OnboardingProgress />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
