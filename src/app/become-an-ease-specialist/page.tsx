import {
  BadgeCheck,
  BanknoteArrowUp,
  BrushCleaning,
  Building,
  ChartNoAxesCombined,
  Contact,
  DiamondPlus,
  DollarSign,
  FileUser,
  HandHelping,
  HeartPlus,
  House,
  Laptop,
  MapPinHouse,
  Package,
  Palette,
  Rocket,
  Star,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// TODO: Remove ALL the conditional process.env.NODE_ENV checks once we are ready to go live!!!!!!

export default function BecomeAnArrangerPage() {
  return (
    <>
      <EaseSpecialistHero />
      <HowItWorks />
      <WhoAreWe />
      <WhyChooseUs />
      <Testimonial />
      <WhoAreWeLookingFor />
      <ReadyToDiveIn />
    </>
  );
}

function EaseSpecialistHero() {
  return (
    <div>
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-background lg:block"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 pb-32 sm:pb-40 lg:px-8 lg:pb-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                {process.env.NODE_ENV !== "development" && (
                  <div className="hidden sm:mb-10 sm:flex">
                    <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-foreground/10 hover:ring-foreground/20">
                      Get notified as soon as we launch.{" "}
                      <Link
                        href="/waitlist/join-us"
                        className="font-semibold whitespace-nowrap text-primary"
                      >
                        <span aria-hidden="true" className="absolute inset-0" />
                        Join the waitlist
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                )}
                <h1 className="text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-7xl">
                  Turn Your Organizing Passion Into Profit
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                  Join thousands of professional organizers earning{` `}
                  <span className="text-primary">$50-$150/hour</span> helping
                  clients create peaceful, functional spaces.
                </p>
                <div className="mt-8">
                  <EarningsSection />
                </div>
                <div className="mt-10 flex flex-1 items-center gap-x-6 w-full">
                  {/* THIS WILL EVENTUALLY CHANGE, BUT IT IS OK FOR NOW */}
                  {process.env.NODE_ENV === "development" ? (
                    <Link className="size-full" href="/onboarding/basic-info">
                      <Button className="w-full py-6 text-xl font-semibold">
                        Become a Tidy Specialist
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="w-full py-6 text-xl font-semibold"
                    >
                      Coming soon...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <Image
            alt=""
            src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="aspect-3/2 object-cover lg:aspect-auto lg:size-full"
            width={1587}
            height={1058}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}
const earnings = [
  {
    id: 1,
    city: "New York City",
    rate: "$80-$150/hour",
  },
  {
    id: 2,
    city: "Los Angeles",
    rate: "$70-$130/hour",
  },
  {
    id: 3,
    city: "Chicago",
    rate: "$60-$110/hour",
  },
  {
    id: 4,
    city: "Miami",
    rate: "$55-$100/hour",
  },
];

const EarningsSection = () => {
  return (
    <div className="overflow-hidden rounded-md border border-muted-foreground/30">
      <ul role="list" className="divide-y divide-muted-foreground/30">
        {earnings.map((item) => (
          <li
            key={item.id}
            className="px-6 py-4 flex justify-between items-center"
          >
            <span className="text-sm font-medium text-foreground">
              {item.city}
            </span>
            <span className="text-sm font-semibold text-primary">
              {item.rate}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const features = [
  {
    name: "Be your own boss!",
    description:
      "You set the time, date, and locations for your organizing sessions. You choose the clients you want to work with and the projects that excite you.",
    icon: Timer,
  },
  {
    name: "You set your own rates",
    description:
      "You have the freedom to determine your own hourly rates based on your expertise and the value you provide to clients.",
    icon: DollarSign,
  },
  {
    name: "Grow with us",
    description:
      "We provide clients who understand the value of professional organizing.",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Pro Support",
    description:
      "Dedicated support team, marketing tools, and resources to help you grow your organizing business.",
    icon: HeartPlus,
  },
];

function WhyChooseUs() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <h2 className="col-span-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
            Build Your Business, Your Way
          </h2>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name}>
                <dt className="text-base/7 font-semibold text-foreground">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-background"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 text-base/7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

const stats = [
  {
    id: 1,
    name: "We have innovative categories such as digital organizers, time & productivity coaches, feng shui consultants, home organizers and more.",
    value: "12 organizer categories",
  },
  {
    id: 2,
    name: "    High-value projects, high returns. Our clients understand the value of professional organizing.",
    value: "$300-$1,200 Average Project Cost",
  },
  {
    id: 3,
    name: "Our software streamlines your workflow.",
    value: "100% Automated Scheduling & Payments",
  },
  {
    id: 4,
    name: "We keep our platform fees low to maximize your earnings.",
    value: "25% Low Platform Fees",
  },
];

function WhoAreWe() {
  return (
    <>
      <div className="relative isolate overflow-hidden bg-foreground py-24 sm:py-32">
        <Image
          fill
          alt=""
          src="https://images.unsplash.com/photo-1556189505-9647cead0c83?q=80&w=946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="absolute inset-0 -z-10 size-full object-cover"
          sizes="100vw"
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -left-96 -z-10 transform-gpu blur-3xl sm:-bottom-64 sm:-left-40 lg:-bottom-32 lg:left-8 xl:-left-10"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="aspect-1266/975 w-316.5 bg-linear-to-tr from-[#99f6e4] to-[#134e4a] opacity-20"
            />
          </div>
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h2 className="text-base/8 font-semibold text-primary">
              What is Ease & Arrange?
            </h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-background sm:text-5xl">
              We are the Premier Marketplace for Organizing Professionals
            </p>
            <p className="mt-6 text-lg/8 text-background">
              Ease & Arrange connects skilled organizing professionals with
              clients who need help creating order in their lives. Whether
              you&apos;re a certified professional organizer, home stager, move
              manager, or productivity coach, our platform helps you build a
              thriving business serving clients who value your expertise.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-background sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col gap-y-3 border-l border-background/10 pl-6"
              >
                <dt className="text-sm/6">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-primary">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 ml-2">
        Photo by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://unsplash.com/@nikolai_35?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          Niko Rau
        </a>{" "}
        on{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://unsplash.com/photos/brown-house-on-hill-byd5TNLIyac?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          Unsplash
        </a>
      </p>
    </>
  );
}

const signUpProcess = [
  {
    id: 1,
    name: "Sign up",
    description: "Create an account to get started.",
    icon: DiamondPlus,
  },
  {
    id: 2,
    name: "Create your profile",
    description:
      "Upload your picture, write a short bio, and showcase your organizing specialties, among other details.",
    icon: Contact,
  },
  {
    id: 3,
    name: "Verify your eligibility",
    description:
      "We'll verify your ID, run a background check, and review your business information to keep things safe and trustworthy.",
    icon: BadgeCheck,
  },
  {
    id: 4,
    name: "Create your schedule and zone areas",
    description:
      "Set your availability and define the areas you want to bring your organizing services to.",
    icon: Timer,
  },
  {
    id: 5,
    name: "Pay the registration fee",
    description:
      "We have a one-time registration fee of $25. This allows us to serve you more effectively.",
    icon: DollarSign,
  },

  {
    id: 6,
    name: "Start accepting clients",
    description:
      "Once your account is complete and approved, you can start accepting clients and growing your organizing business.",
    icon: BanknoteArrowUp,
  },
];

function HowItWorks() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2">
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
              How do I get started?
            </p>
            <p className="mt-6 text-base/7 text-muted-foreground">
              Our process is simple and straightforward. Just follow these steps
              to become a Tidy Specialist:
            </p>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base/7 text-muted-foreground sm:grid-cols-2 lg:gap-y-16">
            {signUpProcess.map((step) => (
              <div key={step.id} className="relative pl-9">
                <dt className="flex items-center gap-x-3 font-semibold text-foreground">
                  <span className="absolute top-1 left-0 size-5 text-muted-foreground">
                    {step.id}
                  </span>
                  <step.icon className="text-primary h-7 w-auto" />
                  {step.name}
                </dt>
                <dd className="mt-2">{step.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

const organizerCategories = [
  {
    name: "Core Professional Organizers",
    imageIcon: Star,
    bio: "Do you possess an innate talent for creating order, efficiency, and harmony in any space? Our platform welcomes skilled professional organizers ready to help clients declutter and optimize their homes and offices.",
  },
  {
    name: "Home Stagers",
    imageIcon: MapPinHouse,
    bio: "Transforming houses into irresistible homes is your specialty. Join Ease & Arrange as a home stager and connect with real estate professionals and homeowners looking to maximize their property's market appeal.",
  },
  {
    name: "Feng Shui Consultants",
    imageIcon: HandHelping,
    bio: "Guide clients to enhanced well-being and prosperity through the ancient art of Feng Shui. Share your expertise in optimizing energy flow and creating balanced environments.",
  },
  {
    name: "Move Managers & Downsizing Specialists",
    imageIcon: Package,
    bio: "Provide compassionate and strategic support during life transitions. We seek dedicated move managers and downsizing specialists who streamline relocations and help clients navigate significant changes with ease.",
  },
  {
    name: "Interior Designers",
    imageIcon: Palette,
    bio: "Are you a visionary who brings beauty, function, and personality to every room? As an interior designer on Ease & Arrange, you'll find clients eager to transform their living and working spaces.",
  },
  {
    name: "Office Organizers (Home & Corporate Spaces)",
    imageIcon: Building,
    bio: "Help individuals and businesses achieve peak productivity. We're seeking expert office organizers who can create efficient, clutter-free workspaces, from home offices to corporate environments.",
  },
  {
    name: "Home Organizers",
    imageIcon: House,
    bio: "From overflowing closets to chaotic kitchens, if you bring peace and order to residential spaces, we want you! Connect with clients desiring a more organized and serene home life.",
  },
  {
    name: "Paperwork & Document Organizers",
    imageIcon: FileUser,
    bio: "Master of the paper trail? Join our network of paperwork and document organizers and assist clients in managing critical files, creating efficient systems, and achieving true peace of mind.",
  },
  {
    name: "Digital Organizers",
    imageIcon: Laptop,
    bio: "In a world of digital clutter, your skills are invaluable. Become a digital organizer with Ease & Arrange and help clients tame their digital files, photos, and online accounts for a streamlined virtual life.",
  },
  {
    name: "Time & Productivity Coaches",
    imageIcon: Rocket,
    bio: "You don't touch the couch, but you transform lives! If you're a time management expert or productivity coach who empowers individuals to optimize their schedules, workflows, and tasks, our clients are waiting.",
  },
  {
    name: "Estate Cleanout / Hoarding Specialists",
    imageIcon: BrushCleaning,
    bio: "For those providing sensitive and thorough assistance in challenging situations. We are looking for empathetic estate cleanout and hoarding specialists who approach every project with dignity and professionalism.",
  },
];

function WhoAreWeLookingFor() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
            What is your organizing specialty?
          </h2>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Whether you specialize in one area or offer multiple services, we
            have the perfect category for your expertise.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {organizerCategories.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-foreground">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.imageIcon
                      aria-hidden="true"
                      className="size-6 text-background"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-muted-foreground">
                  <p className="flex-auto">{feature.bio}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function ReadyToDiveIn() {
  return (
    <div className="bg-primary/15">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-text-foreground sm:text-5xl">
            Ready to Turn Your Organizing Passion into Profit?
            <br />
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Join the marketplace designed specifically for organizing
            professionals
          </p>
        </div>
        <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
          {process.env.NODE_ENV === "development" ? (
            <Button asChild>
              <Link href="/onboarding/basic-info">
                Become a Tidy Specialist
              </Link>
            </Button>
          ) : (
            <Button className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Coming soon...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Testimonial() {
  return (
    <div className="bg-background pt-24 pb-16 sm:pt-32 sm:pb-24 xl:pb-32">
      <div className="bg-foreground pb-20 sm:pb-24 xl:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-x-8 gap-y-10 px-6 sm:gap-y-8 lg:px-8 xl:flex-row xl:items-stretch">
          <div className="-mt-8 w-full max-w-2xl xl:-mb-8 xl:w-96 xl:flex-none">
            <div className="relative aspect-2/1 h-full md:-mx-8 xl:mx-0 xl:aspect-auto">
              <Image
                fill
                alt=""
                src="https://images.unsplash.com/photo-1611093344167-8a5e327ab3b2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="absolute inset-0 size-full rounded-2xl bg-foreground/90 object-cover shadow-2xl"
                sizes="(max-width: 1280px) 100vw, 384px"
              />
            </div>
          </div>
          <div className="w-full max-w-2xl xl:max-w-none xl:flex-auto xl:px-16 xl:py-24">
            <figure className="relative isolate pt-6 sm:pt-12">
              <svg
                fill="none"
                viewBox="0 0 162 128"
                aria-hidden="true"
                className="absolute top-0 left-0 -z-10 h-32 stroke-background/20"
              >
                <path
                  d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                  id="b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb"
                />
                <use x={86} href="#b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb" />
              </svg>
              <blockquote className="text-xl/8 font-semibold text-background sm:text-2xl/9">
                <p>
                  As a move manager, I love how Ease & Arrange connects me with
                  families who need genuine help during major life transitions.
                  It&apos;s rewarding work that pays well.
                </p>
              </blockquote>
              <figcaption className="mt-8 text-base">
                <div className="font-semibold text-background">Michael R.</div>
                <div className="mt-1 text-muted-foreground">
                  Move Manager, Orlando
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
