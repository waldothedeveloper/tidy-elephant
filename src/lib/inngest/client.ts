import { EventSchemas, Inngest } from "inngest";

import type { OnboardingData } from "@/features/onboarding/inngest/functions";

export const inngest = new Inngest({
  id: "tidy-elephant",
  schemas: new EventSchemas().fromRecord<{
    "onboarding/create-calendar-managed-user": {
      data: OnboardingData;
    };
  }>(),
});
