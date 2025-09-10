import { createManagedUserWorkflow } from "@/features/onboarding/inngest/functions";
import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";
import { syncSignUpUser } from "@/features/onboarding/inngest/sync-user";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createManagedUserWorkflow, syncSignUpUser],
});
