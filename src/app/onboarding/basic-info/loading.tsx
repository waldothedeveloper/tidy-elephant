export default function BasicInfoLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Navigation Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          {/* Submit button skeleton */}
          <div className="h-9 w-36 bg-muted rounded-md"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="pb-12">
          {/* Breadcrumb/Category */}
          <div className="h-4 w-24 bg-muted rounded mb-2"></div>
          {/* Title */}
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full max-w-4xl bg-muted rounded"></div>
            <div className="h-4 w-3/4 max-w-3xl bg-muted rounded"></div>
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className="max-w-4xl">
          <div className="space-y-12">
            <div className="border-b border-border pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {/* First Name Field */}
                <div className="sm:col-span-1">
                  <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-9 w-full bg-muted rounded"></div>
                </div>

                {/* Last Name Field */}
                <div className="sm:col-span-1">
                  <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-9 w-full bg-muted rounded"></div>
                </div>

                {/* About Field */}
                <div className="col-span-full">
                  <div className="h-4 w-16 bg-muted rounded mb-2"></div>
                  <div className="h-24 w-full bg-muted rounded mb-2"></div>
                  <div className="h-3 w-64 bg-muted rounded"></div>
                </div>

                {/* Profile Photo Field */}
                <div className="col-span-full">
                  <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                  <div className="flex items-center gap-x-3">
                    {/* Avatar placeholder */}
                    <div className="size-20 bg-muted rounded-full"></div>
                    {/* File input placeholder */}
                    <div className="h-9 w-48 bg-muted rounded"></div>
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
