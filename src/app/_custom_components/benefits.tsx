import { CalendarFold, Shield, UserRoundCheck } from "lucide-react";

const features = [
  {
    name: "Vetted Professionals.",
    description:
      "All experts are background-checked, insured, and have proven track records of excellent service.",
    icon: UserRoundCheck,
    href: "/",
  },
  {
    name: "Satisfaction Guaranteed.",
    description:
      "We stand behind every service with our satisfaction guarantee and responsive customer support.",
    icon: Shield,
    href: "/",
  },
  {
    name: "Flexible Scheduling.",
    description:
      "Book services that fit your schedule, from one-time projects to recurring maintenance.",
    icon: CalendarFold,
    href: "/",
  },
];

export default function Benefits() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Browse, book, and transform your space with local decluttering
            experts
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Connect with experienced decluttering specialists, professional
            organizers, and cleaning experts who understand your vision.
            Transform any room from chaotic to calm with trusted professionals
            in your neighborhood.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="size-5 flex-none text-primary"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  {/* WE MIGHT NEED THIS LATER */}
                  {/* <p className="mt-6">
                    <Link
                      href={feature.href}
                      className="text-sm/6 font-semibold text-primary hover:text-primary-dark"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
