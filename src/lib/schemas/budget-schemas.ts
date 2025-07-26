import { z } from "zod";

// Option 1: Simple min/max budget object
export const BudgetRangeSchema = z
  .object({
    min: z
      .number()
      .min(50, "Minimum budget must be at least $50")
      .max(999999, "Minimum budget cannot exceed $999,999"),
    max: z
      .number()
      .min(100, "Maximum budget must be at least $100")
      .max(1000000, "Maximum budget cannot exceed $1,000,000"),
  })
  .refine((data) => data.max > data.min, {
    message: "Maximum budget must be greater than minimum budget",
    path: ["max"],
  });

// Option 2: Predefined budget ranges (most user-friendly)
export const BudgetRangeEnum = z.enum([
  "UNDER_500",
  "500_TO_1000",
  "1000_TO_2500",
  "2500_TO_5000",
  "5000_TO_10000",
  "10000_TO_25000",
  "25000_PLUS",
  "CONTACT_FOR_QUOTE",
]);

// Option 3: Single budget with flexibility
export const SingleBudgetSchema = z.object({
  amount: z
    .number()
    .min(50, "Budget must be at least $50")
    .max(1000000, "Budget cannot exceed $1,000,000"),
  isFlexible: z.boolean().default(false),
  currency: z.enum(["USD", "CAD", "EUR", "GBP"]).default("USD"),
});

// Option 4: More detailed budget structure
export const DetailedBudgetSchema = z.object({
  range: BudgetRangeSchema,
  isNegotiable: z.boolean().default(true),
  paymentPreference: z
    .enum(["HOURLY", "PROJECT_BASED", "PACKAGE_DEAL", "FLEXIBLE"])
    .optional(),
  currency: z.enum(["USD", "CAD", "EUR", "GBP"]).default("USD"),
  notes: z.string().max(500).optional(),
});

// Option 5: Budget with reasonable constraints and no hard maximum
export const FlexibleBudgetSchema = z
  .object({
    min: z.number().min(50, "Minimum budget must be at least $50"),
    max: z.number().min(100, "Maximum budget must be at least $100").optional(), // No maximum constraint - let users set what they want
    hasNoMaximum: z.boolean().default(false), // Flag for "unlimited" budget
  })
  .refine(
    (data) => {
      if (data.max && data.hasNoMaximum) {
        return false; // Can't have both max value and "no maximum"
      }
      if (data.max && data.max <= data.min) {
        return false; // Max must be greater than min if provided
      }
      return true;
    },
    {
      message: "Invalid budget range configuration",
    }
  );

/*
  ***
 
  This could be useful because we could ask the users trying to book a provider without a specific budget in mind, allowing for more flexible negotiations. We would ask the user, what's your budget? And they could select a range, or say "I don't have a maximum budget" and we would set hasNoMaximum to true.
  This would allow us to handle cases where users are open to discussing budgets without a strict upper limit, while still providing a structured way to capture their minimum expectations.

  If the answer is a range, we would show the range options,
  If the answer is I have a fixed budget, we would use SingleBudgetSchema,
  If the answer is I prefer a pre-defined range, we would use BudgetRangeEnum,
  If the answer is I want to discuss this in a consultation, we would use a ConsultationBudgetSchema.
  If the answer is I have a flexible budget, we would use FlexibleBudgetSchema.
  If the answer is I want to set a specific budget, we would use DetailedBudgetSchema
  
 ***
  */
// Option 6: Union type for different budget approaches
export const UniversalBudgetSchema = z.union([
  z.object({
    type: z.literal("RANGE"),
    budget: BudgetRangeSchema,
  }),
  z.object({
    type: z.literal("FIXED"),
    budget: z.object({
      amount: z.number().min(50).max(1000000),
    }),
  }),
  z.object({
    type: z.literal("PREDEFINED"),
    budget: z.object({
      range: BudgetRangeEnum,
    }),
  }),
  z.object({
    type: z.literal("CONSULTATION"),
    budget: z.object({
      message: z.string().max(200).optional(),
    }),
  }),
]);

// Helper function to convert enum to readable ranges
export function getBudgetRangeDisplay(
  range: z.infer<typeof BudgetRangeEnum>
): string {
  const ranges = {
    UNDER_500: "Under $500",
    "500_TO_1000": "$500 - $1,000",
    "1000_TO_2500": "$1,000 - $2,500",
    "2500_TO_5000": "$2,500 - $5,000",
    "5000_TO_10000": "$5,000 - $10,000",
    "10000_TO_25000": "$10,000 - $25,000",
    "25000_PLUS": "$25,000+",
    CONTACT_FOR_QUOTE: "Contact for Quote",
  };
  return ranges[range];
}
