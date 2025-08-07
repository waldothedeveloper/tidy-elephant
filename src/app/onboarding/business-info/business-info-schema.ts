import * as v from "valibot";

import { addressesTable } from "@/lib/db/address-schema";
import { createInsertSchema } from "drizzle-valibot";
import { providerProfilesTable } from "@/lib/db/provider-schema";

// Valid EIN prefixes according to IRS
const VALID_EIN_PREFIXES = [
  // Andover
  "10",
  "12",
  // Atlanta
  "60",
  "67",
  // Austin
  "50",
  "53",
  // Brookhaven
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "11",
  "13",
  "14",
  "16",
  "21",
  "22",
  "23",
  "25",
  "34",
  "51",
  "52",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "65",
  // Cincinnati
  "30",
  "32",
  "35",
  "36",
  "37",
  "38",
  "61",
  // Fresno
  "15",
  "24",
  // Kansas City
  "40",
  "44",
  // Memphis
  "94",
  "95",
  // Ogden
  "80",
  "90",
  // Philadelphia
  "33",
  "39",
  "41",
  "42",
  "43",
  "46",
  "48",
  "62",
  "63",
  "64",
  "66",
  "68",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "85",
  "86",
  "87",
  "88",
  "91",
  "92",
  "93",
  "98",
  "99",
  // Internet
  "20",
  "26",
  "27",
  "45",
  "47",
  "81",
  "82",
  "83",
  "84",
  // SBA
  "31",
];

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
