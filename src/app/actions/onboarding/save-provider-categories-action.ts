"use server";

import * as v from "valibot";

import {
  categoriesFormSchema,
  type CategoriesFormInput,
} from "@/app/onboarding/select-categories/categories-schema";
import { saveProviderCategoriesDAL } from "@/lib/dal/onboarding/categories";
import { auth } from "@clerk/nextjs/server";

interface ProviderCategoriesResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function saveProviderCategoriesAction(
  formData: CategoriesFormInput
): Promise<ProviderCategoriesResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  const validationResult = v.safeParse(categoriesFormSchema, formData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid category selection provided.",
    };
  }

  try {
    const result = await saveProviderCategoriesDAL(validationResult.output);
    return result;
  } catch (error) {
    console.error("Error saving provider categories:", error);
    return {
      success: false,
      error: "Unable to save categories. Please try again later.",
    };
  }
}
