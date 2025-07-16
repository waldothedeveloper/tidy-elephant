"use server";

import { addClerkProviderMetadataDAL } from "@/lib/dal";

export async function clerkAddProviderOnboardingMetadataAction() {
  return await addClerkProviderMetadataDAL();
}
