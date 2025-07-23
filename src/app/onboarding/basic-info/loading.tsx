"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function BasicInfoLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-48 mt-2" />
          <Skeleton className="h-4 w-96 mt-2 max-w-full" />
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {/* First Name Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Last Name Field */}
                <div className="sm:col-span-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* About Field */}
                <div className="col-span-full">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-3 w-64" />
                </div>

                {/* Profile Photo Field */}
                <div className="col-span-full">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="mt-2 flex items-center gap-x-3">
                    <div>
                      <Skeleton className="mx-auto size-20 text-muted-foreground" />
                    </div>

                    <Skeleton className="h-9 w-48" />
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
