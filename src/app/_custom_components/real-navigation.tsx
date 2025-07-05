"use client";

import { Button } from "@/components/ui/button";
import { Flower } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationMenuPage() {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 border-b border-muted-foreground/20 mb-12">
      <div className="relative flex h-16 justify-between items-center">
        {/* Logo on the left */}
        <Link href="/" className="flex shrink-0 items-center">
          <Flower className="h-8 w-auto text-primary" />
          <p className="text-foreground text-base ml-1 font-semibold">
            Ease & Arrange
          </p>
        </Link>

        {/* Button on the right - hidden on /provider/become-an-ease-specialist */}
        {pathname !== "/provider/become-an-ease-specialist" && (
          <Button variant="link" asChild className="text-base">
            <Link href="/provider/become-an-ease-specialist">
              Become an Ease Specialist
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
