"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function UploadWorkPhotosLoading() {
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
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-56 mt-2" />
          <Skeleton className="h-4 w-full max-w-4xl mt-2" />
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="border-b border-border pb-12">
              {/* Form Label */}
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-96 mb-4" />
              
              {/* File Input */}
              <Skeleton className="h-9 w-64 mb-6" />

              {/* Photo Grid Skeleton */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-square">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}