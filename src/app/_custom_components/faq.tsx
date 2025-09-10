import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  // Getting Started
  {
    question: "How will Tidy Elephant work?",
    answer:
      "Once we launch, you'll be able to enter your zip code or browse our map to find decluttering, organizing, and cleaning experts in your area. Browse profiles, read reviews, and submit booking requests directly through our platform. Join our email list to be notified when we go live!",
  },
  {
    question: "Will Tidy Elephant be free to use?",
    answer:
      "Yes! Browsing providers and submitting booking requests will be completely free for clients. You'll only pay the service provider directly for their services. Subscribe to our updates to be first to know when registration opens.",
  },
  // Finding & Booking Providers
  {
    question: "How will I find providers in my area?",
    answer:
      "You'll be able to search by zip code, city, or use our interactive map to find experts near you. Filter results by service type and availability. Sign up for our launch notifications so you don't miss out!",
  },
  {
    question: "Will I be able to see providers' availability?",
    answer:
      "Absolutely! Each provider will maintain a live calendar showing their available time slots. Get on our email list to be among the first to start booking when we launch.",
  },
  // Communication & Services
  {
    question: "Can I message providers before booking?",
    answer:
      "Yes! Our built-in chat feature will let you ask questions and discuss your needs before booking. Want early access? Subscribe to our launch updates!",
  },
  {
    question: "What are video consultations?",
    answer:
      "Video sessions will be perfect for online decluttering coaching and virtual organizing consultations. You'll be able to schedule them directly through providers' calendars.",
  },
  {
    question: "What services will be available?",
    answer:
      "Decluttering, organizing, and cleaning services - plus combination packages. Pricing will vary by provider and location, with details clearly displayed on profiles. Sign up now to explore all options when we launch!",
  },
];

export default function FAQ() {
  return (
    <div className="bg-foreground dark:bg-accent">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-background dark:text-foreground sm:text-5xl">
            Frequently asked questions
          </h2>
          <dl className="mt-16 divide-y divide-muted-foreground/40">
            {faqs.map((faq) => (
              <Disclosure
                key={faq.question}
                as="div"
                className="py-6 first:pt-0 last:pb-0"
              >
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-background dark:text-foreground">
                    <span className="text-base/7 font-semibold">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <Minus
                        aria-hidden="true"
                        className="size-6 group-data-open:hidden"
                      />
                      <Plus
                        aria-hidden="true"
                        className="size-6 group-not-data-open:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base/7 text-muted-foreground">
                    {faq.answer}
                  </p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
