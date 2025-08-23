import { createManagedUserWorkflow } from "@/features/onboarding/inngest/functions";
import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createManagedUserWorkflow],
});
