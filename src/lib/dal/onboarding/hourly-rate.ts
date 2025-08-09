import "server-only";

import type { CreateHourlyRateOutput } from "@/app/onboarding/hourly-rate/hourly-rate-schema";
import { db } from "@/lib/db";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { eq } from "drizzle-orm";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

export async function saveProviderHourlyRateDAL(
  hourlyRateData: CreateHourlyRateOutput
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
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
        error: "User not found in database",
      };
    }

    await db
      .insert(providerProfilesTable)
      .values({
        userId: user.id,
        hourlyRate: hourlyRateData.hourlyRate,
      })
      .onConflictDoUpdate({
        target: providerProfilesTable.userId,
        set: {
          hourlyRate: hourlyRateData.hourlyRate,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
      message: "Hourly rate saved successfully",
    };
  } catch (error) {
    console.error("Error in saveProviderHourlyRateDAL:", error);
    return {
      success: false,
      error: "Failed to save hourly rate",
    };
  }
}
