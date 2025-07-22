import Image from "next/image";
import Link from "next/link";
// import tidyElephantLogo from "../../../public/tidy-elephant.svg";
import { OnboardingProgress } from "./onboarding-progress";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative flex px-4 sm:px-6 lg:px-8 py-12 justify-between items-center border-b border-muted-foreground/10">
        <Link href="/" className="flex shrink-0 items-center">
          <p className="text-primary text-lg font-semibold uppercase">Tidy</p>
          <Image
            className="h-10 md:h-14 w-auto"
            src="/images/tidy-elephant.svg"
            alt="Tidy Elephant Logo"
          />
        </Link>
        <div className="hidden md:flex md:mx-auto md:max-w-lg xl:max-w-7xl xl:flex-1">
          <OnboardingProgress />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
