"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessInfoLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-56 mt-2" />
          <Skeleton className="h-4 w-96 mt-2 max-w-full" />
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {/* Business Type Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Business Name Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* EIN Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Business Phone Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Business Address Fields */}
                <div className="col-span-full">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-9 w-full mb-4" />
                  <Skeleton className="h-9 w-full mb-4" />
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
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