import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { clientProfilesTable } from "./client-schema";
import { providerProfilesTable } from "./provider-schema";

// Service categories table for professional organizer marketplace
export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),

  // Category Metadata
  isPrimary: boolean("is_primary").notNull().default(false), // Core Professional Organizers
  sortOrder: integer("sort_order").notNull().default(0), // Display order
  isActive: boolean("is_active").notNull().default(true),

  // SEO and Display
  iconName: varchar("icon_name", { length: 50 }), // Icon identifier for UI
  colorHex: varchar("color_hex", { length: 7 }), // Hex color code for UI theming

  // System fields
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Validation constraints
  validHexColor: check("valid_hex_color", sql`${table.colorHex} IS NULL OR ${table.colorHex} ~ '^#[0-9A-Fa-f]{6}$'`),
}));

// Junction table for provider categories (Many-to-Many)
export const providerCategoriesTable = pgTable("provider_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providerProfilesTable.userId, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),

  // Relationship metadata
  isMainSpecialty: boolean("is_main_specialty").notNull().default(false), // Provider's main specialty category
  experienceYears: integer("experience_years"), // Years of experience in this category

  // System fields
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Unique constraints to prevent duplicate relationships
  uniqueProviderCategory: unique("unique_provider_category").on(
    table.providerId, 
    table.categoryId
  ),
}));

// Junction table for client preferred categories (Many-to-Many)
export const clientPreferredCategoriesTable = pgTable(
  "client_preferred_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientProfilesTable.userId, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),

    // Preference metadata
    priority: integer("priority").default(1), // 1 = highest priority

    // System fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    // Unique constraints to prevent duplicate preferences
    uniqueClientCategory: unique("unique_client_category").on(
      table.clientId, 
      table.categoryId
    ),
  })
);

// Initial category data - will be inserted via migration or seed script
export const INITIAL_CATEGORIES = [
  {
    name: "Core Professional Organizers",
    slug: "core-professional-organizers",
    description:
      "Primary category for comprehensive home and life organization services",
    isPrimary: true,
    sortOrder: 1,
    iconName: "home-organization",
    colorHex: "#2563eb",
  },
  {
    name: "Home Stagers",
    slug: "home-stagers",
    description:
      "Prepare homes for sale by optimizing layout, décor, and presentation",
    isPrimary: false,
    sortOrder: 2,
    iconName: "home-staging",
    colorHex: "#7c3aed",
  },
  {
    name: "Feng Shui Consultants",
    slug: "feng-shui-consultants",
    description: "Focus on optimizing energy flow and harmony in living spaces",
    isPrimary: false,
    sortOrder: 3,
    iconName: "feng-shui",
    colorHex: "#059669",
  },
  {
    name: "Move Managers and Downsizing Specialists",
    slug: "move-managers-downsizing",
    description:
      "Help with life transitions, relocations, and downsizing decisions",
    isPrimary: false,
    sortOrder: 4,
    iconName: "moving-boxes",
    colorHex: "#dc2626",
  },
  {
    name: "Interior Designers",
    slug: "interior-designers",
    description:
      "Design and organize interior spaces for functionality and aesthetics",
    isPrimary: false,
    sortOrder: 5,
    iconName: "interior-design",
    colorHex: "#ea580c",
  },
  {
    name: "Office Organizers",
    slug: "office-organizers",
    description:
      "Organize home offices or corporate spaces for maximum productivity",
    isPrimary: false,
    sortOrder: 6,
    iconName: "office-organization",
    colorHex: "#0891b2",
  },
  {
    name: "Home Organizers",
    slug: "home-organizers",
    description:
      "Specialize in residential organization for kitchens, closets, and living areas",
    isPrimary: false,
    sortOrder: 7,
    iconName: "home-clean",
    colorHex: "#65a30d",
  },
  {
    name: "Paperwork/Document Organizers",
    slug: "paperwork-document-organizers",
    description:
      "Organize physical and digital documents, filing systems, and paperwork",
    isPrimary: false,
    sortOrder: 8,
    iconName: "documents",
    colorHex: "#7c2d12",
  },
  {
    name: "Digital Organizers",
    slug: "digital-organizers",
    description:
      "Help clients organize digital files, photos, accounts, and online presence",
    isPrimary: false,
    sortOrder: 9,
    iconName: "digital-files",
    colorHex: "#be185d",
  },
  {
    name: "Time & Productivity Coaches",
    slug: "time-productivity-coaches",
    description:
      "Help with calendar management, workflows, and productivity systems",
    isPrimary: false,
    sortOrder: 10,
    iconName: "time-management",
    colorHex: "#9333ea",
  },
  {
    name: "Estate Cleanout / Hoarding Specialists",
    slug: "estate-cleanout-hoarding",
    description:
      "Handle sensitive situations involving estate cleanouts and extreme clutter/hoarding",
    isPrimary: false,
    sortOrder: 11,
    iconName: "estate-cleanout",
    colorHex: "#991b1b",
  },
] as const;
