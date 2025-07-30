/**
 * Zod validation schemas for user-related operations
 * These schemas provide runtime validation for user data
 */

import { z } from "zod";

// =============================================================================
// UTILITY SCHEMAS
// =============================================================================

/**
 * E.164 phone number format validation
 */
export const e164PhoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +1234567890)");

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required");

/**
 * Password validation schema (for forms, not database)
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

/**
 * UUID validation schema
 */
export const uuidSchema = z
  .string()
  .uuid("Invalid UUID format");

// =============================================================================
// USER SCHEMAS
// =============================================================================

/**
 * Base user profile schema for forms
 */
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  
  email: emailSchema,
  
  phoneNumber: e164PhoneNumberSchema.optional(),
  
  about: z
    .string()
    .max(500, "About section must be less than 500 characters")
    .optional(),
});

/**
 * User profile phone verification schema
 */
export const userProfilePhoneVerificationSchema = z.object({
  phoneNumber: e164PhoneNumberSchema,
});

/**
 * User profile verification code schema
 */
export const userProfileCodeVerificationSchema = z.object({
  phoneNumber: e164PhoneNumberSchema,
  verificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

/**
 * User roles schema
 */
export const userRolesSchema = z.array(
  z.enum(["client", "provider", "admin"])
).default([]);

/**
 * User account status schema
 */
export const userAccountStatusSchema = z.enum([
  "active",
  "suspended",
  "deactivated",
  "pending_verification"
]).default("pending_verification");

/**
 * Complete user creation schema
 */
export const createUserSchema = z.object({
  clerkUserID: z.string().min(1, "Clerk user ID is required"),
  email: emailSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: e164PhoneNumberSchema.optional(),
  about: z.string().max(500).optional(),
  roles: userRolesSchema,
  accountStatus: userAccountStatusSchema,
  profilePhotoUrl: z.string().url().optional(),
  referralCode: z.string().optional(),
  referredBy: uuidSchema.optional(),
});

/**
 * User update schema (partial)
 */
export const updateUserSchema = createUserSchema
  .omit({ clerkUserID: true })
  .partial();

// =============================================================================
// PROVIDER SCHEMAS
// =============================================================================

/**
 * Hourly rate validation (in cents, $25-$250 range)
 */
export const hourlyRateSchema = z
  .number()
  .int("Hourly rate must be a whole number")
  .min(2500, "Hourly rate must be at least $25")
  .max(25000, "Hourly rate cannot exceed $250");

/**
 * Years of experience validation
 */
export const yearsExperienceSchema = z
  .number()
  .int("Years of experience must be a whole number")
  .min(0, "Years of experience cannot be negative")
  .max(50, "Years of experience cannot exceed 50 years");

/**
 * Provider profile creation schema
 */
export const createProviderProfileSchema = z.object({
  userId: uuidSchema,
  hourlyRate: hourlyRateSchema.optional(),
  yearsOfExperience: yearsExperienceSchema.optional(),
  
  // Business information
  businessName: z
    .string()
    .max(100, "Business name must be less than 100 characters")
    .optional(),
  
  businessLicense: z
    .string()
    .max(50, "Business license must be less than 50 characters")
    .optional(),
  
  website: z
    .string()
    .url("Invalid website URL")
    .optional(),
  
  // Service areas
  serviceAreas: z
    .array(z.string().max(100))
    .max(10, "Cannot have more than 10 service areas")
    .optional(),
  
  // Languages
  languages: z
    .array(z.string().max(50))
    .max(10, "Cannot list more than 10 languages")
    .optional(),
  
  // Certifications
  certifications: z
    .array(z.string().max(100))
    .max(20, "Cannot list more than 20 certifications")
    .optional(),
  
  // Status fields
  isOnboarded: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  
  // Verification status
  isPhoneVerified: z.boolean().default(false),
  backgroundCheckStatus: z.enum([
    "not_required",
    "pending",
    "in_progress", 
    "completed",
    "failed"
  ]).default("not_required"),
  
  idVerificationStatus: z.enum([
    "not_required",
    "pending",
    "in_progress",
    "completed", 
    "failed"
  ]).default("not_required"),
});

/**
 * Provider profile update schema
 */
export const updateProviderProfileSchema = createProviderProfileSchema
  .omit({ userId: true })
  .partial();

/**
 * Provider onboarding schema (step-by-step)
 */
export const providerOnboardingBasicInfoSchema = z.object({
  firstName: userProfileSchema.shape.firstName,
  lastName: userProfileSchema.shape.lastName,
  email: userProfileSchema.shape.email,
  phoneNumber: userProfileSchema.shape.phoneNumber,
  about: userProfileSchema.shape.about,
});

export const providerOnboardingBusinessInfoSchema = z.object({
  hourlyRate: hourlyRateSchema,
  yearsOfExperience: yearsExperienceSchema.optional(),
  businessName: createProviderProfileSchema.shape.businessName,
  businessLicense: createProviderProfileSchema.shape.businessLicense,
  website: createProviderProfileSchema.shape.website,
});

export const providerOnboardingCategoriesSchema = z.object({
  selectedCategories: z
    .array(uuidSchema)
    .min(1, "Must select at least one category")
    .max(5, "Cannot select more than 5 categories"),
  
  mainSpecialty: uuidSchema.optional(),
});

/**
 * Complete provider onboarding form schema (all steps combined)
 */
export const providerOnboardingFormSchema = z.object({
  // Basic info
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: emailSchema,
  phoneNumber: e164PhoneNumberSchema,
  about: z.string().max(500, "About section must be less than 500 characters"),
  
  // Provider-specific fields
  hourlyRate: hourlyRateSchema,
  yearsOfExperience: yearsExperienceSchema.optional(),
  languages: z.array(z.string().max(50)).max(10).optional(),
  certifications: z.array(z.string().max(100)).max(20).optional(),
  
  // Business info
  businessName: z.string().max(100).optional(),
  businessLicense: z.string().max(50).optional(),
  website: z.string().url("Invalid website URL").optional(),
  
  // Service areas
  serviceAreas: z.array(z.string().max(100)).max(10).optional(),
  
  // Categories (handled separately via junction table)
  selectedCategories: z.array(uuidSchema).min(1, "Must select at least one category").max(5),
  mainSpecialty: uuidSchema.optional(),
});

/**
 * Client onboarding form schema
 */
export const clientOnboardingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: emailSchema,
  phoneNumber: e164PhoneNumberSchema.optional(),
  about: z.string().max(500, "About section must be less than 500 characters").optional(),
  
  // Client preferences
  preferredCategories: z.array(uuidSchema).max(5, "Cannot select more than 5 categories").optional(),
  budgetRange: z.object({
    min: z.number().int().min(2500, "Minimum budget must be at least $25"),
    max: z.number().int().max(50000, "Maximum budget cannot exceed $500"),
  }).optional(),
});

