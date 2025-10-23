"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function WelcomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Welcome Error:", error);
  }, [error]);

  return (
    <div>
      {/* Header Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button variant="outline" disabled>
            Begin Onboarding
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
                <p className="text-sm text-muted-foreground">Welcome</p>
                <h1 className="text-4xl font-light text-destructive tracking-tight">
                  Something went wrong
                </h1>
              </div>
              <p className="text-lg text-destructive max-w-md mx-auto leading-relaxed">
                We are having trouble loading the welcome page right now.
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
                <RefreshCw className="size-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Help Link */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                You can contact support if this issue continues by clicking
                <Button asChild variant="link" className="py-0 pl-1">
                  <Link
                    href={`mailto:support@easeandarrange.com?subject=Welcome Page Issue&body=I encountered an error while loading the welcome page. Error ID: ${error.digest || "N/A"}`}
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