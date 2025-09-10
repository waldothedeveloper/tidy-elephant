import "server-only";

import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { usersTable } from "@/lib/db/user-schema";

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "number" || typeof value === "string")
    return new Date(value);
  return null;
}

export const syncSignUpUser = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const payload = event as unknown as WebhookEvent;
      if (payload.type !== "user.created") {
        throw new Error(
          `sync-user: Unexpected Clerk event type: ${payload.type}`
        );
      }

      const userData = payload.data;

      // Prefer external account email (e.g., Google) when available
      const externalAccounts = userData.external_accounts ?? [];
      const googleAccount = externalAccounts.find(
        (a) =>
          a?.provider === "oauth_google" || (a?.object ?? "").includes("google")
      );
      const extAccount = googleAccount || externalAccounts[0];
      const externalEmail: string | undefined = extAccount?.email_address;

      // Fallbacks to Clerk email addresses
      const emailAddresses = userData.email_addresses ?? [];
      const primaryEmailObj = emailAddresses.find(
        (e) => e.id === userData.primary_email_address_id
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
          `sync-user: No email address available in Clerk event payload (userId=${userData?.id})`
        );
      }

      const isEmailVerified = Boolean(
        extAccount?.verification?.status === "verified" ||
          primaryEmailObj?.verification?.status === "verified" ||
          verifiedEmailObj?.verification?.status === "verified" ||
          firstEmailObj?.verification?.status === "verified"
      );

      // Normalize phone (store only valid E.164 +1XXXXXXXXXX or null)
      const chosenPhone: string | null = null;

      const newUser = {
        clerkUserID: userData.id,
        email: chosenEmail,
        firstname: userData.first_name || "",
        lastname: userData.last_name || "",
        phone: chosenPhone,
        profileImage: userData.image_url || extAccount?.image_url || null,
        isEmailVerified,
        agreedToTerms: true,
        agreedToTermsAt:
          toDateOrNull(userData.legal_accepted_at) ??
          toDateOrNull(userData.created_at) ??
          new Date(),
        privacyPolicyAccepted: true,
        createdAt: toDateOrNull(userData.created_at) ?? new Date(),
      };

      // console.info("sync-user: inserting user", {
      //   userId: userData.id,
      //   chosenEmail,
      //   emailSource: extAccount
      //     ? "external_account"
      //     : primaryEmailObj
      //       ? "primary_email"
      //       : verifiedEmailObj
      //         ? "verified_email"
      //         : firstEmailObj
      //           ? "first_email"
      //           : "unknown",
      //   isEmailVerified,
      //   emailAddressesCount: emailAddresses.length,
      //   externalAccountsCount: externalAccounts.length,
      // });

      await db.insert(usersTable).values(newUser).onConflictDoNothing();

      return { success: true, userId: userData.id };
    } catch (error) {
      console.error("Error syncing user from Clerk:", error);
      throw error;
    }
  }
);
