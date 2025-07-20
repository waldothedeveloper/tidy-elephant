import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-2">
          <Button
            asChild
            variant="link"
            className="text-muted-foreground hover:text-primary"
          >
            <Link href="/waitlist/join-us">Join the waitlist &rarr;</Link>
          </Button>
        </div>
        <p className="text-center text-sm/6 text-muted-foreground md:order-1 md:mt-0">
          &copy; {new Date().getUTCFullYear()} Ease & Arrange, LLC.
        </p>
      </div>
    </footer>
  );
}
