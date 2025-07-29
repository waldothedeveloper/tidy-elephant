import {
  boolean,
  check,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
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

// Provider profiles table
export const providerProfilesTable = pgTable("provider_profiles", {
  // Primary key and foreign key to users
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),

  // Provider Profile & Business
  bio: text("bio"), // 50-1000 characters - validation in application layer
  isOnboarded: boolean("is_onboarded").notNull().default(false),
  workPhotos: text("work_photos").array().default([]), // Array of URLs
  backgroundCheckStatus: backgroundCheckStatusEnum("background_check_status")
    .notNull()
    .default("not_required"),
  backgroundCheckCompletedAt: timestamp("background_check_completed_at", { withTimezone: true }),
  idVerificationStatus: idVerificationStatusEnum("id_verification_status")
    .notNull()
    .default("not_required"),
  idVerificationCompletedAt: timestamp("id_verification_completed_at", { withTimezone: true }),

  // Service Categories (will reference categories table when created)
  categories: text("categories").array().default([]), // TODO: Reference to categories table

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

  // Ratings & Reviews (auto-calculated via database triggers)
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0.00"),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Check constraints for data validation
  hourlyRateRange: check("hourly_rate_range", sql`${table.hourlyRate} >= 2500 AND ${table.hourlyRate} <= 25000`),
  averageRatingRange: check("average_rating_range", sql`${table.averageRating} >= 0 AND ${table.averageRating} <= 5`),
  yearsExperienceRange: check("years_experience_range", sql`${table.yearsOfExperience} >= 0 AND ${table.yearsOfExperience} <= 50`),
}));
