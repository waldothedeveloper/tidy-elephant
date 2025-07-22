"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
// import tidyElephantLogo from "../../../public/images/tidy-elephant.svg";
import { usePathname } from "next/navigation";

export default function NavigationMenuPage() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) {
    return null; // Do not render the navigation menu on onboarding routes
  }

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 border-b border-muted-foreground/20 mb-12">
      <div className="relative flex h-16 justify-between items-center">
        <Link href="/" className="flex shrink-0 items-center">
          <p className="text-primary text-lg font-semibold uppercase">Tidy</p>
          <Image
            className="h-10 md:h-14 w-auto"
            src="/images/tidy-elephant.svg"
            alt="Tidy Elephant Logo"
          />
        </Link>

        <div className="flex items-center justify-center">
          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Button variant="link" asChild className="text-base">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>

          <Button variant="link" asChild className="text-base">
            <Link href="/become-an-ease-specialist">
              Become a Tidy Specialist
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
