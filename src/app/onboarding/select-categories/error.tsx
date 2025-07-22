"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function SelectCategoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Category Selection Error:", error);
  }, [error]);

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
          <Button variant="outline" disabled>
            Save Categories & Continue
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
                <p className="text-sm text-muted-foreground">Create Profile</p>
                <h1 className="text-4xl font-light text-destructive tracking-tight">
                  Something went wrong
                </h1>
              </div>
              <p className="text-lg text-destructive max-w-md mx-auto leading-relaxed">
                We are having trouble with your service categories right now.
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
                    href={`mailto:support@easeandarrange.com?subject=Category Selection Issue&body=I encountered an error while selecting service categories. Error ID: ${error.digest || "N/A"}`}
                  >
                    here
                  </Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Development error details */}
      {process.env.NODE_ENV === "development" && (
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-8">
          <details>
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors mb-4">
              Development Details
            </summary>
            <div className="bg-muted/30 p-4 rounded text-xs font-mono text-muted-foreground space-y-2">
              <p>
                <strong>Message:</strong> {error.message}
              </p>
              {error.digest && (
                <p>
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
