import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="max-w-4xl">
          <p className="text-base/7 font-semibold text-primary">
            About Ease & Arrange
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
            We Get It - Life Gets Messy <br />
          </h1>
          <p className="mt-6 text-xl/8 text-balance text-foreground">
            Turning &ldquo;I&apos;ll Deal With This Later&rdquo; Into
            &ldquo;Wow, I Actually Love My Home Again&rdquo;
          </p>
        </div>
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
          <div className="lg:pr-8">
            <h2 className="text-2xl font-semibold tracking-tight text-pretty text-foreground">
              Our mission
            </h2>
            <p className="mt-6 text-base/7 text-muted-foreground">
              You know that chair covered in clothes? The junk drawer that
              won&apos;t close? That garage you can&apos;t park in? Yeah,
              we&apos;ve all been there. Here&apos;s the truth: 71% of Americans
              feel overwhelmed by clutter, and the average person wastes 44
              hours a year just looking for their stuff.
            </p>

            <p className="mt-8 text-base/7 text-muted-foreground">
              We&apos;re building{" "}
              <span className="text-primary font-semibold">Ease & Arrange</span>{" "}
              because everyone deserves to love their home again. Soon,
              you&apos;ll be able to connect with local experts who actually
              enjoy turning chaos into calm – no judgment, just results. Whether
              it&apos;s tackling that scary spare room or getting a fresh start,
              our decluttering and organizing pros will have your back. Get on
              our launch list and be the first to transform your space!
            </p>
            <div className="mt-10">
              <Button
                variant="link"
                className="text-muted-foreground text-base hover:text-primary -ml-4"
              >
                <Link href="/waitlist/join-us">Join the waitlist &rarr;</Link>
              </Button>
            </div>
          </div>
          <div className="pt-16 lg:row-span-2 lg:-mr-16 xl:mr-auto">
            <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <Image
                  alt=""
                  src="https://images.unsplash.com/photo-1657980223973-73be27c8171a?q=80&w=744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="block size-full object-cover"
                  width={560}
                  height={560}
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <Image
                  alt=""
                  src="https://images.unsplash.com/photo-1662496167635-14c958c52833?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="block size-full object-cover"
                  width={560}
                  height={560}
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <Image
                  alt=""
                  src="https://images.unsplash.com/photo-1672640770474-e1d8a28fd0d2?q=80&w=695&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="block size-full object-cover"
                  width={560}
                  height={560}
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <Image
                  alt=""
                  src="https://images.unsplash.com/photo-1533929702053-9986939ea193?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="block size-full object-cover"
                  width={560}
                  height={560}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
