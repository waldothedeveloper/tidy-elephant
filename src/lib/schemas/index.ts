import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, { error: "The first name should be at least 2 characters long" })
    .max(50, { error: "The first name should not exceed 50 characters" }),
  lastName: z
    .string()
    .min(2, { error: "The last name should be at least 2 characters long" })
    .max(70, { error: "The last name should not exceed 70 characters" }),
  about: z
    .string()
    .min(160, {
      error: "The about section should be at least 160 characters long",
    })
    .max(1000, {
      error: "The about section should not exceed 1000 characters",
    }),
  photo: z.url({
    error: "Please upload a photo so customers can recognize you",
  }),
});

// Validate formatted phone number (xxx) xxx-xxxx
export const userProfilePhoneVerificationSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, {
      error: "Please enter a valid phone number.",
    })
    .length(14, { error: "Phone number must be exactly 10 characters" }),
});

export const userProfileCodeVerificationSchema = z.object({
  verificationCode: z.string().min(6, {
    error: "Verification code must be exactly 6 digits",
  }),
});

export const e164PhoneNumberSchema = z.object({
  phoneNumber: z.string().regex(/^\+1\d{10}$/, {
    error:
      "Phone number must be in E.164 format for US numbers, e.g., +13055555555",
  }),
});

export const userCategoriesSchema = z.object({
  categories: z
    .array(z.string().min(1, "Category ID cannot be empty"))
    .min(1, {
      message: "You must select at least one category to provide services in.",
    })
    .refine(
      (categories) => {
        // Ensure no duplicate categories
        const uniqueCategories = new Set(categories);
        return uniqueCategories.size === categories.length;
      },
      {
        message: "You cannot select the same category multiple times.",
      }
    ),
});

// Input schema for form validation (string input)
export const userHourlyRateInputSchema = z.object({
  hourlyRate: z
    .string()
    .min(1, {
      message: "Please enter your hourly rate.",
    })
    .regex(/^\d+$/, {
      message: "Hourly rate must be a whole number (no cents or decimals).",
    })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 25;
    }, {
      message: "Hourly rate must be at least $25 per hour.",
    })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num <= 250;
    }, {
      message: "Hourly rate cannot exceed $250 per hour.",
    }),
});

// Processed schema for internal use (string -> number transformation)
export const userHourlyRateSchema = userHourlyRateInputSchema.transform((data) => ({
  hourlyRate: parseInt(data.hourlyRate, 10),
}));
