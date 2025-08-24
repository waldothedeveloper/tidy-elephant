import Image from "next/image";
import Link from "next/link";
import { OnboardingProgress } from "./onboarding-progress";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-12 items-center border-b border-muted-foreground/10">
        <Link href="/" className="flex shrink-0 items-center">
          <p className="text-primary text-lg font-semibold uppercase">Tidy</p>
          <Image
            height={56}
            width={56}
            className="h-10 md:h-14 w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/ease-and-arrange-prod.firebasestorage.app/o/media%2Ftidy-elephant.svg?alt=media&token=f8d6b255-3984-4e41-b121-f1f774932d12"
            alt="Tidy Elephant Logo"
          />
        </Link>
        <div className="mt-6 md:mt-0 flex max-w-7xl flex-1 w-full">
          <OnboardingProgress />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
