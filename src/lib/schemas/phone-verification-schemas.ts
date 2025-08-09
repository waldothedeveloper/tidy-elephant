import * as v from "valibot";

/**
 * US phone number input schema - accepts formatted display format like (786) 521-3075
 * Will convert to E.164 format internally
 */
export const usPhoneInputSchema = v.object({
  phoneNumber: v.pipe(
    v.string(),
    v.minLength(1, "Phone number is required"),
    v.transform(input => {
      // Extract only digits and ensure it's a 10-digit US number
      const digits = input.replace(/\D/g, "");
      return digits.length === 10 ? `+1${digits}` : input;
    }),
    v.regex(
      /^\+1\d{10}$/,
      "Please enter a valid 10-digit US phone number"
    ),
    v.length(12, "US phone number must be exactly 12 characters (+1 + 10 digits)")
  ),
});

/**
 * US E.164 phone number schema for phone numbers starting with +1
 * Format: +1XXXXXXXXXX (exactly 12 characters total)
 * Examples: +17865213075, +12345678901
 */
export const e164USPhoneNumberSchema = v.object({
  phoneNumber: v.pipe(
    v.string(),
    v.minLength(1, "Phone number is required"),
    v.regex(
      /^\+1\d{10}$/,
      "Phone number must be a US number in E.164 format (e.g., +17865213075)"
    ),
    v.length(12, "US phone number must be exactly 12 characters (+1 + 10 digits)")
  ),
});

/**
 * SMS verification code schema
 * Format: 6-digit numeric string
 */
export const verificationCodeSchema = v.object({
  verificationCode: v.pipe(
    v.string(),
    v.minLength(1, "Verification code is required"),
    v.length(6, "Verification code must be 6 digits"),
    v.regex(/^\d{6}$/, "Verification code must contain only numbers")
  ),
});

// Type exports for use in components and server actions
export type USPhoneInput = v.InferInput<typeof usPhoneInputSchema>;
export type E164USPhoneNumber = v.InferInput<typeof e164USPhoneNumberSchema>;
export type VerificationCode = v.InferInput<typeof verificationCodeSchema>;