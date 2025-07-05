import {
  BadgeCheck,
  BanknoteArrowUp,
  ChartNoAxesCombined,
  Contact,
  DiamondPlus,
  DollarSign,
  HeartPlus,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { createAvatarURI } from "@/app/utils/avatars";

export default function BecomeAnArrangerPage() {
  return (
    <>
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
                  <h1 className="text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-7xl">
                    Turn Your Organizing Passion Into Profit
                  </h1>
                  <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                    Join thousands of professional organizers earning{` `}
                    <span className="text-primary">$50-$150/hour</span> helping
                    clients create peaceful, functional spaces.
                  </p>
                  <div className="mt-8">
                    <EarningsSection />
                  </div>
                  <div className="mt-10 flex flex-1 items-center gap-x-6 w-full">
                    <Button
                      disabled
                      className="w-full py-6 text-xl font-semibold"
                    >
                      Coming soon...
                    </Button>
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
            />
          </div>
        </div>
      </div>
      <WhyChooseUs />
      <WhoAreWe />
      <HowItWorks />
      <WhoAreWeLookingFor />
      <ReadyToDiveIn />
    </>
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
            <p className="mt-6 text-lg/8 text-gray-300">
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

const process = [
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
      "We'll verify your identity and run a background check to ensure safety and trust for our clients.",
    icon: BadgeCheck,
  },
  {
    id: 4,
    name: "Pay the registration fee",
    description:
      "We have a one-time registration fee of $25 to cover some of the costs of onboarding and verification.",
    icon: DollarSign,
  },
  {
    id: 5,
    name: "Create your schedule and zone areas",
    description:
      "Set your availability and define the areas you want to bring your organizing services to.",
    icon: Timer,
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
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
              How do I get started?
            </p>
            <p className="mt-6 text-base/7 text-muted-foreground">
              Our process is simple and straightforward. Just follow these steps
              to become an Ease & Arrange specialist:
            </p>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base/7 text-muted-foreground sm:grid-cols-2 lg:gap-y-16">
            {process.map((step) => (
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
    imageUrl: createAvatarURI("Aneka"),
    bio: "Do you possess an innate talent for creating order, efficiency, and harmony in any space? Our platform welcomes skilled professional organizers ready to help clients declutter and optimize their homes and offices.",
  },
  {
    name: "Home Stagers",
    imageUrl: createAvatarURI("Home"),
    bio: "Transforming houses into irresistible homes is your specialty. Join Ease & Arrange as a home stager and connect with real estate professionals and homeowners looking to maximize their property's market appeal.",
  },
  {
    name: "Feng Shui Consultants",
    imageUrl: createAvatarURI("Feng"),
    bio: "Guide clients to enhanced well-being and prosperity through the ancient art of Feng Shui. Share your expertise in optimizing energy flow and creating balanced environments.",
  },
  {
    name: "Move Managers & Downsizing Specialists",
    imageUrl: createAvatarURI("Move"),
    bio: "Provide compassionate and strategic support during life transitions. We seek dedicated move managers and downsizing specialists who streamline relocations and help clients navigate significant changes with ease.",
  },
  {
    name: "Interior Designers",
    imageUrl: createAvatarURI("Interior"),
    bio: "Are you a visionary who brings beauty, function, and personality to every room? As an interior designer on Ease & Arrange, you'll find clients eager to transform their living and working spaces.",
  },
  {
    name: "Office Organizers (Home & Corporate Spaces)",
    imageUrl: createAvatarURI("Office"),
    bio: "Help individuals and businesses achieve peak productivity. We're seeking expert office organizers who can create efficient, clutter-free workspaces, from home offices to corporate environments.",
  },
  {
    name: "Home Organizers",
    imageUrl: createAvatarURI("HomeOrg"),
    bio: "From overflowing closets to chaotic kitchens, if you bring peace and order to residential spaces, we want you! Connect with clients desiring a more organized and serene home life.",
  },
  {
    name: "Paperwork & Document Organizers",
    imageUrl: createAvatarURI("Paper"),
    bio: "Master of the paper trail? Join our network of paperwork and document organizers and assist clients in managing critical files, creating efficient systems, and achieving true peace of mind.",
  },
  {
    name: "Digital Organizers",
    imageUrl: createAvatarURI("Digital"),
    bio: "In a world of digital clutter, your skills are invaluable. Become a digital organizer with Ease & Arrange and help clients tame their digital files, photos, and online accounts for a streamlined virtual life.",
  },
  {
    name: "Time & Productivity Coaches",
    imageUrl: createAvatarURI("Time"),
    bio: "You don't touch the couch, but you transform lives! If you're a time management expert or productivity coach who empowers individuals to optimize their schedules, workflows, and tasks, our clients are waiting.",
  },
  {
    name: "Estate Cleanout / Hoarding Specialists",
    imageUrl: createAvatarURI("Estate"),
    bio: "For those providing sensitive and thorough assistance in challenging situations. We are looking for empathetic estate cleanout and hoarding specialists who approach every project with dignity and professionalism.",
  },
  {
    name: "Tidying & Minimalism Coaches",
    imageUrl: createAvatarURI("Tidy"),
    bio: "If your approach emphasizes mindful decluttering, sustainable organization, and creating joyful living spaces through a less-is-more philosophy, join us as a tidying and minimalism coach.",
  },
];

// function WhoAreWeLookingFor() {
//   return (
//     <div className="bg-background py-24 sm:py-32">
//       <div className="mx-auto max-w-7xl px-6 lg:px-8">
//         <div className="mx-auto max-w-2xl sm:text-center">
//           <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
//             Find Your Niche in Our Comprehensive Service Categories
//           </h2>
//           <p className="mt-6 text-lg/8 text-muted-foreground">
//             Whether you specialize in one area or offer multiple services, we
//             have the perfect category for your expertise
//           </p>
//         </div>
//         <ul
//           role="list"
//           className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
//         >
//           {organizerCategories.map((category) => (
//             <li key={category.name} className="flex flex-col gap-6 xl:flex-row">
//               <Image
//                 width={108}
//                 height={108}
//                 alt=""
//                 src={category.imageUrl}
//                 className="aspect-square size-32 flex-none rounded-2xl object-cover"
//               />

//               <div className="flex-auto">
//                 <h3 className="text-lg/8 font-semibold tracking-tight text-foreground">
//                   {category.name}
//                 </h3>

//                 <p className="mt-6 text-base/7 text-muted-foreground">
//                   {category.bio}
//                 </p>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

function WhoAreWeLookingFor() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-foreground sm:text-4xl">
            Find Your Niche in Our Comprehensive Service Categories
          </h2>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Whether you specialize in one area or offer multiple services, we
            have the perfect category for your expertise
          </p>
        </div>
        <ul
          role="list"
          className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2"
        >
          {organizerCategories.map((category) => (
            <li key={category.name}>
              <div className="flex items-center gap-x-6">
                <Image
                  width={64}
                  height={64}
                  alt=""
                  src={category.imageUrl}
                  className="size-16 rounded-full"
                />
                <div>
                  <h3 className="text-base/7 font-semibold tracking-tight text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-sm/6 font-semibold text-muted-foreground">
                    {category.bio}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
          <Button className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Coming soon...
          </Button>
        </div>
      </div>
    </div>
  );
}
