"use client";

import { ArrowRight, Building2, User } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignedIn, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TypeOfBusinessPage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Button variant="outline" disabled>
            Continue
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <span className="mt-2 text-sm text-muted-foreground">
            Business Type
          </span>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            What type of business entity are you?
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-foreground">
            Let us know how you operate so we can customize your experience and
            tax information accordingly.
          </p>
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              <div className="mt-10 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Freelancer Option */}
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-foreground/25">
                    <Link
                      href="/onboarding/basic-info"
                      className="block h-full"
                    >
                      <CardHeader className="text-center space-y-4">
                        <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="size-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-lg">Freelancer</CardTitle>
                          <CardDescription className="text-sm">
                            Just me, no registered business entity
                          </CardDescription>
                        </div>
                        <div className="flex items-center justify-center text-primary">
                          <span className="text-sm font-medium mr-2">
                            Continue as individual
                          </span>
                          <ArrowRight className="size-4" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>

                  {/* Business Option */}
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-foreground/25">
                    <Link
                      href="/onboarding/business-info"
                      className="block h-full"
                    >
                      <CardHeader className="text-center space-y-4">
                        <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="size-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-lg">
                            Yes, I have a business
                          </CardTitle>
                          <CardDescription className="text-sm">
                            e.g. LLC, Sole Proprietorship, Partnership
                          </CardDescription>
                        </div>
                        <div className="flex items-center justify-center text-primary">
                          <span className="text-sm font-medium mr-2">
                            Continue as business
                          </span>
                          <ArrowRight className="size-4" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
