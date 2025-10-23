import { and, eq, inArray } from "drizzle-orm";
import {
  categoriesTable,
  providerCategoriesTable,
} from "@/lib/db/category-schema";

import type { CategoriesFormOutput } from "@/app/onboarding/(provider-flow)/select-categories/categories-schema";
import { db } from "@/lib/db";
import { enforceAuthProvider } from "../clerk";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

export async function getCategoriesDAL(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  error?: string;
}> {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        description: categoriesTable.description,
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.sortOrder);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Error in getCategoriesDAL:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

export async function saveProviderCategoriesDAL(
  categoriesData: CategoriesFormOutput
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
      return { success: false, error: "User not found in database" };
    }

    // Check if provider profile exists, if not create it
    const [providerProfile] = await db
      .select({ userId: providerProfilesTable.userId })
      .from(providerProfilesTable)
      .where(eq(providerProfilesTable.userId, user.id))
      .limit(1);

    if (!providerProfile) {
      // Create provider profile if it doesn't exist
      await db.insert(providerProfilesTable).values({
        userId: user.id,
      });
    }

    // Verify all category IDs exist in the database
    const validCategories = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(
        and(
          inArray(categoriesTable.id, categoriesData.categories),
          eq(categoriesTable.isActive, true)
        )
      );

    if (validCategories.length !== categoriesData.categories.length) {
      return {
        success: false,
        error: "Some selected categories are invalid or inactive",
      };
    }

    // Use transaction to ensure atomicity (now supported with neon-serverless driver)
    await db.transaction(async (tx) => {
      // Remove existing provider categories using the correct provider profile ID
      await tx
        .delete(providerCategoriesTable)
        .where(eq(providerCategoriesTable.providerId, user.id));

      // Insert new provider categories if any
      if (categoriesData.categories.length > 0) {
        const categoryInserts = categoriesData.categories.map((categoryId) => ({
          providerId: user.id,
          categoryId: categoryId,
          isMainSpecialty: false, // Could be enhanced to allow setting main specialty
        }));

        await tx.insert(providerCategoriesTable).values(categoryInserts);
      }
    });

    return {
      success: true,
      message: "Categories saved successfully",
    };
  } catch (error) {
    console.error("Error in saveProviderCategoriesDAL:", error);
    return {
      success: false,
      error: "Failed to save categories",
    };
  }
}
