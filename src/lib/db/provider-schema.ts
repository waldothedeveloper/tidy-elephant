import {
  bigint,
  boolean,
  check,
  index,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { usersTable } from "./user-schema";

// Provider-specific enums
export const backgroundCheckStatusEnum = pgEnum("background_check_status", [
  "not_required",
  "pending",
  "approved",
  "rejected",
]);

export const idVerificationStatusEnum = pgEnum("id_verification_status", [
  "not_required",
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const cancellationPolicyEnum = pgEnum("cancellation_policy", [
  "flexible",
  "moderate",
  "strict",
]);

export const businessTypeEnum = pgEnum("business_type", [
  "sole_proprietorship",
  "partnership",
  "llc",
  "corporation",
  "s_corporation",
  "other",
]);

/* 

    *** 

    The following are the possible values for the type property.(From Twilio docs: https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence)

      - landline: A landline number that generally can't receive SMS messages
      - mobile: A mobile number that generally can receive SMS messages
      - fixedVoip: A virtual phone number associated with a physical device (e.g., Comcast or Vonage)
      - nonFixedVoip: A virtual phone number obtained online without requiring a physical device (e.g., Google Voice or Enflick)
      - personal: A phone number designated for personal use
      - tollFree: A toll-free phone number where calls are free for the calling party
      - premium: A premium-rate phone number with higher-than-normal rates
      - sharedCost: A shared cost phone number where calling party and subscriber share charges
      - uan: A universal access number that can route calls to different destinations
      - voicemail: A phone number associated with a voicemail service
      - pager: A phone number associated with a pager device
      - unknown: A valid phone number, but the line type is unknown

      The enum now matches Twilio's exact naming conventions and includes all possible line types they return from their lookup API. This ensures our database can
      properly store any line type information returned by Twilio's service.

    ***

 */
export const phoneLineTypeEnum = pgEnum("phone_line_type", [
  "landline",
  "mobile",
  "fixedVoip",
  "nonFixedVoip",
  "personal",
  "tollFree",
  "premium",
  "sharedCost",
  "uan",
  "voicemail",
  "pager",
  "unknown",
]);

// Provider profiles table
export const providerProfilesTable = pgTable(
  "provider_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" })
      .unique(),

    // Provider Profile & Business
    bio: text("bio"), // 50-1000 characters - validation in application layer
    isOnboarded: boolean("is_onboarded").notNull().default(false),

    // Business Information
    businessType: businessTypeEnum("business_type"),
    businessName: varchar("business_name", { length: 255 }),
    businessPhone: varchar("business_phone", { length: 16 }),
    businessPhoneLineType: phoneLineTypeEnum("business_phone_line_type"),
    employerEin: varchar("employer_ein", { length: 10 }),
    stripeConnectedAccountId: varchar("stripe_connected_account_id", {
      length: 255,
    }),
    workPhotos: text("work_photos").array().default([]),
    backgroundCheckStatus: backgroundCheckStatusEnum("background_check_status")
      .notNull()
      .default("not_required"),
    backgroundCheckCompletedAt: timestamp("background_check_completed_at", {
      withTimezone: true,
    }),
    idVerificationStatus: idVerificationStatusEnum("id_verification_status")
      .notNull()
      .default("not_required"),
    idVerificationCompletedAt: timestamp("id_verification_completed_at", {
      withTimezone: true,
    }),

    // Pricing
    hourlyRate: integer("hourly_rate"),
    cancellationPolicy: cancellationPolicyEnum("cancellation_policy").default(
      "moderate"
    ),
    offersFreeConsultation: boolean("offers_free_consultation")
      .notNull()
      .default(false),

    // Professional Information
    certifications: text("certifications").array().default([]), // TODO: Consider separate certifications table
    yearsOfExperience: integer("years_of_experience"),
    languages: text("languages").array().default([]), // TODO: Reference to languages table
    insuranceVerified: boolean("insurance_verified").notNull().default(false),

    // Availability & Scheduling
    availability: json("availability"), // JSON object for schedule information

    // Cal.com Integration
    calAtomsUserId: varchar("cal_atoms_user_id", { length: 255 }),
    calAtomsDefaultScheduleId: integer("cal_atoms_default_schedule_id"),
    calAtomsAccessToken: text("cal_atoms_access_token"),
    calAtomsAccessTokenExpiresAt: bigint("cal_atoms_access_token_expires_at", {
      mode: "number",
    }),
    calAtomsRefreshToken: text("cal_atoms_refresh_token"),
    calAtomsRefreshTokenExpiresAt: bigint(
      "cal_atoms_refresh_token_expires_at",
      { mode: "number" }
    ),

    // Ratings & Reviews (auto-calculated via database triggers)
    averageRating: numeric("average_rating", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    totalReviews: integer("total_reviews").notNull().default(0),
    ratingBreakdown: json("rating_breakdown")
      .$type<{
        oneStar: number;
        twoStar: number;
        threeStar: number;
        fourStar: number;
        fiveStar: number;
      }>()
      .default({
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
      }),

    // System fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Check constraints for data validation
    check("hourly_rate_positive", sql`${table.hourlyRate} > 0`),
    check(
      "average_rating_range",
      sql`${table.averageRating} >= 0 AND ${table.averageRating} <= 5`
    ),
    check(
      "years_of_experience_non_negative",
      sql`${table.yearsOfExperience} >= 0`
    ),

    // Indexes
    // Core lookup indexes
    uniqueIndex("idx_provider_user_id").on(table.userId),
    index("idx_provider_onboarded").on(table.isOnboarded),

    // Search and filtering indexes
    index("idx_provider_avg_rating").on(table.averageRating),
    index("idx_provider_hourly_rate").on(table.hourlyRate),
    index("idx_provider_years_experience").on(table.yearsOfExperience),

    // Verification status indexes
    index("idx_provider_background_check").on(table.backgroundCheckStatus),
    index("idx_provider_id_verification").on(table.idVerificationStatus),

    // Array field GIN indexes for provider searching
    index("idx_provider_languages_gin").using("gin", table.languages),
    index("idx_provider_certifications_gin").using("gin", table.certifications),

    // Business information indexes
    index("idx_provider_business_name").on(table.businessName),
    index("idx_provider_business_type").on(table.businessType),
    index("idx_provider_phone_line_type").on(table.businessPhoneLineType),

    // Composite indexes for common search patterns
    index("idx_provider_search").on(
      table.isOnboarded,
      table.averageRating,
      table.hourlyRate
    ),
  ]
);
