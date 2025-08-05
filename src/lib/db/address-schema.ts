import { 
  boolean,
  decimal,
  index,
  pgEnum,
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar 
} from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";
import { bookingsTable } from "./booking-schema";

// Address-specific enums
export const addressTypeEnum = pgEnum("address_type", [
  "home", 
  "work", 
  "service_location", 
  "billing",
  "other"
]);

export const countryEnum = pgEnum("country", [
  "US", 
  "CA", 
  "UK", 
  "AU"
  // Add more countries as needed
]);

// Addresses table - normalized address storage
export const addressesTable = pgTable("addresses", {
  // Primary key
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Address Components
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(), // Street address
  addressLine2: varchar("address_line_2", { length: 255 }), // Apt, suite, etc.
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(), // State/Province
  postalCode: varchar("postal_code", { length: 20 }).notNull(), // ZIP/Postal code
  country: countryEnum("country").notNull().default("US"),
  
  // Geocoding (for distance calculations and mapping)
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // -90 to 90
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // -180 to 180
  
  // Address Metadata
  type: addressTypeEnum("type").notNull().default("home"),
  label: varchar("label", { length: 50 }), // Custom label like "Mom's House", "Downtown Office"
  
  // Validation & Quality
  isVerified: boolean("is_verified").notNull().default(false), // Address validation service confirmed
  isDeliverable: boolean("is_deliverable").notNull().default(true), // Can services be delivered here
  
  // Access Information (useful for service addresses)
  accessInstructions: text("access_instructions"), // How to access the property
  parkingInformation: text("parking_information"), // Parking details
  buildingInfo: text("building_info"), // Building name, floor, buzzer code, etc.
  
  // System fields
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Indexes
  // Geographic indexes for location-based queries
  index("idx_address_geocode").on(table.latitude, table.longitude),
  index("idx_address_latitude").on(table.latitude),
  index("idx_address_longitude").on(table.longitude),
  
  // Address validation and lookup indexes
  index("idx_address_type").on(table.type),
  index("idx_address_city_state").on(table.city, table.state),
  index("idx_address_postal_code").on(table.postalCode),
  index("idx_address_verification").on(table.isVerified, table.isDeliverable),
]);

// User Addresses Junction Table (Many-to-Many)
// Users can have multiple addresses (home, work, etc.)
export const userAddressesTable = pgTable("user_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  addressId: uuid("address_id").notNull().references(() => addressesTable.id, { onDelete: "cascade" }),
  
  // Relationship metadata
  isPrimary: boolean("is_primary").notNull().default(false), // Primary address for user
  label: varchar("label", { length: 50 }), // User's custom label for this address
  
  // System fields
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Indexes
  index("idx_user_address_primary").on(table.userId, table.isPrimary),
  index("idx_user_address_lookup").on(table.userId, table.addressId),
]);

// Booking Addresses Junction Table (Many-to-Many)
// Bookings can reference multiple addresses (service location, billing address)
export const bookingAddressesTable = pgTable("booking_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookingsTable.id, { onDelete: "cascade" }),
  addressId: uuid("address_id").notNull().references(() => addressesTable.id, { onDelete: "cascade" }),
  
  // Address role for this booking
  role: addressTypeEnum("role").notNull(), // "service_location", "billing", etc.
  
  // System fields
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Indexes
  index("idx_booking_address_role").on(table.bookingId, table.role),
  index("idx_booking_address_lookup").on(table.bookingId, table.addressId),
]);