// Firebase User Document Interface
// export interface FirebaseUser {
//   id?: string; // Firestore document ID
//   createdAt: Date;
//   updatedAt: Date | null;
//   clerkUserID: string;
//   isAProvider: boolean;
//   profile: UserProfile;
//   roles: UserRoles;

//   // Provider-specific fields (only present when isAProvider = true)
//   providerDetails?: ProviderDetails;
//   providerRatings?: ProviderRatings;
//   providerReviews?: ProviderReview[];

//   // Client-specific fields (only present when isAProvider = false)
//   clientDetails?: ClientDetails;
//   bookingHistory?: BookingHistory[];
//   clientPreferences?: ClientPreferences;
// }

// export interface UserProfile {
//   firstName: string;
//   lastName: string;
//   about: string;
//   photo: string;
//   email: string;
//   phoneNumber?: string;
//   address?: UserAddress;
// }

// export interface UserAddress {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// export interface UserRoles {
//   provider?: boolean;
//   client?: boolean;
//   admin?: boolean;
// }

// Provider-specific interfaces
// export interface ProviderDetails {
//   isOnboarded: boolean;
//   isActive: boolean;
//   isPhoneVerified: boolean;
//   workPhotos?: string[]; // URLs of Firebase URLs of uploaded work photos
//   categories: string[]; // Service category IDs
//   serviceAreas?: string[]; // Geographic areas they serve
//   hourlyRate?: number; // Stored in cents (e.g., $75.00 = 7500 cents)
//   availability?: ProviderAvailability;
//   businessInfo?: BusinessInfo;
//   certifications?: Certification[];
//   experience?: number; // Years of experience
//   languages?: string[];
// }

// export interface ProviderAvailability {
//   monday?: TimeSlot[];
//   tuesday?: TimeSlot[];
//   wednesday?: TimeSlot[];
//   thursday?: TimeSlot[];
//   friday?: TimeSlot[];
//   saturday?: TimeSlot[];
//   sunday?: TimeSlot[];
//   blackoutDates?: Date[]; // Unavailable dates
// }

// export interface TimeSlot {
//   startTime: string; // Format: "HH:mm"
//   endTime: string; // Format: "HH:mm"
// }

// export interface BusinessInfo {
//   businessName?: string;
//   businessLicense?: string;
//   insurance?: InsuranceInfo;
//   taxId?: string;
//   website?: string;
//   socialMedia?: SocialMediaLinks;
// }

// export interface InsuranceInfo {
//   provider: string;
//   policyNumber: string;
//   expirationDate: Date;
//   coverageAmount: number;
// }

// export interface SocialMediaLinks {
//   instagram?: string;
//   facebook?: string;
//   linkedin?: string;
//   website?: string;
// }

// export interface Certification {
//   name: string;
//   issuedBy: string;
//   issueDate: Date;
//   expirationDate?: Date;
//   credentialId?: string;
//   verificationUrl?: string;
// }

// export interface ProviderRatings {
//   averageRating: number;
//   totalReviews: number;
//   ratingBreakdown?: {
//     5: number;
//     4: number;
//     3: number;
//     2: number;
//     1: number;
//   };
// }

// export interface ProviderReview {
//   id: string;
//   clientId: string;
//   clientName: string;
//   rating: number;
//   comment: string;
//   createdAt: Date;
//   bookingId: string;
//   isVerified: boolean;
//   responseFromProvider?: ProviderResponse;
// }

// export interface ProviderResponse {
//   comment: string;
//   createdAt: Date;
// }

// // Client-specific interfaces
// export interface ClientDetails {
//   isActive: boolean;
//   isPhoneVerified: boolean;
//   communicationPreferences?: CommunicationPreferences;
// }

// export interface CommunicationPreferences {
//   emailNotifications: boolean;
//   smsNotifications: boolean;
//   pushNotifications: boolean;
//   marketingEmails: boolean;
//   bookingReminders: boolean;
//   reviewRequests: boolean;
// }

// export interface ClientPreferences {
//   preferredProviders?: string[]; // Provider IDs
//   blockedProviders?: string[]; // Provider IDs
//   servicePreferences?: ServicePreference[];
//   budgetRange?: {
//     min: number;
//     max: number;
//   };
//   timePreferences?: {
//     preferredDays: string[];
//     preferredTimes: string[];
//   };
// }

// export interface ServicePreference {
//   categoryId: string;
//   notes?: string;
//   priority: "low" | "medium" | "high";
// }

