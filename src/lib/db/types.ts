/**
 * Generated types from Drizzle schemas for type-safe database operations
 * This file provides TypeScript types derived from our database schemas
 * 
 * Generated on: 2025-07-30T03:27:51.726Z
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
export type Addresses = InferSelectModel<typeof addressesTable>;
export type InsertAddresses = InferInsertModel<typeof addressesTable>;
export type UpdateAddresses = Partial<Omit<InsertAddresses, "id" | "createdAt">>;
export type UserAddresses = InferSelectModel<typeof userAddressesTable>;
export type InsertUserAddresses = InferInsertModel<typeof userAddressesTable>;
export type UpdateUserAddresses = Partial<Omit<InsertUserAddresses, "id" | "createdAt">>;
export type BookingAddresses = InferSelectModel<typeof bookingAddressesTable>;
export type InsertBookingAddresses = InferInsertModel<typeof bookingAddressesTable>;
export type UpdateBookingAddresses = Partial<Omit<InsertBookingAddresses, "id" | "createdAt">>;

// Types for booking schema
export type Bookings = InferSelectModel<typeof bookingsTable>;
export type InsertBookings = InferInsertModel<typeof bookingsTable>;
export type UpdateBookings = Partial<Omit<InsertBookings, "id" | "createdAt">>;

// Types for category schema
export type Categories = InferSelectModel<typeof categoriesTable>;
export type InsertCategories = InferInsertModel<typeof categoriesTable>;
export type UpdateCategories = Partial<Omit<InsertCategories, "id" | "createdAt">>;
export type ProviderCategories = InferSelectModel<typeof providerCategoriesTable>;
export type InsertProviderCategories = InferInsertModel<typeof providerCategoriesTable>;
export type UpdateProviderCategories = Partial<Omit<InsertProviderCategories, "id" | "createdAt">>;
export type ClientPreferredCategories = InferSelectModel<typeof clientPreferredCategoriesTable>;
export type InsertClientPreferredCategories = InferInsertModel<typeof clientPreferredCategoriesTable>;
export type UpdateClientPreferredCategories = Partial<Omit<InsertClientPreferredCategories, "id" | "createdAt">>;

// Types for client schema
export type ClientProfiles = InferSelectModel<typeof clientProfilesTable>;
export type InsertClientProfiles = InferInsertModel<typeof clientProfilesTable>;
export type UpdateClientProfiles = Partial<Omit<InsertClientProfiles, "id" | "createdAt">>;

// Types for payment schema
export type PaymentTransactions = InferSelectModel<typeof paymentTransactionsTable>;
export type InsertPaymentTransactions = InferInsertModel<typeof paymentTransactionsTable>;
export type UpdatePaymentTransactions = Partial<Omit<InsertPaymentTransactions, "id" | "createdAt">>;

// Types for provider schema
export type ProviderProfiles = InferSelectModel<typeof providerProfilesTable>;
export type InsertProviderProfiles = InferInsertModel<typeof providerProfilesTable>;
export type UpdateProviderProfiles = Partial<Omit<InsertProviderProfiles, "id" | "createdAt">>;

// Types for review schema
export type Reviews = InferSelectModel<typeof reviewsTable>;
export type InsertReviews = InferInsertModel<typeof reviewsTable>;
export type UpdateReviews = Partial<Omit<InsertReviews, "id" | "createdAt">>;

// Types for user schema
export type Users = InferSelectModel<typeof usersTable>;
export type InsertUsers = InferInsertModel<typeof usersTable>;
export type UpdateUsers = Partial<Omit<InsertUsers, "id" | "createdAt">>;

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
  return payment.status === "completed";
}