// =============================================================================
// CLIENT SCHEMAS
// =============================================================================

/**
 * Client profile creation schema
 */
export const createClientProfileSchema = z.object({
  userId: uuidSchema,
  isPhoneVerified: z.boolean().default(false),
  
  // Communication preferences
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  
  // Preferences
  preferredProviders: z
    .array(uuidSchema)
    .max(10, "Cannot have more than 10 preferred providers")
    .optional(),
  
  blockedProviders: z
    .array(uuidSchema)
    .max(50, "Cannot have more than 50 blocked providers")
    .optional(),
});

/**
 * Client profile update schema
 */
export const updateClientProfileSchema = createClientProfileSchema
  .omit({ userId: true })
  .partial();

/**
 * Client preferences schema
 */
export const clientPreferencesSchema = z.object({
  budgetRange: z.object({
    min: z.number().int().min(2500, "Minimum budget must be at least $25"),
    max: z.number().int().max(50000, "Maximum budget cannot exceed $500"),
  }).optional(),
  
  preferredTimeSlots: z
    .array(z.enum([
      "early_morning", // 6-9 AM
      "morning",       // 9-12 PM
      "afternoon",     // 12-5 PM
      "evening",       // 5-8 PM
      "weekend"        // Sat/Sun
    ]))
    .optional(),
  
  specialRequirements: z
    .string()
    .max(300, "Special requirements must be less than 300 characters")
    .optional(),
});

