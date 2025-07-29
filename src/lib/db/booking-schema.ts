import { 
  boolean,
  integer,
  json,
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar 
} from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";

// Booking-specific enums
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", 
  "confirmed", 
  "in_progress", 
  "completed", 
  "cancelled", 
  "refunded"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", 
  "authorized", 
  "captured", 
  "refunded"
]);

export const homeTypeEnum = pgEnum("home_type", [
  "apartment", 
  "house", 
  "condo", 
  "office"
]);

// Bookings table
export const bookingsTable = pgTable("bookings", {
  // Identity & References
  id: uuid("id").primaryKey().defaultRandom(), // bookingID
  clientId: uuid("client_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: bookingStatusEnum("status").notNull().default("pending"),
  
  // Service Details
  serviceCategory: varchar("service_category", { length: 100 }), // TODO: Reference to categories table when created
  serviceDescription: text("service_description"),
  
  // Scheduling Information
  serviceDate: timestamp("service_date").notNull(),
  timezone: varchar("timezone", { length: 50 }),
  
  // Booking Lifecycle
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Location & Access (Address handled via booking_addresses junction table)
  serviceArea: varchar("service_area", { length: 100 }), // e.g., "master bedroom", "kitchen"
  
  // Pricing & Payment
  hourlyRate: integer("hourly_rate").notNull(), // Rate in cents
  totalPrice: integer("total_price"), // Final amount in cents
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethodId: varchar("payment_method_id", { length: 100 }), // TODO: Reference to payment methods table
  
  // Communication & Notes
  clientNotes: text("client_notes"),
  providerNotes: text("provider_notes"),
  internalNotes: text("internal_notes"),
  cancellationReason: text("cancellation_reason"),
  
  // Additional Considerations - Contract/Property Details
  hasChildren: boolean("has_children").notNull().default(false),
  hasPets: boolean("has_pets").notNull().default(false),
  homeType: homeTypeEnum("home_type"),
  accessibilityNeeds: text("accessibility_needs").array().default([]),
  emergencyContact: json("emergency_contact").$type<{
    name?: string;
    phone?: string;
    relationship?: string;
  }>(),
  
  // Quality & Follow-up
  photosBeforeService: text("photos_before_service").array().default([]), // Array of URLs
  photosAfterService: text("photos_after_service").array().default([]), // Array of URLs
  followUpRequired: boolean("follow_up_required").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  
  // Business Logic
  remindersSent: json("reminders_sent").$type<{
    type: string;
    sentAt: string;
    status: string;
  }[]>().default([]),
  reviewEligible: boolean("review_eligible").notNull().default(true),
});