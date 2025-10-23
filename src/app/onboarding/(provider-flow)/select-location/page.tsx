import { ArrowLeft, Search } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const previousStepPath = "/onboarding/select-availability";
const nextStepPath = "/onboarding/upload-work-photos";

type SuggestedLocation = {
  id: string;
  name: string;
  detail: string;
};

const suggestedLocations: ReadonlyArray<SuggestedLocation> = [
  {
    id: "atlanta",
    name: "Atlanta, GA",
    detail: "Metropolitan area within a 45 mile radius",
  },
  {
    id: "brookhaven",
    name: "Brookhaven, GA",
    detail: "Popular service area for residential organizing",
  },
  {
    id: "decatur",
    name: "Decatur, GA",
    detail: "Home offices and premium closet projects",
  },
];

export default function ProviderOnboardingSelectLocationPage() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between gap-x-6">
          <Button
            asChild
            variant="ghost"
            className="px-0 text-muted-foreground hover:text-foreground"
          >
            <Link href={previousStepPath}>
              <ArrowLeft className="size-4" />
              Previous
            </Link>
          </Button>
          <div className="flex items-center gap-x-4">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Button asChild>
              <Link href={nextStepPath}>Save Location & Continue</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <span className="mt-2 text-sm text-muted-foreground">
            Create Profile
          </span>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            Service Location
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-foreground">
            Let clients know where you work most often. Add primary cities,
            neighborhoods, or zip codes to improve your visibility in local
            searches.
          </p>
        </div>

        <div className="space-y-12 max-w-4xl">
          <section className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location-search">Search service areas</Label>
                <p className="text-sm text-muted-foreground">
                  Start typing a city or zip code to add it to your service
                  radius. You can refine this later from your provider
                  dashboard.
                </p>
              </div>
              <div className="relative">
                <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location-search"
                  placeholder="Try Atlanta, Georgia"
                  className="h-12 border-none bg-muted/60 pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