// =============================================================================
// CATEGORY SCHEMAS
// =============================================================================

/**
 * Category selection with experience schema
 */
export const categorySelectionSchema = z.object({
  categoryId: uuidSchema,
  isMainSpecialty: z.boolean().default(false),
  experienceYears: z
    .number()
    .int()
    .min(0)
    .max(50)
    .optional(),
});

/**
 * Provider categories schema
 */
export const providerCategoriesSchema = z.object({
  categories: z
    .array(categorySelectionSchema)
    .min(1, "Must select at least one category")
    .max(5, "Cannot select more than 5 categories")
    .refine(
      (categories) => {
        const mainSpecialties = categories.filter(c => c.isMainSpecialty);
        return mainSpecialties.length <= 1;
      },
      "Can only have one main specialty"
    ),
});

/**
 * Client preferred categories schema
 */
export const clientCategoriesSchema = z.object({
  preferredCategories: z
    .array(z.object({
      categoryId: uuidSchema,
      priority: z
        .number()
        .int()
        .min(1, "Priority must be at least 1")
        .max(10, "Priority cannot exceed 10"),
    }))
    .max(5, "Cannot have more than 5 preferred categories"),
});

// =============================================================================
// SEARCH AND FILTER SCHEMAS
// =============================================================================

/**
 * Provider search filters schema
 */
export const providerSearchFiltersSchema = z.object({
  categoryIds: z.array(uuidSchema).optional(),
  
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().int().min(1).max(100), // miles
  }).optional(),
  
  priceRange: z.object({
    min: z.number().int().min(2500), // $25
    max: z.number().int().max(25000), // $250
  }).optional(),
  
  rating: z.number().min(1).max(5).optional(),
  
  experienceYears: z.number().int().min(0).max(50).optional(),
  
  languages: z.array(z.string()).optional(),
  
  search: z.string().max(100).optional(),
  
  sortBy: z.enum(["rating", "price", "experience", "distance"]).default("rating"),
  
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  
  page: z.number().int().min(1).default(1),
  
  limit: z.number().int().min(1).max(50).default(10),
});

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Validation result type
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[]>;
};

/**
 * Helper function to validate data against a schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  });
  
  return {
    success: false,
    errors,
  };
}

/**
 * Helper to get first error message for a field
 */
export function getFirstError(
  errors: Record<string, string[]>,
  field: string
): string | undefined {
  return errors[field]?.[0];
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type PhoneVerificationData = z.infer<typeof userProfilePhoneVerificationSchema>;
export type CodeVerificationData = z.infer<typeof userProfileCodeVerificationSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

export type CreateProviderProfileData = z.infer<typeof createProviderProfileSchema>;
export type UpdateProviderProfileData = z.infer<typeof updateProviderProfileSchema>;
export type ProviderOnboardingBasicInfo = z.infer<typeof providerOnboardingBasicInfoSchema>;
export type ProviderOnboardingBusinessInfo = z.infer<typeof providerOnboardingBusinessInfoSchema>;
export type ProviderOnboardingCategories = z.infer<typeof providerOnboardingCategoriesSchema>;
export type ProviderOnboardingFormData = z.infer<typeof providerOnboardingFormSchema>;
export type ClientOnboardingFormData = z.infer<typeof clientOnboardingFormSchema>;

export type CreateClientProfileData = z.infer<typeof createClientProfileSchema>;
export type UpdateClientProfileData = z.infer<typeof updateClientProfileSchema>;
export type ClientPreferencesData = z.infer<typeof clientPreferencesSchema>;

export type CategorySelectionData = z.infer<typeof categorySelectionSchema>;
export type ProviderCategoriesData = z.infer<typeof providerCategoriesSchema>;
export type ClientCategoriesData = z.infer<typeof clientCategoriesSchema>;

export type ProviderSearchFilters = z.infer<typeof providerSearchFiltersSchema>;