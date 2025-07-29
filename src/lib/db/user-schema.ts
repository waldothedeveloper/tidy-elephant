import { 
  boolean, 
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar 
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "provider"]);
export const accountStatusEnum = pgEnum("account_status", [
  "active", 
  "inactive", 
  "suspended", 
  "pending_verification"
]);
export const preferredContactMethodEnum = pgEnum("preferred_contact_method", [
  "email", 
  "phone", 
  "app_messaging"
]);

// Users table based on shared requirements
export const usersTable = pgTable("users", {
  // Primary key
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Core Identity Fields (Required)
  firstname: varchar("firstname", { length: 100 }).notNull(),
  lastname: varchar("lastname", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  clerkUserID: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  profileImage: text("profile_image"),
  roles: userRoleEnum("roles").array().notNull().default(["client"]),
  
  // System Fields (Automatically managed)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
  // Location & Contact
  timezone: varchar("timezone", { length: 50 }),
  preferredContactMethod: preferredContactMethodEnum("preferred_contact_method").default("email"),
  language: varchar("language", { length: 10 }).default("en"),
  
  // Account Status & Verification
  accountStatus: accountStatusEnum("account_status").notNull().default("pending_verification"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  
  // Trust & Safety
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  agreedToTermsAt: timestamp("agreed_to_terms_at"),
  privacyPolicyAccepted: boolean("privacy_policy_accepted").notNull().default(false),
  
  // Communication Preferences
  emailNotifications: boolean("email_notifications").notNull().default(true),
  smsNotifications: boolean("sms_notifications").notNull().default(true),
  marketingEmails: boolean("marketing_emails").notNull().default(false),
  
  // Referral & Growth
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: uuid("referred_by"), // Self-reference to users table - FK constraint added in migration
  howDidYouHearAbout: varchar("how_did_you_hear_about", { length: 100 }),
});
