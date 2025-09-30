"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type SetupAccountErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SetupAccountError({
  error,
  reset,
}: SetupAccountErrorProps) {
  useEffect(() => {
    console.error("Setup Account Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button variant="outline" disabled>
            Submit & Next Step
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="space-y-12 text-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Setup account</p>
                <h1 className="text-4xl font-light tracking-tight text-destructive">
                  Well, that wasn’t supposed to happen.
                </h1>
              </div>
              <p className="mx-auto max-w-md text-lg leading-relaxed text-destructive">
                Our system tripped over its own shoelaces. Try again, and if it
                still won’t budge, smash the support button like it owes you
                money. We’ll get you moving again faster than coffee kicks in.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={reset}
                size="lg"
                className="min-w-32"
                variant="outline"
              >
                <RefreshCw className="me-2 size-4" />
                Try Again
              </Button>
            </div>
            <div className="pt-8">
              <p className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Reach out to support if this keeps happening by clicking
                <Button asChild variant="link" className="pl-1">
                  <Link
                    href={`mailto:support@easeandarrange.com?subject=Setup Account Issue&body=I encountered an error while setting up my account. Error ID: ${error.digest || "N/A"}`}
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
