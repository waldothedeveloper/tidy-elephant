import "server-only";

import { db } from "@/lib/db";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { eq } from "drizzle-orm";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

export async function saveProviderWorkPhotosDAL(
  workPhotosUrls: string[]
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
        workPhotos: workPhotosUrls,
      })
      .onConflictDoUpdate({
        target: providerProfilesTable.userId,
        set: {
          workPhotos: workPhotosUrls,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
      message: "Work photos saved successfully",
    };
  } catch (error) {
    console.error("Error in saveProviderWorkPhotosDAL:", error);
    return {
      success: false,
      error: "Failed to save work photos",
    };
  }
}