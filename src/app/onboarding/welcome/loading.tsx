"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function WelcomeLoading() {
  return (
    <div>
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
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-64 mt-2" />
          <Skeleton className="h-4 w-96 mt-2 max-w-full" />
        </div>

        <div>
          <div className="space-y-12 max-w-4xl">
            <div className="pb-12">
              <div className="mt-10">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-5 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
