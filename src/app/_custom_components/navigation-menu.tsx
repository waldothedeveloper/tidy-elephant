"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeModeToggle } from "@/components/ui/theme-mode-toggle";
import { usePathname } from "next/navigation";

export default function NavigationMenu() {
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
            height={56}
            width={56}
            className="h-10 md:h-14 w-auto"
            src="/images/tidy-logo-no-bg.png"
            alt="Tidy Elephant Logo"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Button
              variant="link"
              asChild
              className="text-base text-foreground"
            >
              <Link href={{ pathname: "/sign-in" }}>Sign In</Link>
            </Button>
            <Button
              variant="link"
              asChild
              className="text-base text-foreground"
            >
              <Link href={{ pathname: "/sign-up" }}>Sign Up</Link>
            </Button>
          </SignedOut>

          <Button variant="link" asChild className="text-base text-foreground">
            <Link href="/become-an-ease-specialist">
              Become a Tidy Specialist
            </Link>
          </Button>

          <ThemeModeToggle />
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ThemeModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SignedOut>
                <DropdownMenuItem asChild>
                  <Link href={{ pathname: "/sign-in" }}>Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={{ pathname: "/sign-up" }}>Sign Up</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </SignedOut>
              <DropdownMenuItem asChild>
                <Link href="/become-an-ease-specialist">
                  Become a Tidy Specialist
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
