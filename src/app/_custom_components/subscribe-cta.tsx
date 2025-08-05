import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import appImage from "./images/zoom-homepage.png";

export default function SubscribeCTA() {
  return (
    <div className="bg-primary/15">
      <div className="mx-auto py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 pt-16 sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
              Be the first to know when we launch.
            </h2>
            <p className="mt-6 text-lg/8 text-pretty text-muted-foreground">
              Join our waitlist to get early access, exclusive launch offers,
              and be among the first to transform your space with trusted local
              experts.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Button
                asChild
                variant="link"
                className="text-foreground text-xl hover:text-primary"
              >
                <Link href="/waitlist/join-us">Join the waitlist &rarr;</Link>
              </Button>
            </div>
          </div>
          <div className="relative mt-16 h-80 lg:mt-8">
            <Image
              alt="App screenshot"
              src={appImage}
              className="absolute top-0 left-0 w-228 max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
