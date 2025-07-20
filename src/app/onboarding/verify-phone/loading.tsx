export default function VerifyPhoneLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Navigation Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between gap-x-6">
          {/* Previous button skeleton */}
          <div className="h-9 w-20 bg-muted rounded-md" />
          {/* Next button skeleton */}
          <div className="h-9 w-36 bg-muted rounded-md" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        {/* Header Section */}
        <div className="pb-12">
          {/* Breadcrumb/Category */}
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          {/* Title */}
          <div className="h-8 w-96 bg-muted rounded mb-2" />
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full max-w-4xl bg-muted rounded" />
            <div className="h-4 w-3/4 max-w-3xl bg-muted rounded" />
            <div className="h-4 w-1/2 max-w-2xl bg-muted rounded" />
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className="space-y-12">
          <div className="border-b border-border pb-12">
            <div className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-4">
              {/* Phone Number Field */}
              <div className="sm:col-span-1">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-9 w-full bg-muted rounded mb-2" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>

              {/* Send Code Button */}
              <div className="sm:col-span-1 flex items-end" />
            </div>

            {/* Additional Info Section */}
            <div className="mt-8 space-y-4">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
