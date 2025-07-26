import { ProviderCategoriesSchema } from "./category-schemas";
import { z } from "zod";

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
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return num >= 25;
      },
      {
        message: "Hourly rate must be at least $25 per hour.",
      }
    )
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return num <= 250;
      },
      {
        message: "Hourly rate cannot exceed $250 per hour.",
      }
    ),
});

// Processed schema for internal use (string -> number transformation)
export const userHourlyRateSchema = userHourlyRateInputSchema.transform(
  (data) => ({
    hourlyRate: parseInt(data.hourlyRate, 10),
  })
);

export const workPhotosSchema = z
  .array(z.url("Each photo must be a valid URL"))
  .min(3, {
    message: "Please upload at least 3 work photos to showcase your services.",
  })
  .max(8, {
    message: "You can upload a maximum of 8 work photos.",
  });

export const responseFromProviderSchema = z.object({
  response: z.string().min(10, {
    error: "Response must be at least 10 characters long",
  }),
  createdAt: z.date().default(() => new Date()),
});

//!! THIS IS THE MAIN USER PROFILE SCHEMA
export const userProfileSchema = z.object({
  createdAt: z
    .date({
      error: "Created at date is required",
    })
    .default(new Date()),
  updatedAt: z.date().nullable().default(null),
  // we might need to have a more specific type schema for Clerk user ID
  clerkUserID: z.string({
    error: "Clerk user ID is required",
  }),
  profile: z.object({
    firstName: z.string().min(2, {
      error: "First name must be at least 2 characters long",
    }),
    lastName: z.string().min(2, {
      error: "Last name must be at least 2 characters long",
    }),
    about: z.string().min(160, {
      error: "About section must be at least 160 characters long",
    }),
    photo: z.url({
      error: "Profile photo URL is required",
    }),
    email: z.email({
      error: "A valid email address is required",
    }),
    phoneNumber: userProfilePhoneVerificationSchema,
    address: z.string().optional(),
  }),
  roles: z.object({
    provider: z.boolean().default(false),
    client: z.boolean().default(false),
    admin: z.boolean().default(false),
  }),
  providerDetails: z
    .object({
      isOnboarded: z.boolean().default(false),
      isActive: z.boolean().default(true),
      isPhoneVerified: z.boolean().default(false),
      workPhotos: workPhotosSchema.nullable(),
      categories: ProviderCategoriesSchema.min(1, {
        error: "If categories are provided, at least one is required",
      }).nullable(),
      hourlyRate: z.number().int().min(2500).max(25000).nullable(), // Stored in cents
      availability: z.object({}).optional(), // Placeholder for availability schema
      businessInfo: z.object({}).optional(), // Placeholder for business info schema
      certifications: z.array(z.string()).optional(),
      experience: z.number().int().min(0).optional(),
      languages: z.array(z.string()).optional(),
    })
    .optional(),
  ProviderRatings: z
    .object({
      averageRating: z.number().min(0).max(5).optional(),
      totalReviews: z.number().int().min(0).optional(),
      ratingBreakdown: z
        .object({
          oneStar: z.number().int().min(0).optional(),
          twoStar: z.number().int().min(0).optional(),
          threeStar: z.number().int().min(0).optional(),
          fourStar: z.number().int().min(0).optional(),
          fiveStar: z.number().int().min(0).optional(),
        })
        .optional(),
    })
    .optional(),
  providerReviews: z
    .array(
      z.object({
        bookingID: z.string(),
        clientID: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(10, {
          error: "Review comment must be at least 10 characters long",
        }),
        createdAt: z.date().default(() => new Date()),
        isVerfified: z.boolean().default(false),
        responseFromProvider: responseFromProviderSchema,
      })
    )
    .optional(),
  bookingHistory: z
    .array(
      z.object({
        bookingID: z.string(),
        clientID: z.string(),
        providerID: z.string(),
        serviceCategory: z.string(),
        scheduledDate: z.date(),
        serviceArea: z.string(), //what the heck are we gonna put here?
        bookingDate: z.date(),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
          message: "Start time must be in HH:mm format (24-hour)",
        }),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
          message: "End time must be in HH:mm format (24-hour)",
        }),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        createdAt: z.date().default(() => new Date()),
        updatedAt: z.date().nullable().default(null),
      })
    )
    .optional(),
  clientPreferences: z
    .object({
      preferredContactMethod: z.enum(["email", "phone", "text"]).optional(),
      preferredServiceCategories: z.array(z.string()).optional(),
      preferredLanguages: z.array(z.string()).optional(),
      preferredProviders: z.array(z.string()).optional(),
      blockedProviders: z.array(z.string()).optional(),
      // budgetRange: z.number().int().min(25000).optional()
      timePreferences: z.object({
        preferredDays: z.array(z.string()).optional(),
        preferredTimes: z.array(z.string()).optional(),
      }),
    })
    .optional(),
});

// Validate formatted phone number (xxx) xxx-xxxx

const timeSlotSchema = z
  .object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Start time must be in HH:mm format (24-hour)",
    }),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "End time must be in HH:mm format (24-hour)",
    }),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const providerAvailabilitySchema = z
  .object({
    monday: z.array(timeSlotSchema).optional(),
    tuesday: z.array(timeSlotSchema).optional(),
    wednesday: z.array(timeSlotSchema).optional(),
    thursday: z.array(timeSlotSchema).optional(),
    friday: z.array(timeSlotSchema).optional(),
    saturday: z.array(timeSlotSchema).optional(),
    sunday: z.array(timeSlotSchema).optional(),
    blackoutDates: z.array(z.date()).optional(),
  })
  .refine(
    (data) => {
      const hasAtLeastOneDay = Object.values(data).some(
        (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          Array.isArray(value[0]) === false
      );
      return hasAtLeastOneDay;
    },
    {
      message: "Please set your availability for at least one day of the week",
    }
  );
