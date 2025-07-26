import { z } from "zod";

// Zod enum schema based on your ProviderCategoryType
export const ProviderCategoryTypeSchema = z.enum([
  "CORE_PROFESSIONAL_ORGANIZERS",
  "MOVE_MANAGERS_DOWNSIZING",
  "TIME_PRODUCTIVITY_COACHES",
  "HOME_STAGERS",
  "OFFICE_ORGANIZERS",
  "DIGITAL_ORGANIZERS",
  "INTERIOR_DESIGNERS",
  "PAPERWORK_DOCUMENT_ORGANIZERS",
  "FENG_SHUI_CONSULTANTS",
  "HOME_ORGANIZERS",
  "ESTATE_CLEANOUT_HOARDING",
]);

// Individual provider category schema
export const ProviderCategorySchema = z.object({
  name: ProviderCategoryTypeSchema,
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
});

// Array of provider categories schema
export const ProviderCategoriesSchema = z.array(ProviderCategorySchema);

// Type inference from schemas
export type ProviderCategoryType = z.infer<typeof ProviderCategoryTypeSchema>;
export type ProviderCategory = z.infer<typeof ProviderCategorySchema>;
export type ProviderCategories = z.infer<typeof ProviderCategoriesSchema>;

// Schema for creating a new provider category (excluding auto-generated fields)
export const CreateProviderCategorySchema = z.object({
  name: ProviderCategoryTypeSchema,
  description: z.string().min(10).max(500),
  isActive: z.boolean().default(true).optional(),
});

// Schema for updating a provider category
export const UpdateProviderCategorySchema = z.object({
  name: ProviderCategoryTypeSchema.optional(),
  description: z.string().min(10).max(500).optional(),
  isActive: z.boolean().optional(),
});
