"use client";

import { ArrowLeft, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function SelectCategoriesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between gap-x-6">
          <Button asChild variant="outline">
            <Link href="/onboarding/verify-phone">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Link>
          </Button>
          <div className="flex items-center gap-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-center gap-2 mt-2">
            <Package className="size-5 text-muted-foreground" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96 mt-2 max-w-full" />
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="pb-12">
              <div className="mt-10">
                <Skeleton className="h-5 w-32 mb-4" />

                {/* Category Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                    >
                      <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div className="space-y-1 leading-none flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
