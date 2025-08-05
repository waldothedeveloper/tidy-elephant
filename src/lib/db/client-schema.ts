import { 
  index,
  json,
  pgTable, 
  timestamp, 
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";

// Client profiles table
export const clientProfilesTable = pgTable("client_profiles", {
  // Primary key and foreign key to users
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  
  // Service Preferences
  preferredProviders: uuid("preferred_providers").array().default([]), // Array of provider profile IDs
  blockedProviders: uuid("blocked_providers").array().default([]), // Array of provider profile IDs
  
  // Scheduling Preferences
  timePreferences: json("time_preferences").$type<{
    preferredDays?: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
    preferredTimes?: string[]; // e.g., ["morning", "afternoon", "evening"]
  }>().default({}),
  
  // System fields
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Indexes
  // Core lookup index
  uniqueIndex("idx_client_user_id").on(table.userId),
  
  // Preference indexes for matching (GIN for array operations)
  index("idx_client_preferred_providers_gin").using("gin", table.preferredProviders),
  index("idx_client_blocked_providers_gin").using("gin", table.blockedProviders),
]);