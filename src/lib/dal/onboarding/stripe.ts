import "server-only";

import { db } from "@/lib/db";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { eq } from "drizzle-orm";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

export const getProviderStripeAccountDAL = async (): Promise<string | null> => {
  const clerkUserId = await enforceAuthProvider();

  const [row] = await db
    .select({
      stripeAccountId: providerProfilesTable.stripeConnectedAccountId,
    })
    .from(usersTable)
    .innerJoin(
      providerProfilesTable,
      eq(providerProfilesTable.userId, usersTable.id)
    )
    .where(eq(usersTable.clerkUserID, clerkUserId))
    .limit(1);

  return row?.stripeAccountId ?? null;
};

type SaveStripeAccountIdResult =
  | { success: true }
  | { success: false; error: string };

export const saveProviderStripeAccountDAL = async (
  accountId: string
): Promise<SaveStripeAccountIdResult> => {
  try {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User record not found",
      };
    }

    await db
      .insert(providerProfilesTable)
      .values({
        userId: user.id,
        stripeConnectedAccountId: accountId,
      })
      .onConflictDoUpdate({
        target: providerProfilesTable.userId,
        set: {
          stripeConnectedAccountId: accountId,
          // TODO: The updatedAt basically for all records should NOT use any timezone, more life UTF or similar
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Failed to save provider Stripe account ID", error);

    return {
      success: false,
      error: "Database update failed",
    };
  }
};
