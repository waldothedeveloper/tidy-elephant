/**
 * Generated types from Drizzle schemas for type-safe database operations
 * This file provides TypeScript types derived from our database schemas
 * 
 * Generated on: 2025-07-30T04:01:31.181Z
 * 
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To regenerate: npm run types:generate
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Import all schema tables
import { addressesTable, userAddressesTable, bookingAddressesTable } from "./address-schema";
import { bookingsTable } from "./booking-schema";
import { categoriesTable, providerCategoriesTable, clientPreferredCategoriesTable } from "./category-schema";
import { clientProfilesTable } from "./client-schema";
import { paymentTransactionsTable } from "./payment-schema";
import { providerProfilesTable } from "./provider-schema";
import { reviewsTable } from "./review-schema";
import { usersTable } from "./user-schema";

// =============================================================================
// GENERATED TYPES
// =============================================================================

// Types for address schema
export type Address = InferSelectModel<typeof addressesTable>;
export type InsertAddress = InferInsertModel<typeof addressesTable>;
export type UpdateAddress = Partial<Omit<InsertAddress, "id" | "createdAt">>;
export type UserAddress = InferSelectModel<typeof userAddressesTable>;
export type InsertUserAddress = InferInsertModel<typeof userAddressesTable>;
export type UpdateUserAddress = Partial<Omit<InsertUserAddress, "id" | "createdAt">>;
export type BookingAddress = InferSelectModel<typeof bookingAddressesTable>;
export type InsertBookingAddress = InferInsertModel<typeof bookingAddressesTable>;
export type UpdateBookingAddress = Partial<Omit<InsertBookingAddress, "id" | "createdAt">>;

// Types for booking schema
export type Booking = InferSelectModel<typeof bookingsTable>;
export type InsertBooking = InferInsertModel<typeof bookingsTable>;
export type UpdateBooking = Partial<Omit<InsertBooking, "id" | "createdAt">>;

// Types for category schema
export type Category = InferSelectModel<typeof categoriesTable>;
export type InsertCategory = InferInsertModel<typeof categoriesTable>;
export type UpdateCategory = Partial<Omit<InsertCategory, "id" | "createdAt">>;
export type ProviderCategory = InferSelectModel<typeof providerCategoriesTable>;
export type InsertProviderCategory = InferInsertModel<typeof providerCategoriesTable>;
export type UpdateProviderCategory = Partial<Omit<InsertProviderCategory, "id" | "createdAt">>;
export type ClientPreferredCategory = InferSelectModel<typeof clientPreferredCategoriesTable>;
export type InsertClientPreferredCategory = InferInsertModel<typeof clientPreferredCategoriesTable>;
export type UpdateClientPreferredCategory = Partial<Omit<InsertClientPreferredCategory, "id" | "createdAt">>;

// Types for client schema
export type ClientProfile = InferSelectModel<typeof clientProfilesTable>;
export type InsertClientProfile = InferInsertModel<typeof clientProfilesTable>;
export type UpdateClientProfile = Partial<Omit<InsertClientProfile, "id" | "createdAt">>;

// Types for payment schema
export type PaymentTransaction = InferSelectModel<typeof paymentTransactionsTable>;
export type InsertPaymentTransaction = InferInsertModel<typeof paymentTransactionsTable>;
export type UpdatePaymentTransaction = Partial<Omit<InsertPaymentTransaction, "id" | "createdAt">>;

// Types for provider schema
export type ProviderProfile = InferSelectModel<typeof providerProfilesTable>;
export type InsertProviderProfile = InferInsertModel<typeof providerProfilesTable>;
export type UpdateProviderProfile = Partial<Omit<InsertProviderProfile, "id" | "createdAt">>;

// Types for review schema
export type Review = InferSelectModel<typeof reviewsTable>;
export type InsertReview = InferInsertModel<typeof reviewsTable>;
export type UpdateReview = Partial<Omit<InsertReview, "id" | "createdAt">>;

// Types for user schema
export type User = InferSelectModel<typeof usersTable>;
export type InsertUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<Omit<InsertUser, "id" | "createdAt">>;

// =============================================================================
// COMPOSITE TYPES (WITH RELATIONS)
// =============================================================================

/**
 * User with provider profile (when user is a provider)
 */
export type UserWithProviderProfile = User & {
  providerProfile: ProviderProfile | null;
};

/**
 * User with client profile (when user is a client)
 */
export type UserWithClientProfile = User & {
  clientProfile: ClientProfile | null;
};

/**
 * Complete user with both profiles (one will be null)
 */
export type CompleteUser = User & {
  providerProfile: ProviderProfile | null;
  clientProfile: ClientProfile | null;
};

/**
 * Provider with their category relationships
 */
export type ProviderWithCategories = ProviderProfile & {
  categories: Array<ProviderCategory & { category: Category }>;
};

/**
 * Client with their preferred categories
 */
export type ClientWithPreferences = ClientProfile & {
  preferredCategories: Array<ClientPreferredCategory & { category: Category }>;
};

/**
 * Booking with all related data
 */
export type BookingWithDetails = Booking & {
  client: User;
  provider: User;
  category: Category;
  review: Review | null;
  payments: PaymentTransaction[];
  addresses: Array<BookingAddress & { address: Address }>;
};

/**
 * Review with related user and booking data
 */
export type ReviewWithDetails = Review & {
  client: User;
  provider: User;
  booking: Booking;
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type for database transaction context
 */
export type DbTransaction = Parameters<Parameters<typeof import("./index").db.transaction>[0]>[0];

/**
 * Common database operation result types
 */
export type DbResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

/**
 * Paginated results type
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Search filters type for common queries
 */
export type SearchFilters = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// =============================================================================
// ENUM TYPES (from schema)
// =============================================================================

/**
 * User account status enum
 */
export type UserAccountStatus = User["accountStatus"];

/**
 * User roles enum  
 */
export type UserRole = NonNullable<User["roles"]>[number];

/**
 * Booking status enum
 */
export type BookingStatus = Booking["status"];

/**
 * Payment status enum
 */
export type PaymentStatus = PaymentTransaction["status"];

/**
 * Review status enum
 */
export type ReviewStatus = Review["status"];

/**
 * Address type enum
 */
export type AddressType = Address["type"];

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if user has provider profile
 */
export function isUserProvider(user: CompleteUser): user is CompleteUser & { providerProfile: ProviderProfile } {
  return user.providerProfile !== null;
}

/**
 * Type guard to check if user has client profile  
 */
export function isUserClient(user: CompleteUser): user is CompleteUser & { clientProfile: ClientProfile } {
  return user.clientProfile !== null;
}

/**
 * Type guard to check if booking is completed
 */
export function isBookingCompleted(booking: Booking): boolean {
  return booking.status === "completed";
}

/**
 * Type guard to check if payment is successful
 */
export function isPaymentSuccessful(payment: PaymentTransaction): boolean {
  return payment.status === "succeeded";
}