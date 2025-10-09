import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Shield, User } from "lucide-react";

import { BeginOnboardingButton } from "./begin-onboarding-btn";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingWelcomePage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <BeginOnboardingButton />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Mobile Version - Short & Punchy */}
        <div className="md:hidden">
          <div className="pb-8">
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Welcome to Tidy Elephant
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Join our trusted network. Your success starts in just 3 quick
              steps.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <User className="size-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">
                  Build Your Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share your info, services & photos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="size-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">
                  Background Check
                </h3>
                <p className="text-sm text-muted-foreground">
                  A fast way to build trust.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="size-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Activation Fee</h3>
                <p className="text-sm text-muted-foreground">
                  One-time setup to unlock bookings.
                </p>
              </div>
            </div>
          </div>

          <div className="my-12 text-center">
            <p className="text-sm text-muted-foreground">
              Complete your onboarding process to secure your spot in a vibrant
              community where clients are already looking for you.
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Already completed onboarding?{" "}
              <Button asChild variant="link" className="h-auto p-0">
                <Link href="/provider/dashboard">Go to your dashboard</Link>
              </Button>
            </p>
          </div>
        </div>

        {/* Desktop Version - More Detailed */}
        <div className="hidden md:block">
          <div className="pb-12">
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Welcome to Tidy Elephant
            </h2>
            <p className="mt-3 max-w-4xl text-base text-muted-foreground">
              We can&apos;t wait to welcome you into our community. Here&apos;s
              what you&apos;ll complete to go live and start earning:
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Step 1 */}
              <Card className="group">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    Build Your Profile
                  </h3>
                  <p className="mb-4 text-sm text-foreground leading-relaxed">
                    Tell us about yourself or your business, set your services,
                    rate, availability, and share your best work with photos.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="group">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="size-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    Background Check
                  </h3>
                  <p className="mb-4 text-sm text-foreground leading-relaxed">
                    Complete a short, secure verification process to establish
                    your credibility.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="group">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="size-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    Activation Fee
                  </h3>
                  <p className="mb-4 text-sm text-foreground leading-relaxed">
                    Pay a one-time, non-refundable onboarding fee to complete
                    your setup.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 pt-6">
              <p className="text-sm text-muted-foreground">
                Already completed onboarding?{" "}
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/provider/dashboard">Go to your dashboard</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
