import * as v from "valibot";

import { VALID_EIN_PREFIXES } from "@/app/utils/index";
import { addressesTable } from "@/lib/db/address-schema";
import { createInsertSchema } from "drizzle-valibot";
import { providerProfilesTable } from "@/lib/db/provider-schema";

// Create base schemas from Drizzle tables
const providerBusinessInsertSchema = createInsertSchema(providerProfilesTable, {
  businessType: v.pipe(
    v.picklist([
      "sole_proprietorship",
      "partnership",
      "llc",
      "corporation",
      "s_corporation",
      "other",
    ]),
    v.transform((input) => input)
  ),
  businessName: v.pipe(
    v.string(),
    v.minLength(1, "Business name is required"),
    v.maxLength(255, "Business name must be less than 255 characters")
  ),
  businessPhone: v.pipe(
    v.string(),
    v.minLength(1, "Business phone is required")
  ),
  employerEin: v.pipe(
    v.string(),
    v.minLength(1, "EIN is required"),
    v.regex(
      /^\d{2}-\d{7}$/,
      "EIN must be in format XX-XXXXXXX (e.g., 12-3456789)"
    ),
    v.length(10, "EIN must be exactly 10 characters including the dash"),
    v.check((ein) => {
      const prefix = ein.substring(0, 2);
      const isValid = VALID_EIN_PREFIXES.includes(prefix);

      return isValid;
    }, "Please enter a valid EIN number")
  ),
});

const businessAddressInsertSchema = createInsertSchema(addressesTable, {
  addressLine1: v.pipe(
    v.string(),
    v.minLength(1, "Address line 1 is required"),
    v.maxLength(255, "Address line 1 must be less than 255 characters")
  ),
  addressLine2: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(255, "Address line 2 must be less than 255 characters")
    )
  ),
  city: v.pipe(
    v.string(),
    v.minLength(1, "City is required"),
    v.maxLength(100, "City must be less than 100 characters")
  ),
  state: v.pipe(
    v.string(),
    v.minLength(2, "State is required"),
    v.maxLength(50, "State must be less than 50 characters")
  ),
  postalCode: v.pipe(
    v.string(),
    v.minLength(1, "Postal code is required"),
    v.regex(
      /^\d{5}(-\d{4})?$/,
      "Please enter a valid ZIP code (12345 or 12345-6789)"
    )
  ),
  country: v.literal("US"),
});

// Combined business info schema for the form
export const businessInfoFormSchema = v.pipe(
  v.object({
    // Business information
    businessType: providerBusinessInsertSchema.entries.businessType,
    businessTypeOther: v.optional(
      v.pipe(
        v.string(),
        v.maxLength(100, "Other business type must be less than 100 characters")
      )
    ),
    businessName: providerBusinessInsertSchema.entries.businessName,
    businessPhone: providerBusinessInsertSchema.entries.businessPhone,
    employerEin: providerBusinessInsertSchema.entries.employerEin,

    // Business address
    addressLine1: businessAddressInsertSchema.entries.addressLine1,
    addressLine2: businessAddressInsertSchema.entries.addressLine2,
    city: businessAddressInsertSchema.entries.city,
    state: businessAddressInsertSchema.entries.state,
    postalCode: businessAddressInsertSchema.entries.postalCode,
    country: businessAddressInsertSchema.entries.country,
  }),
  // Custom validation for "other" business type
  v.check((data) => {
    if (data.businessType === "other" && !data.businessTypeOther?.trim()) {
      return false;
    }
    return true;
  }, "Please specify your business type when selecting 'Other'")
);

// Type inference
export type BusinessInfoFormInput = v.InferInput<typeof businessInfoFormSchema>;
export type BusinessInfoFormOutput = v.InferOutput<
  typeof businessInfoFormSchema
>;
