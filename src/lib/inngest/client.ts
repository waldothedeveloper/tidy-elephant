import { EventSchemas, Inngest } from "inngest";

import type { OnboardingData } from "@/features/onboarding/inngest/functions";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
  verification?: {
    status: string;
  };
};

type ClerkUserCreatedData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  image_url: string | null;
  created_at: number;
};

export const inngest = new Inngest({
  id: "tidy-elephant",
  schemas: new EventSchemas().fromRecord<{
    "onboarding/create-calendar-managed-user": {
      data: OnboardingData;
    };
    "clerk/user.created": {
      data: ClerkUserCreatedData;
    };
  }>(),
});
