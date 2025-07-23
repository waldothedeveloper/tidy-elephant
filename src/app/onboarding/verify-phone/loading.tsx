"use client";

import { ArrowLeft, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function VerifyPhoneLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between gap-x-6">
          <Button asChild variant="outline">
            <Link href="/onboarding/basic-info">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Link>
          </Button>
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="pb-12">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-center gap-2 mt-2">
            <Phone className="size-5 text-muted-foreground" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-2 mt-2">
            <Skeleton className="h-4 w-full max-w-4xl" />
            <Skeleton className="h-4 w-3/4 max-w-3xl" />
            <Skeleton className="h-4 w-1/2 max-w-2xl" />
          </div>
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              <div className="mt-10">
                <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-4">
                  {/* Phone Number Field */}
                  <div className="sm:col-span-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-9 w-full mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>

                  {/* Send Code Button */}
                  <div className="sm:col-span-1 flex items-end">
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-8 space-y-4">
                  <Skeleton className="h-4 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
