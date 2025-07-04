import { CalendarCheck2, ShieldCheckIcon, Smile } from "lucide-react";

import { Waitlist } from "@clerk/nextjs";

const features = [
  {
    name: "Vetted Professionals",
    description:
      "Every organizer in our network is thoroughly screened, background-checked, and trained to provide exceptional service you can trust.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Flexible Scheduling",
    description:
      "Book appointments that work with your busy lifestyle. From evenings to weekends, we accommodate your schedule.",
    icon: CalendarCheck2,
  },
  {
    name: "Satisfaction Guaranteed",
    description:
      "Your happiness is our priority. If you're not completely satisfied, we'll make it right with our 100% satisfaction guarantee.",
    icon: Smile,
  },
];

export default function WaitlistPage() {
  return (
    <div className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-primary">
                Coming Soon
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
                Transform Your Space
              </p>
              <p className="mt-6 text-lg/8 text-muted-foreground">
                Be the first to experience professional home organization
                services like never before.
              </p>
              <dl className="hidden md:block mt-10 max-w-xl space-y-8 text-base/7 text-muted-foreground lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-foreground">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-primary"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Waitlist signInUrl="/sign-in" />
          </div>
        </div>
      </div>
    </div>
  );
}
