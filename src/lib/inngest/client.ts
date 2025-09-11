import { EventSchemas, Inngest } from "inngest";

import type { OnboardingData } from "@/features/onboarding/inngest/functions";
import type { ClerkUserCreatedData } from "@/types/clerk-webhook";

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
