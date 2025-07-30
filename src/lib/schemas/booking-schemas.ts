/**
 * Zod validation schemas for booking-related operations
 */

import { z } from "zod";
import { uuidSchema } from "./user-schemas";

// =============================================================================
// BOOKING SCHEMAS
// =============================================================================

/**
 * Booking status enum schema
 */
export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed", 
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

/**
 * Payment status enum schema
 */
export const paymentStatusSchema = z.enum([
  "pending",
  "authorized",
  "captured",
  "completed",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded"
]);

/**
 * Service duration validation (in hours)
 */
export const serviceDurationSchema = z
  .number()
  .min(1, "Service duration must be at least 1 hour")
  .max(12, "Service duration cannot exceed 12 hours");

/**
 * Booking price validation (in cents)
 */
export const bookingPriceSchema = z
  .number()
  .int("Price must be a whole number")
  .min(2500, "Booking price must be at least $25")
  .max(250000, "Booking price cannot exceed $2,500");

/**
 * Service date validation (must be in the future)
 */
export const serviceDateSchema = z
  .date()
  .refine(
    (date) => date > new Date(),
    "Service date must be in the future"
  );

/**
 * Time slot validation (24-hour format)
 */
export const timeSlotSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format");

/**
 * Create booking schema
 */
export const createBookingSchema = z.object({
  clientId: uuidSchema,
  providerId: uuidSchema,
  serviceCategoryId: uuidSchema,
  
  // Service details
  serviceDate: serviceDateSchema,
  startTime: timeSlotSchema,
  duration: serviceDurationSchema,
  
  // Pricing
  hourlyRate: z.number().int().min(2500).max(25000), // Provider's rate at booking time
  totalPrice: bookingPriceSchema,
  
  // Service area
  serviceArea: z
    .string()
    .max(100, "Service area must be less than 100 characters"),
  
  // Special requirements
  specialInstructions: z
    .string()
    .max(500, "Special instructions must be less than 500 characters")
    .optional(),
  
  accessibilityNeeds: z
    .array(z.string().max(50))
    .max(10, "Cannot list more than 10 accessibility needs")
    .optional(),
  
  // Contact preferences
  contactMethod: z.enum(["email", "phone", "app"]).default("app"),
  
  // Terms acceptance
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Must accept terms and conditions"
  }),
  
  privacyPolicyAccepted: z.boolean().refine(val => val === true, {
    message: "Must accept privacy policy"
  }),
});

/**
 * Update booking schema
 */
export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  
  // Reschedule fields
  serviceDate: serviceDateSchema.optional(),
  startTime: timeSlotSchema.optional(),
  duration: serviceDurationSchema.optional(),
  
  // Updated pricing (for changes)
  totalPrice: bookingPriceSchema.optional(),
  
  // Service updates
  specialInstructions: z
    .string()
    .max(500, "Special instructions must be less than 500 characters")
    .optional(),
  
  accessibilityNeeds: z
    .array(z.string().max(50))
    .max(10, "Cannot list more than 10 accessibility needs")
    .optional(),
  
  // Completion details
  completedAt: z.date().optional(),
  
  // Cancellation details
  cancelledAt: z.date().optional(),
  cancellationReason: z
    .string()
    .max(300, "Cancellation reason must be less than 300 characters")
    .optional(),
  
  // No-show details
  noShowAt: z.date().optional(),
  noShowNotes: z
    .string()
    .max(300, "No-show notes must be less than 300 characters")
    .optional(),
});

/**
 * Booking search filters schema
 */
export const bookingSearchFiltersSchema = z.object({
  clientId: uuidSchema.optional(),
  providerId: uuidSchema.optional(),
  status: bookingStatusSchema.optional(),
  categoryId: uuidSchema.optional(),
  
  // Date range filtering
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  
  // Price range filtering
  priceMin: z.number().int().min(0).optional(),
  priceMax: z.number().int().optional(),
  
  // Text search
  search: z.string().max(100).optional(),
  
  // Sorting
  sortBy: z.enum([
    "serviceDate", 
    "createdAt", 
    "totalPrice", 
    "status"
  ]).default("serviceDate"),
  
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  
  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

// =============================================================================
// BOOKING FORM SCHEMAS
// =============================================================================

/**
 * Booking request form schema (client-facing)
 */
export const bookingRequestSchema = z.object({
  providerId: uuidSchema,
  serviceCategoryId: uuidSchema,
  
  // Preferred dates/times
  preferredDate: z.date(),
  preferredTimeSlots: z
    .array(timeSlotSchema)
    .min(1, "Must select at least one time slot")
    .max(3, "Cannot select more than 3 time slots"),
  
  // Alternative dates
  alternativeDates: z
    .array(z.date())
    .max(3, "Cannot select more than 3 alternative dates")
    .optional(),
  
  // Service details
  estimatedDuration: serviceDurationSchema,
  
  // Location
  serviceArea: z.string().min(1, "Service area is required").max(100),
  
  // Requirements
  serviceDescription: z
    .string()
    .min(10, "Service description must be at least 10 characters")
    .max(500, "Service description must be less than 500 characters"),
  
  specialInstructions: z
    .string()
    .max(500, "Special instructions must be less than 500 characters")
    .optional(),
  
  accessibilityNeeds: z
    .array(z.string().max(50))
    .max(10, "Cannot list more than 10 accessibility needs")
    .optional(),
  
  // Budget
  budgetRange: z.object({
    min: z.number().int().min(2500),
    max: z.number().int().max(250000),
  }).optional(),
  
  // Contact preferences
  contactMethod: z.enum(["email", "phone", "app"]).default("app"),
  
  // Urgency
  isUrgent: z.boolean().default(false),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Must accept terms and conditions"
  }),
});

