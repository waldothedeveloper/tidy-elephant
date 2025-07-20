"use client";

import { AlertTriangle, Camera, FileText, RefreshCw, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function BasicInfoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error to an error reporting service
  useEffect(() => {
    console.error("Basic Info Error:", error);
  }, [error]);

  return (
    <div>
      {/* Header Navigation - matching the actual page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button variant="outline" disabled>
            Submit & Next Step
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <span className="mt-2 text-sm text-muted-foreground">
            Activate Profile
          </span>
          <div className="flex items-center mt-4 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
            <h2 className="text-3xl font-semibold text-foreground">
              Profile setup temporarily unavailable
            </h2>
          </div>
          <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
            We&apos;re having trouble saving your profile information right now.
            This is usually temporary and should be resolved shortly.
          </p>
        </div>

        <div className="space-y-8 max-w-2xl">
          {/* What you can do section */}
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">
              What you can do:
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <RefreshCw className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Try submitting again
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your form data is still saved in your browser
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Check your information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make sure all required fields are filled out correctly
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Camera className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Try uploading your photo later
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can complete your profile without a photo for now
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Save your progress
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Copy your &quot;About me&quot; text to avoid losing your
                    work
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link href="/provider/onboarding">Start Over</Link>
            </Button>
          </div>

          {/* Help section */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              Still having trouble? We&apos;re here to help:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              <Link
                href={`mailto:support@easeandarrange.com?subject=Profile Setup Issue&body=I encountered an error while setting up my profile. Error ID: ${error.digest || "N/A"}`}
                className="text-primary hover:underline"
              >
                Email support
              </Link>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <Link
                href="/help/profile-setup"
                className="text-primary hover:underline"
              >
                Profile setup help
              </Link>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <Link href="/help" className="text-primary hover:underline">
                Help center
              </Link>
            </div>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-8">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors mb-2">
                🔧 Development Error Details
              </summary>
              <div className="bg-muted/50 p-4 rounded-md text-xs font-mono text-muted-foreground overflow-x-auto border">
                <p className="mb-2">
                  <strong>Message:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
