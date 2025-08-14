import {
  boolean,
  check,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { categoriesTable } from "./category-schema";
import { usersTable } from "./user-schema";

// Booking-specific enums
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "captured",
  "refunded",
]);

export const homeTypeEnum = pgEnum("home_type", [
  "apartment",
  "house",
  "condo",
  "office",
]);

// Bookings table
export const bookingsTable = pgTable(
  "bookings",
  {
    // Identity & References
    id: uuid("id").primaryKey().defaultRandom(), // bookingID
    clientId: uuid("client_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("pending"),

    // Service Details
    serviceCategoryId: uuid("service_category_id").references(
      () => categoriesTable.id
    ),
    serviceDescription: text("service_description"),

    // Scheduling Information
    serviceDate: timestamp("service_date", { withTimezone: true }).notNull(),

    // Booking Lifecycle
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    // Location & Access (Address handled via booking_addresses junction table)
    serviceArea: varchar("service_area", { length: 100 }), // e.g., "master bedroom", "kitchen"

    // Pricing & Payment
    hourlyRate: integer("hourly_rate").notNull(),
    totalPrice: integer("total_price"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    paymentMethodId: varchar("payment_method_id", { length: 100 }), // Reference to payment methods table

    // Stripe Integration
    stripeInvoiceId: varchar("stripe_invoice_id", { length: 100 }),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
    amountRefunded: integer("amount_refunded").default(0),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),

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
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),

    // Business Logic
    remindersSent: json("reminders_sent")
      .$type<
        {
          type: string;
          sentAt: string;
          status: string;
        }[]
      >()
      .default([]),
    reviewEligible: boolean("review_eligible").notNull().default(true),
  },
  (table) => [
    // Check constraints
    check("positive_hourly_rate", sql`${table.hourlyRate} > 0`),
    check(
      "positive_total_price",
      sql`${table.totalPrice} IS NULL OR ${table.totalPrice} > 0`
    ),
    check(
      "refund_amount_valid",
      sql`${table.amountRefunded} IS NULL OR 
          (${table.amountRefunded} >= 0 AND 
           (${table.totalPrice} IS NULL OR ${table.amountRefunded} <= ${table.totalPrice}))`
    ),
    check(
      "refund_timestamp_logic",
      sql`(${table.amountRefunded} IS NULL OR ${table.amountRefunded} = 0) OR 
          ${table.refundedAt} IS NOT NULL`
    ),

    // Unique constraints
    unique("unique_client_provider_datetime").on(
      table.clientId,
      table.providerId,
      table.serviceDate
    ),

    // Core indexes (highly used columns)
    // Foreign key indexes (critical for joins)
    index("idx_booking_client_id").on(table.clientId),
    index("idx_booking_provider_id").on(table.providerId),

    // Status and lifecycle indexes (most common filters)
    index("idx_booking_status_created").on(table.status, table.createdAt.desc()),
    index("idx_booking_service_date").on(table.serviceDate.desc()),

    // Payment processing indexes
    index("idx_booking_payment_status_created").on(table.paymentStatus, table.createdAt.desc()),
    index("idx_booking_stripe_payment_intent").on(table.stripePaymentIntentId),
    index("idx_booking_stripe_invoice").on(table.stripeInvoiceId),

    // Dashboard and reporting indexes (composite for common queries)
    index("idx_booking_client_dashboard").on(
      table.clientId, 
      table.status, 
      table.serviceDate.desc()
    ),
    index("idx_booking_provider_dashboard").on(
      table.providerId, 
      table.status, 
      table.serviceDate.desc()
    ),

    // Customer and subscription management
    index("idx_booking_stripe_customer").on(table.stripeCustomerId),
    index("idx_booking_stripe_subscription").on(table.stripeSubscriptionId),

    // Specialized indexes for specific features
    index("idx_booking_service_category_status").on(
      table.serviceCategoryId, 
      table.status, 
      table.serviceDate.desc()
    ),

    // GIN index for array searches (if frequently queried)
    index("idx_booking_accessibility_needs_gin").using("gin", table.accessibilityNeeds),
  ]
);