/**
 * Provider booking response schema
 */
export const providerBookingResponseSchema = z.object({
  bookingId: uuidSchema,
  
  response: z.enum(["accept", "decline", "counter_offer"]),
  
  // For accepted bookings
  confirmedDate: z.date().optional(),
  confirmedTime: timeSlotSchema.optional(),
  confirmedDuration: serviceDurationSchema.optional(),
  confirmedPrice: bookingPriceSchema.optional(),
  
  // For declined bookings
  declineReason: z
    .string()
    .max(300, "Decline reason must be less than 300 characters")
    .optional(),
  
  // For counter offers
  counterOfferDate: z.date().optional(),
  counterOfferTime: timeSlotSchema.optional(),
  counterOfferDuration: serviceDurationSchema.optional(),
  counterOfferPrice: bookingPriceSchema.optional(),
  counterOfferNotes: z
    .string()
    .max(300, "Counter offer notes must be less than 300 characters")
    .optional(),
  
  // Provider notes
  providerNotes: z
    .string()
    .max(500, "Provider notes must be less than 500 characters")
    .optional(),
});

// =============================================================================
// BOOKING MODIFICATION SCHEMAS
// =============================================================================

/**
 * Reschedule booking schema
 */
export const rescheduleBookingSchema = z.object({
  bookingId: uuidSchema,
  newDate: serviceDateSchema,
  newTime: timeSlotSchema,
  newDuration: serviceDurationSchema.optional(),
  rescheduleReason: z
    .string()
    .min(5, "Reschedule reason must be at least 5 characters")
    .max(300, "Reschedule reason must be less than 300 characters"),
});

/**
 * Cancel booking schema
 */
export const cancelBookingSchema = z.object({
  bookingId: uuidSchema,
  cancellationReason: z
    .string()
    .min(5, "Cancellation reason must be at least 5 characters")
    .max(300, "Cancellation reason must be less than 300 characters"),
  refundRequested: z.boolean().default(false),
});

/**
 * Complete booking schema (provider)
 */
export const completeBookingSchema = z.object({
  bookingId: uuidSchema,
  actualDuration: serviceDurationSchema.optional(),
  completionNotes: z
    .string()
    .max(500, "Completion notes must be less than 500 characters")
    .optional(),
  additionalCharges: z
    .number()
    .int()
    .min(0, "Additional charges cannot be negative")
    .optional(),
  additionalChargesReason: z
    .string()
    .max(300, "Additional charges reason must be less than 300 characters")
    .optional(),
});

// =============================================================================
// REVIEW SCHEMAS
// =============================================================================

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
  bookingId: uuidSchema,
  clientId: uuidSchema,
  providerId: uuidSchema,
  
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  
  comment: z
    .string()
    .min(10, "Review comment must be at least 10 characters")
    .max(1000, "Review comment must be less than 1000 characters"),
  
  // Rating breakdown
  communicationRating: z.number().int().min(1).max(5).optional(),
  qualityRating: z.number().int().min(1).max(5).optional(),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  professionalismRating: z.number().int().min(1).max(5).optional(),
  
  // Recommendation
  wouldRecommend: z.boolean(),
  
  // Photo uploads
  photoUrls: z
    .array(z.string().url())
    .max(5, "Cannot upload more than 5 photos")
    .optional(),
});

/**
 * Provider review response schema
 */
export const reviewResponseSchema = z.object({
  reviewId: uuidSchema,
  response: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(500, "Response must be less than 500 characters"),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type UpdateBookingData = z.infer<typeof updateBookingSchema>;
export type BookingSearchFilters = z.infer<typeof bookingSearchFiltersSchema>;
export type BookingRequestData = z.infer<typeof bookingRequestSchema>;
export type ProviderBookingResponseData = z.infer<typeof providerBookingResponseSchema>;
export type RescheduleBookingData = z.infer<typeof rescheduleBookingSchema>;
export type CancelBookingData = z.infer<typeof cancelBookingSchema>;
export type CompleteBookingData = z.infer<typeof completeBookingSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type ReviewResponseData = z.infer<typeof reviewResponseSchema>;

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;