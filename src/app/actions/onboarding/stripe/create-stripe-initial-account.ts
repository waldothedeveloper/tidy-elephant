import { createErrorResponse } from "@/types/api-responses";
import { enforceAuthProvider } from "@/lib/dal/clerk";

export async function createStripeInitialAccount() {
  try {
    await enforceAuthProvider();
  } catch {
    return createErrorResponse({
      message: "Authentication required. Please sign in and try again.",
    });
  }
}
