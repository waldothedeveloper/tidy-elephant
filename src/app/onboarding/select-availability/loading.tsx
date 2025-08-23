"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SelectAvailabilityLoading() {
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
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-8 w-56 mt-2" />
          <Skeleton className="h-4 w-full max-w-2xl mt-2" />
        </div>

        <div className="space-y-12 max-w-4xl">
          {/* Available Days Section */}
          <div className="border-b border-border pb-12">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="size-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            
            <Skeleton className="h-4 w-80 mb-4" />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-row items-start space-x-3 space-y-0">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="border-b border-border pb-12">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="size-5" />
              <Skeleton className="h-6 w-40" />
            </div>

            <Skeleton className="h-4 w-72 mb-4" />
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center space-x-3 space-y-0 p-4 border border-border rounded-lg"
                >
                  <Skeleton className="h-4 w-4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flexibility Option */}
          <div>
            <div className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-border rounded-lg">
              <Skeleton className="h-4 w-4 mt-1" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
