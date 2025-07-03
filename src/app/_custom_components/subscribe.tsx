"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { subscribeToWaitlist } from "@/app/actions";
import { useActionState } from "react";

export default function SubscribeToLaunch() {
  const [state, formAction, pending] = useActionState(subscribeToWaitlist, {
    success: false,
    message: "",
  });

  return (
    <div className="bg-foreground py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance text-secondary sm:text-4xl">
          Be the first to know when we launch.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Join our waitlist to get early access, exclusive launch offers, and be
          among the first to transform your space with trusted local experts.
        </p>
        <div className="mt-10 max-w-md"></div>
        <form action={formAction} className="mt-10 max-w-md">
          <div className="flex gap-x-4">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <Input
              id="email-address"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
              className="text-background"
            />

            <Button className="font-semibold" type="submit" disabled={pending}>
              {pending ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          {state.success && !pending && (
            <p className="mt-4 text-sm text-primary">
              Thank you for subscribing! Check your email for confirmation.
            </p>
          )}

          <p className="mt-4 text-sm/6 text-secondary">
            We care about your data. Read our{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold whitespace-nowrap text-background hover:text-primary"
            >
              privacy policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
