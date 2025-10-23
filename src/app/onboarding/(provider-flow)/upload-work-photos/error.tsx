"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function UploadWorkPhotosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Upload Work Photos Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button variant="outline" disabled>
            Submit & Finish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center space-y-12">
            {/* Error Message */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Showcase Your Work</p>
                <h1 className="text-4xl font-light text-destructive tracking-tight">
                  Something went wrong
                </h1>
              </div>
              <p className="text-lg text-destructive max-w-md mx-auto leading-relaxed">
                We are having trouble uploading your work photos right now.
                This is usually temporary.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={reset}
                size="lg"
                className="min-w-32"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Help Link */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                You can contact support if this issue continues by clicking
                <Button asChild variant="link" className="py-0 pl-1">
                  <Link
                    href={`mailto:support@easeandarrange.com?subject=Work Photos Upload Issue&body=I encountered an error while uploading work photos. Error ID: ${error.digest || "N/A"}`}
                  >
                    here
                  </Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}