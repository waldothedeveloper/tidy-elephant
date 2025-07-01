import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SubscribeToLaunch() {
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
        <form className="mt-10 max-w-md">
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
            <Button className="font-semibold" type="submit">
              Subscribe
            </Button>
          </div>
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
