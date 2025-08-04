/**
 * SINGLE SOURCE OF TRUTH FOR ALL TYPES
 * 
 * This file contains ALL TypeScript types for the application:
 * 1. Database types - Auto-generated from Drizzle schemas (DO NOT EDIT)
 * 2. Application types - UI extensions and business logic types
 * 3. Utility functions - Type-related helper functions
 * 
 * Generated on: 2025-07-30T04:01:31.181Z
 * 
 * Database types are auto-generated - to regenerate: npm run types:generate
 * Application types can be manually edited in the sections below
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

// =============================================================================
// APPLICATION TYPES (UI-specific extensions of database types)
// =============================================================================

/**
 * Extended user profile with computed fields for UI
 */
export type UserProfileDisplay = User & {
  displayName: string;
  initials: string;
  isVerified: boolean;
};

/**
 * Provider display data for marketplace listings
 */
export type ProviderListingData = ProviderProfile & {
  user: User;
  categories: Array<{
    category: Category;
    isMainSpecialty: boolean;
    experienceYears?: number | null;
  }>;
  displayCategories: string[];
  mainSpecialty: string | null;
  isAvailable: boolean;
  ratingDisplay: string;
  priceDisplay: string;
};

/**
 * Client summary for provider dashboard
 */
export type ClientSummary = ClientProfile & {
  user: User;
  bookingCount: number;
  lastBookingDate: Date | null;
  totalSpent: number;
  preferredCategories: string[];
};

/**
 * User session data (from Clerk)
 */
export type UserSession = {
  userId: string;
  clerkUserId: string;
  email: string;
  isProvider: boolean;
  isOnboarded: boolean;
  accountStatus: UserAccountStatus;
  roles: UserRole[];
};

/**
 * Auth context type
 */
