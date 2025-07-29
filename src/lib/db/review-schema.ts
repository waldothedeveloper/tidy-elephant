import { 
  boolean,
  check,
  integer,
  json,
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar 
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user-schema";
import { bookingsTable } from "./booking-schema";

// Review-specific enums
export const reviewStatusEnum = pgEnum("review_status", [
  "active", 
  "flagged", 
  "removed"
]);

// Reviews table
export const reviewsTable = pgTable("reviews", {
  // Identity & References
  id: uuid("id").primaryKey().defaultRandom(), // reviewID
  bookingId: uuid("booking_id").notNull().references(() => bookingsTable.id, { onDelete: "cascade" }).unique(), // One review per booking
  clientId: uuid("client_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  
  // Review Content
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isVerified: boolean("is_verified").notNull().default(true), // From actual completed booking
  
  // Review Lifecycle
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  status: reviewStatusEnum("status").notNull().default("active"),
  
  // Optional Enhancement Fields (Future consideration)
  categoryRatings: json("category_ratings").$type<{
    communication?: number; // 1-5 scale
    punctuality?: number;   // 1-5 scale
    quality?: number;       // 1-5 scale
    professionalism?: number; // 1-5 scale
  }>(),
  
  // Moderation
  flaggedReason: varchar("flagged_reason", { length: 200 }),
  moderatedBy: uuid("moderated_by").references(() => usersTable.id),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
}, (table) => ({
  // Check constraints for data validation
  ratingRange: check("rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  commentLength: check("comment_length", sql`length(${table.comment}) >= 10`),
}));