// // Booking-related interfaces
// export interface BookingHistory {
//   id: string;
//   providerId: string;
//   providerName: string;
//   serviceCategory: string;
//   status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
//   scheduledDate: Date;
//   duration: number; // Hours
//   totalCost: number;
//   address: UserAddress;
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   completedAt?: Date;
//   cancelledAt?: Date;
//   cancellationReason?: string;
//   hasReview: boolean;
// }

// // Service Categories (used by providers)
// export interface ServiceCategory {
//   id: string;
//   name: string;
//   description: string;
//   isActive: boolean;
// }

// Provider Category Types Enum
export enum ProviderCategoryType {
  CORE_PROFESSIONAL_ORGANIZERS = "Core Professional Organizers",
  MOVE_MANAGERS_DOWNSIZING = "Move Managers and Downsizing Specialists",
  TIME_PRODUCTIVITY_COACHES = "Time & Productivity Coaches",
  HOME_STAGERS = "Home Stagers",
  OFFICE_ORGANIZERS = "Office Organizers",
  DIGITAL_ORGANIZERS = "Digital Organizers",
  INTERIOR_DESIGNERS = "Interior Designers",
  PAPERWORK_DOCUMENT_ORGANIZERS = "Paperwork/Document Organizers",
  FENG_SHUI_CONSULTANTS = "Feng Shui Consultants",
  HOME_ORGANIZERS = "Home Organizers",
  ESTATE_CLEANOUT_HOARDING = "Estate Cleanout / Hoarding Specialists",
}

// Provider Categories Data Structure
export const PROVIDER_CATEGORIES = [
  {
    type: ProviderCategoryType.CORE_PROFESSIONAL_ORGANIZERS,
    name: "Core Professional Organizers",
    description:
      "General organizing services for homes and spaces (primary category)",
    isActive: true,
  },
  {
    type: ProviderCategoryType.MOVE_MANAGERS_DOWNSIZING,
    name: "Move Managers and Downsizing Specialists",
    description: "Help with life transitions, relocations, and downsizing",
    isActive: true,
  },
  {
    type: ProviderCategoryType.TIME_PRODUCTIVITY_COACHES,
    name: "Time & Productivity Coaches",
    description:
      "Help with calendar management, workflows, and task organization",
    isActive: true,
  },
  {
    type: ProviderCategoryType.HOME_STAGERS,
    name: "Home Stagers",
    description: "Prepare homes for sale by optimizing layout and presentation",
    isActive: true,
  },
  {
    type: ProviderCategoryType.OFFICE_ORGANIZERS,
    name: "Office Organizers",
    description: "Organize home offices or corporate spaces for productivity",
    isActive: true,
  },
  {
    type: ProviderCategoryType.DIGITAL_ORGANIZERS,
    name: "Digital Organizers",
    description:
      "Help clients organize digital files, photos, and online accounts",
    isActive: true,
  },
  {
    type: ProviderCategoryType.INTERIOR_DESIGNERS,
    name: "Interior Designers",
    description:
      "Design and organize interior spaces for functionality and aesthetics",
    isActive: true,
  },
  {
    type: ProviderCategoryType.PAPERWORK_DOCUMENT_ORGANIZERS,
    name: "Paperwork/Document Organizers",
    description: "Create filing systems and organize important documents",
    isActive: true,
  },
  {
    type: ProviderCategoryType.FENG_SHUI_CONSULTANTS,
    name: "Feng Shui Consultants",
    description:
      "Focus on optimizing energy flow in spaces for harmony and balance",
    isActive: true,
  },
  {
    type: ProviderCategoryType.HOME_ORGANIZERS,
    name: "Home Organizers",
    description: "Specialize in organizing residential living spaces",
    isActive: true,
  },
  {
    type: ProviderCategoryType.ESTATE_CLEANOUT_HOARDING,
    name: "Estate Cleanout / Hoarding Specialists",
    description:
      "Handle estates after death or extreme clutter/hoarding situations with sensitivity",
    isActive: true,
  },
] as const;

/*
------------------>> WE ALWAYS DERIVE THE TYPES FROM THE SCHEMAS, SO WE DON'T NEED TO REDEFINE THEM HERE <<------------------

*/

import { userProfileSchema } from "@/lib/schemas/index";
import { z } from "zod";

export type UserProfile = z.infer<typeof userProfileSchema>;
