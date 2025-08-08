import {
  categoriesTable,
  providerCategoriesTable,
} from "@/lib/db/category-schema";
import { and, eq, inArray } from "drizzle-orm";

import type { CategoriesFormOutput } from "@/app/onboarding/select-categories/categories-schema";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/user-schema";
import { enforceAuthProvider } from "../clerk";

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
      throw new Error("User not found in database");
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

    // Remove existing provider categories
    await db
      .delete(providerCategoriesTable)
      .where(eq(providerCategoriesTable.providerId, user.id));

    // Insert new provider categories
    const categoryInserts = categoriesData.categories.map((categoryId) => ({
      providerId: user.id,
      categoryId: categoryId,
      isMainSpecialty: false, // Could be enhanced to allow setting main specialty
    }));

    await db.insert(providerCategoriesTable).values(categoryInserts);

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
