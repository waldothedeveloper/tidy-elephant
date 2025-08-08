import * as v from "valibot";

import { categoriesTable } from "@/lib/db/category-schema";
import { createSelectSchema } from "drizzle-valibot";

// Schema for category data returned from database (full schema)
export const categorySelectSchema = createSelectSchema(categoriesTable);

// Schema for the minimal category data needed for display (pick specific fields)
export const categoryDisplaySchema = v.pick(categorySelectSchema, ["id", "name", "description"]);

// Schema for the categories form (derived from validation needs)
export const categoriesFormSchema = v.pipe(
  v.object({
    categories: v.pipe(
      v.array(v.string()),
      v.minLength(1, "Please select at least one service category"),
      v.maxLength(11, "You can select up to 11 categories maximum"),
      v.check(arr => new Set(arr).size === arr.length, "Duplicate categories are not allowed")
    ),
  }),
  v.check((data) => {
    // Ensure all category IDs are valid UUIDs
    return data.categories.every((categoryId) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(categoryId);
    });
  }, "Invalid category selection")
);

// Type inference
export type CategoriesFormInput = v.InferInput<typeof categoriesFormSchema>;
export type CategoriesFormOutput = v.InferOutput<typeof categoriesFormSchema>;
export type CategoryData = v.InferOutput<typeof categoryDisplaySchema>;
