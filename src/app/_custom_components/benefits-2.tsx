import { CalendarFold, Shield, UserRoundCheck } from "lucide-react";

import Image from "next/image";

const posts = [
  {
    id: 1,
    title: "Vetted Professionals.",
    description:
      "All experts are background-checked, insured, and have proven track records of excellent service.",
    imageUrl:
      "https://images.unsplash.com/photo-1742483359033-13315b247c74?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    icon: UserRoundCheck,
  },
  {
    id: 2,
    title: "Satisfaction Guaranteed.",
    description:
      "We stand behind every service with our satisfaction guarantee and responsive customer support.",
    imageUrl:
      "https://images.unsplash.com/photo-1688549143214-0fe39c409903?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    icon: Shield,
  },
  {
    id: 3,
    title: "Flexible Scheduling.",
    description:
      "Book services that fit your schedule, from one-time projects to recurring maintenance.",
    imageUrl:
      "https://images.unsplash.com/photo-1617106400337-66e7d72a466e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    icon: CalendarFold,
  },
];

export default function Benefits2() {
  return (
    <div className="bg-white dark:bg-accent py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Browse, book, and transform your space with local decluttering
            experts
          </h2>
          <p className="mt-2 text-lg/8 text-foreground/50">
            Connect with experienced decluttering specialists, professional
            organizers, and cleaning experts who understand your vision.
            Transform any room from chaotic to calm with trusted professionals
            in your neighborhood.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col items-start justify-between"
            >
              <div className="relative w-full">
                <Image
                  alt=""
                  src={post.imageUrl}
                  className="aspect-video w-full rounded-2xl bg-foreground/10 object-cover sm:aspect-2/1 lg:aspect-3/2"
                  width={680}
                  height={240}
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-foreground/10 ring-inset" />
              </div>
              <div className="max-w-xl">
                <div className="mt-8 group relative">
                  <div className="flex items-center gap-x-3 justify-start">
                    <post.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg/6 font-semibold text-foreground">
                      <div>
                        <span className="absolute inset-0" />
                        {post.title}
                      </div>
                    </h3>
                  </div>
                  <p className="mt-5 line-clamp-3 text-sm/6">
                    {post.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