export type AuthContextType = {
  user: UserSession | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

/**
 * Provider category selection for forms
 */
export type CategorySelection = {
  categoryId: string;
  isSelected: boolean;
  isMainSpecialty: boolean;
  experienceYears?: number;
};

/**
 * Category with provider count for UI
 */
export type CategoryWithProviderCount = Category & {
  providerCount: number;
  averageRating: number | null;
  averageHourlyRate: number | null;
};

/**
 * Search result with computed fields
 */
export type ProviderSearchResult = ProviderListingData & {
  distance?: number; // in miles, if location search
  matchScore: number; // relevance score 0-1
  availableSlots?: string[]; // if availability search
};

/**
 * User notification preferences
 */
export type NotificationPreferences = {
  email: {
    bookingUpdates: boolean;
    reviewRequests: boolean;
    promotions: boolean;
    weeklyDigest: boolean;
  };
  sms: {
    bookingReminders: boolean;
    urgentUpdates: boolean;
  };
  push: {
    bookingUpdates: boolean;
    messages: boolean;
    promotions: boolean;
  };
};

/**
 * Provider dashboard summary
 */
export type ProviderDashboardSummary = {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number; // in cents
  averageRating: number;
  upcomingBookings: number;
  pendingBookings: number;
  monthlyStats: {
    month: string;
    bookings: number;
    earnings: number;
    rating: number;
  }[];
};

/**
 * Client dashboard summary
 */
export type ClientDashboardSummary = {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number; // in cents
  favoriteProviders: string[]; // Provider IDs
  upcomingBookings: number;
  recentProviders: ProviderListingData[];
};

/**
 * ID verification data for providers
 */
export type IdVerificationData = {
  documentType: "drivers_license" | "passport" | "state_id";
  documentNumber: string;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDate?: Date;
  rejectionReason?: string;
};

/**
 * Background check data for providers
 */
export type BackgroundCheckData = {
  status: "pending" | "passed" | "failed" | "expired";
  checkDate?: Date;
  expirationDate?: Date;
  provider: string; // Background check service provider
  reportId?: string;
};

// =============================================================================
// ADDITIONAL TYPE GUARDS (application-level)
// =============================================================================

/**
 * Type guard to check if user is a provider
 */
export function isProvider(
  user: CompleteUser
): user is CompleteUser & { providerProfile: ProviderProfile } {
  return user.providerProfile !== null && user.roles.includes("provider");
}

/**
 * Type guard to check if user is a client
 */
export function isClient(
  user: CompleteUser
): user is CompleteUser & { clientProfile: ClientProfile } {
  return user.clientProfile !== null && user.roles.includes("client");
}

/**
 * Type guard to check if provider is onboarded
 */
export function isProviderOnboarded(provider: ProviderProfile): boolean {
  return provider.isOnboarded === true;
}

/**
 * Type guard to check if user account is active
 */
export function isAccountActive(user: User): boolean {
  return user.accountStatus === "active";
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility to get user display name
 */
export function getUserDisplayName(user: User): string {
  if (user.firstname && user.lastname) {
    return `${user.firstname} ${user.lastname}`;
  }
  if (user.firstname) {
    return user.firstname;
  }
  return user.email.split("@")[0];
}

/**
 * Utility to get user initials
 */
export function getUserInitials(user: User): string {
  if (user.firstname && user.lastname) {
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  }
  if (user.firstname) {
    return user.firstname[0].toUpperCase();
  }
  return user.email[0].toUpperCase();
}

/**
 * Utility to format hourly rate for display
 */
export function formatHourlyRate(rateInCents: number | null): string {
  if (!rateInCents) return "Rate not set";
  const rate = rateInCents / 100;
  return `$${rate.toFixed(0)}/hour`;
}

/**
 * Utility to format rating for display
 */
export function formatRating(
  rating: number | null,
  reviewCount: number = 0
): string {
  if (!rating || reviewCount === 0) return "No reviews";
  return `${rating.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})`;
}

// =============================================================================
// CATEGORY CONSTANTS
// =============================================================================

/**
 * Category types enum (matches database categories)
 */
export enum CategoryType {
  CORE_PROFESSIONAL_ORGANIZERS = "core-professional-organizers",
  HOME_STAGERS = "home-stagers",
  FENG_SHUI_CONSULTANTS = "feng-shui-consultants",
  MOVE_MANAGERS_DOWNSIZING = "move-managers-downsizing",
  INTERIOR_DESIGNERS = "interior-designers",
  OFFICE_ORGANIZERS = "office-organizers",
  HOME_ORGANIZERS = "home-organizers",
  PAPERWORK_DOCUMENT_ORGANIZERS = "paperwork-document-organizers",
  DIGITAL_ORGANIZERS = "digital-organizers",
  TIME_PRODUCTIVITY_COACHES = "time-productivity-coaches",
  ESTATE_CLEANOUT_HOARDING = "estate-cleanout-hoarding",
}

/**
 * Category metadata for UI display
 */
export const CATEGORY_METADATA = {
  [CategoryType.CORE_PROFESSIONAL_ORGANIZERS]: {
    name: "Core Professional Organizers",
    description: "Comprehensive home and life organization services",
    isPrimary: true,
    icon: "home-organization",
    color: "#2563eb",
  },
  [CategoryType.HOME_STAGERS]: {
    name: "Home Stagers",
    description: "Prepare homes for sale by optimizing layout and presentation",
    isPrimary: false,
    icon: "home-staging",
    color: "#7c3aed",
  },
  [CategoryType.FENG_SHUI_CONSULTANTS]: {
    name: "Feng Shui Consultants",
    description: "Focus on optimizing energy flow and harmony in living spaces",
    isPrimary: false,
    icon: "feng-shui",
    color: "#059669",
  },
  [CategoryType.MOVE_MANAGERS_DOWNSIZING]: {
    name: "Move Managers and Downsizing Specialists",
    description:
      "Help with life transitions, relocations, and downsizing decisions",
    isPrimary: false,
    icon: "moving-boxes",
    color: "#dc2626",
  },
  [CategoryType.INTERIOR_DESIGNERS]: {
    name: "Interior Designers",
    description:
      "Design and organize interior spaces for functionality and aesthetics",
    isPrimary: false,
    icon: "interior-design",
    color: "#ea580c",
  },
  [CategoryType.OFFICE_ORGANIZERS]: {
    name: "Office Organizers",
    description:
      "Organize home offices or corporate spaces for maximum productivity",
    isPrimary: false,
    icon: "office-organization",
    color: "#0891b2",
  },
  [CategoryType.HOME_ORGANIZERS]: {
    name: "Home Organizers",
    description:
      "Specialize in residential organization for kitchens, closets, and living areas",
    isPrimary: false,
    icon: "home-clean",
    color: "#65a30d",
  },
  [CategoryType.PAPERWORK_DOCUMENT_ORGANIZERS]: {
    name: "Paperwork/Document Organizers",
    description:
      "Organize physical and digital documents, filing systems, and paperwork",
    isPrimary: false,
    icon: "documents",
    color: "#7c2d12",
  },
  [CategoryType.DIGITAL_ORGANIZERS]: {
    name: "Digital Organizers",
    description:
      "Help clients organize digital files, photos, accounts, and online presence",
    isPrimary: false,
    icon: "digital-files",
    color: "#be185d",
  },
  [CategoryType.TIME_PRODUCTIVITY_COACHES]: {
    name: "Time & Productivity Coaches",
    description:
      "Help with calendar management, workflows, and productivity systems",
    isPrimary: false,
    icon: "time-management",
    color: "#9333ea",
  },
  [CategoryType.ESTATE_CLEANOUT_HOARDING]: {
    name: "Estate Cleanout / Hoarding Specialists",
    description:
      "Handle sensitive situations involving estate cleanouts and extreme clutter/hoarding",
    isPrimary: false,
    icon: "estate-cleanout",
    color: "#991b1b",
  },
} as const;