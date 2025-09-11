import "server-only";

import type { ClerkUserCreatedData } from "@/types/clerk-webhook";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { usersTable } from "@/lib/db/user-schema";
import { parseISO, isValid } from "date-fns";

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Date) return value;
  
  if (typeof value === "number") {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  
  if (typeof value === "string") {
    const isoDate = parseISO(value);
    return isValid(isoDate) ? isoDate : null;
  }
  
  return null;
}

export const syncSignUpUser = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const payload: ClerkUserCreatedData = event.data;

      const externalAccounts = payload.external_accounts ?? [];
      const googleAccount = externalAccounts.find(
        (a) =>
          a?.provider === "oauth_google" || (a?.object ?? "").includes("google")
      );
      const extAccount = googleAccount || externalAccounts[0];
      const externalEmail: string | undefined = extAccount?.email_address;

      const emailAddresses = payload.email_addresses ?? [];
      const primaryEmailObj = emailAddresses.find(
        (e) => e.id === payload.primary_email_address_id
      );
      const verifiedEmailObj = emailAddresses.find(
        (e) => e.verification?.status === "verified"
      );
      const firstEmailObj = emailAddresses[0];

      const chosenEmail =
        externalEmail ||
        primaryEmailObj?.email_address ||
        verifiedEmailObj?.email_address ||
        firstEmailObj?.email_address ||
        null;

      if (!chosenEmail) {
        throw new Error(
          `sync-user: No email address available in Clerk event payload (userId=${payload?.id})`
        );
      }

      const isEmailVerified = Boolean(
        extAccount?.verification?.status === "verified" ||
          primaryEmailObj?.verification?.status === "verified" ||
          verifiedEmailObj?.verification?.status === "verified" ||
          firstEmailObj?.verification?.status === "verified"
      );

      const chosenPhone: string | null = null;

      const newUser = {
        clerkUserID: payload.id,
        email: chosenEmail,
        firstname: payload.first_name || "",
        lastname: payload.last_name || "",
        phone: chosenPhone,
        profileImage: payload.image_url || extAccount?.image_url || null,
        isEmailVerified,
        agreedToTerms: true,
        agreedToTermsAt:
          toDateOrNull(payload.legal_accepted_at) ??
          toDateOrNull(payload.created_at) ??
          new Date(),
        privacyPolicyAccepted: true,
        createdAt: toDateOrNull(payload.created_at) ?? new Date(),
      };

      await db.insert(usersTable).values(newUser).onConflictDoNothing();

      return { success: true, userId: payload.id };
    } catch (error) {
      console.error("Error syncing user from Clerk:", error);
      throw error;
    }
  }
);
