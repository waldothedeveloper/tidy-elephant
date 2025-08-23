import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "provider"]);
export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "inactive",
  "suspended",
  "pending_verification",
]);
export const preferredContactMethodEnum = pgEnum("preferred_contact_method", [
  "email",
  "phone",
  "app_messaging",
]);

// Users table based on shared requirements
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Core Identity Fields (Required)
    firstname: varchar("firstname", { length: 100 }).notNull(),
    lastname: varchar("lastname", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 12 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    clerkUserID: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    profileImage: text("profile_image"),
    roles: userRoleEnum("roles").array().notNull().default(["client"]),

    // System Fields (Automatically managed)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    // Location & Contact
    preferredContactMethod: preferredContactMethodEnum(
      "preferred_contact_method"
    ).default("email"),
    language: varchar("language", { length: 10 }).default("en"),

    // Account Status & Verification
    accountStatus: accountStatusEnum("account_status")
      .notNull()
      .default("active"),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),

    // Trust & Safety
    agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
    agreedToTermsAt: timestamp("agreed_to_terms_at", { withTimezone: true }),
    privacyPolicyAccepted: boolean("privacy_policy_accepted")
      .notNull()
      .default(false),

    // Communication Preferences
    emailNotifications: boolean("email_notifications").notNull().default(true),
    smsNotifications: boolean("sms_notifications").notNull().default(true),
    marketingEmails: boolean("marketing_emails").notNull().default(false),

    // Referral & Growth
    referralCode: varchar("referral_code", { length: 20 }).unique(),
    referredBy: uuid("referred_by"),
    howDidYouHearAbout: varchar("how_did_you_hear_about", { length: 100 }),
  },
  (table) => [
    check(
      "phone_format",
      sql`${table.phone} IS NULL OR (${table.phone} ~ '^\+1\d{10}$' AND length(${table.phone}) = 12)`
    ),
    check(
      "email_format",
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`
    ),

    // Indexes
    index("idx_users_email").on(table.email),
    index("idx_users_clerk_user_id").on(table.clerkUserID),
    index("idx_users_referral_code").on(table.referralCode),
    index("idx_users_account_status").on(table.accountStatus),
    index("idx_users_roles_gin").using("gin", table.roles),
    index("idx_users_referred_by").on(table.referredBy),
  ]
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  // Self-reference for referrals
  referrer: one(usersTable, {
    fields: [usersTable.referredBy],
    references: [usersTable.id],
    relationName: "userReferrals",
  }),

  // Users they referred
  referredUsers: many(usersTable, {
    relationName: "userReferrals",
  }),
}));
