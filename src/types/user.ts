/**
 * User-related types derived from Drizzle database schemas
 * This file provides application-level types that extend the database types
 */

import type {
  User,
  ProviderProfile,
  ClientProfile,
  CompleteUser,
  Category,
  UserAccountStatus,
  UserRole,
} from "../lib/db/types";

import type {
  UserProfileFormData,
  PhoneVerificationData,
  ProviderSearchFilters,
  ProviderOnboardingFormData,
  ClientOnboardingFormData,
} from "../lib/schemas";

// =============================================================================
// RE-EXPORT DATABASE TYPES
// =============================================================================

export type {
  User,
  ProviderProfile,
  ClientProfile,
  CompleteUser,
  Category,
  UserAccountStatus,
  UserRole,
} from "../lib/db/types";

export type {
  UserProfileFormData,
  PhoneVerificationData,
  ProviderSearchFilters,
  ProviderOnboardingFormData,
  ClientOnboardingFormData,
} from "../lib/schemas";

// =============================================================================
// APPLICATION-LEVEL USER TYPES
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
  categories: Array<{ category: Category; isMainSpecialty: boolean; experienceYears?: number | null }>;
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

// =============================================================================
// FORM DATA TYPES
// =============================================================================

// UserProfileFormData imported from schemas

// ProviderOnboardingFormData and ClientOnboardingFormData imported from schemas

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

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

// =============================================================================
// PROVIDER CATEGORY TYPES
// =============================================================================

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

// =============================================================================
// SEARCH AND FILTERING TYPES
// =============================================================================

// ProviderSearchFilters imported from schemas

/**
 * Search result with computed fields
 */
export type ProviderSearchResult = ProviderListingData & {
  distance?: number; // in miles, if location search
  matchScore: number; // relevance score 0-1
  availableSlots?: string[]; // if availability search
};

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

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

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

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

// =============================================================================
// VALIDATION TYPES
// =============================================================================

// PhoneVerificationData imported from schemas

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
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard to check if user is a provider
 */
export function isProvider(user: CompleteUser): user is CompleteUser & { providerProfile: ProviderProfile } {
  return user.providerProfile !== null && user.roles.includes("provider");
}

/**
 * Type guard to check if user is a client
 */
export function isClient(user: CompleteUser): user is CompleteUser & { clientProfile: ClientProfile } {
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

/**
 * Utility to get user display name
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.email.split("@")[0];
}

/**
 * Utility to get user initials
 */
export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName[0].toUpperCase();
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
export function formatRating(rating: number | null, reviewCount: number = 0): string {
  if (!rating || reviewCount === 0) return "No reviews";
  return `${rating.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})`;
}

// =============================================================================
// DEPRECATED TYPES (for migration reference)
// =============================================================================

/**
 * @deprecated Use database-derived types instead
 * Legacy Firebase user interface - kept for reference during migration
 */
export interface LegacyFirebaseUser {
  id?: string;
  createdAt: Date;
  updatedAt: Date | null;
  clerkUserID: string;
  isAProvider: boolean;
  profile: Record<string, unknown>;
  roles: Record<string, unknown>;
  providerDetails?: Record<string, unknown>;
  clientDetails?: Record<string, unknown>;
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
    description: "Help with life transitions, relocations, and downsizing decisions",
    isPrimary: false,
    icon: "moving-boxes",
    color: "#dc2626",
  },
  [CategoryType.INTERIOR_DESIGNERS]: {
    name: "Interior Designers",
    description: "Design and organize interior spaces for functionality and aesthetics",
    isPrimary: false,
    icon: "interior-design",
    color: "#ea580c",
  },
  [CategoryType.OFFICE_ORGANIZERS]: {
    name: "Office Organizers",
    description: "Organize home offices or corporate spaces for maximum productivity",
    isPrimary: false,
    icon: "office-organization",
    color: "#0891b2",
  },
  [CategoryType.HOME_ORGANIZERS]: {
    name: "Home Organizers",
    description: "Specialize in residential organization for kitchens, closets, and living areas",
    isPrimary: false,
    icon: "home-clean",
    color: "#65a30d",
  },
  [CategoryType.PAPERWORK_DOCUMENT_ORGANIZERS]: {
    name: "Paperwork/Document Organizers",
    description: "Organize physical and digital documents, filing systems, and paperwork",
    isPrimary: false,
    icon: "documents",
    color: "#7c2d12",
  },
  [CategoryType.DIGITAL_ORGANIZERS]: {
    name: "Digital Organizers",
    description: "Help clients organize digital files, photos, accounts, and online presence",
    isPrimary: false,
    icon: "digital-files",
    color: "#be185d",
  },
  [CategoryType.TIME_PRODUCTIVITY_COACHES]: {
    name: "Time & Productivity Coaches",
    description: "Help with calendar management, workflows, and productivity systems",
    isPrimary: false,
    icon: "time-management",
    color: "#9333ea",
  },
  [CategoryType.ESTATE_CLEANOUT_HOARDING]: {
    name: "Estate Cleanout / Hoarding Specialists",
    description: "Handle sensitive situations involving estate cleanouts and extreme clutter/hoarding",
    isPrimary: false,
    icon: "estate-cleanout",
    color: "#991b1b",
  },
} as const;