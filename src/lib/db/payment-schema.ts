import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { bookingsTable } from "./booking-schema";
import { sql } from "drizzle-orm";

// Payment-specific enums
export const paymentTypeEnum = pgEnum("payment_type", [
  "payment",
  "refund",
  "chargeback",
]);

export const paymentTransactionStatusEnum = pgEnum(
  "payment_transaction_status",
  ["pending", "succeeded", "failed", "canceled"]
);

// Payment transactions table
export const paymentTransactionsTable = pgTable(
  "payment_transactions",
  {
    // Identity & References
    id: uuid("id").primaryKey().defaultRandom(), // transactionID (internal)
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookingsTable.id, { onDelete: "cascade" }),

    // Stripe Integration
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }).notNull(),
    stripeChargeId: varchar("stripe_charge_id", { length: 255 }), // When captured

    // Transaction Details
    amount: integer("amount").notNull(),
    type: paymentTypeEnum("type").notNull().default("payment"),
    status: paymentTransactionStatusEnum("status").notNull().default("pending"), // Mirrors Stripe status

    // System Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Check constraints
    check("positive_amount", sql`${table.amount} > 0`),
    
    // Indexes
    // Foreign key index
    index("idx_payment_booking_id").on(table.bookingId),
    
    // Stripe integration indexes
    index("idx_payment_stripe_intent").on(table.stripePaymentIntentId),
    index("idx_payment_stripe_charge").on(table.stripeChargeId),
    
    // Status and type indexes
    index("idx_payment_status").on(table.status),
    index("idx_payment_type").on(table.type),
    index("idx_payment_created_at").on(table.createdAt),
    
    // Composite index for transaction history
    index("idx_payment_history").on(table.status, table.type, table.createdAt),
  ]
);
