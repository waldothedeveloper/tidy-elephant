import Image from "next/image";
import Link from "next/link";
import logo from "@/images/tidy-logo-no-bg.png";

export default async function OnboardingLayoutWelcome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative flex flex-col md:flex-row px-2 py-8 lg:px-8 items-center border-b border-muted-foreground/10 w-full">
        <Link href="/" className="flex shrink-0 items-center">
          <p className="text-primary text-2xl font-semibold uppercase">Tidy</p>
          <Image
            height={56}
            width={56}
            className="h-14 w-auto"
            src={logo}
            alt="Tidy Elephant Logo"
          />
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}
