#!/usr/bin/env node

/**
 * Type generation script for Drizzle schemas
 * This script automatically generates TypeScript types from our database schemas
 * and ensures they're kept in sync with schema changes.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCHEMA_DIR = path.join(__dirname, '../src/lib/db');
const TYPES_FILE = path.join(SCHEMA_DIR, 'types.ts');
const BACKUP_DIR = path.join(__dirname, '../backups/types');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function log(message) {
  console.log(`[type-gen] ${message}`);
}

function createBackup() {
  if (fs.existsSync(TYPES_FILE)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `types-${timestamp}.ts`);
    fs.copyFileSync(TYPES_FILE, backupFile);
    log(`Created backup: ${backupFile}`);
  }
}

function getSchemaFiles() {
  return fs.readdirSync(SCHEMA_DIR)
    .filter(file => file.endsWith('-schema.ts') && file !== 'types.ts')
    .sort();
}

function extractTableExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tablePattern = /export const (\w+Table) = pgTable/g;
  const tables = [];
  let match;
  
  while ((match = tablePattern.exec(content)) !== null) {
    tables.push(match[1]);
  }
  
  return tables;
}

function generateTypesContent() {
  const schemaFiles = getSchemaFiles();
  const allTables = {};
  
  // Extract table information from each schema file
  schemaFiles.forEach(file => {
    const filePath = path.join(SCHEMA_DIR, file);
    const tables = extractTableExports(filePath);
    const schemaName = file.replace('-schema.ts', '');
    allTables[schemaName] = tables;
  });

  // Generate the types file content
  const content = `/**
 * Generated types from Drizzle schemas for type-safe database operations
 * This file provides TypeScript types derived from our database schemas
 * 
 * Generated on: ${new Date().toISOString()}
 * 
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To regenerate: npm run types:generate
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Import all schema tables
${schemaFiles.map(file => {
  const schemaName = file.replace('-schema.ts', '');
  const tables = allTables[schemaName];
  if (tables.length === 0) return '';
  
  return `import { ${tables.join(', ')} } from "./${file.replace('.ts', '')}";`;
}).filter(Boolean).join('\n')}

// =============================================================================
// GENERATED TYPES
// =============================================================================

${Object.entries(allTables).map(([schemaName, tables]) => {
  if (tables.length === 0) return '';
  
  return `// Types for ${schemaName} schema
${tables.map(table => {
  // Convert camelCase table names to PascalCase
  const typeName = table
    .replace('Table', '') // Remove 'Table' suffix
    .replace(/([A-Z])/g, (match, letter, index) => 
      index === 0 ? letter.toUpperCase() : letter
    )
    .replace(/^[a-z]/, (match) => match.toUpperCase()); // Ensure first letter is uppercase
  
  return `export type ${typeName} = InferSelectModel<typeof ${table}>;
export type Insert${typeName} = InferInsertModel<typeof ${table}>;
export type Update${typeName} = Partial<Omit<Insert${typeName}, "id" | "createdAt">>;`;
}).join('\n')}`;
}).filter(Boolean).join('\n\n')}

// =============================================================================
// COMPOSITE TYPES (WITH RELATIONS)
// =============================================================================

/**
 * User with provider profile (when user is a provider)
 */
export type UserWithProviderProfile = User & {
  providerProfile: ProviderProfile | null;
};

/**
 * User with client profile (when user is a client)
 */
export type UserWithClientProfile = User & {
  clientProfile: ClientProfile | null;
};

/**
 * Complete user with both profiles (one will be null)
 */
export type CompleteUser = User & {
  providerProfile: ProviderProfile | null;
  clientProfile: ClientProfile | null;
};

/**
 * Provider with their category relationships
 */
export type ProviderWithCategories = ProviderProfile & {
  categories: Array<ProviderCategory & { category: Category }>;
};

/**
 * Client with their preferred categories
 */
export type ClientWithPreferences = ClientProfile & {
  preferredCategories: Array<ClientPreferredCategory & { category: Category }>;
};

/**
 * Booking with all related data
 */
export type BookingWithDetails = Booking & {
  client: User;
  provider: User;
  category: Category;
  review: Review | null;
  payments: PaymentTransaction[];
  addresses: Array<BookingAddress & { address: Address }>;
};

/**
 * Review with related user and booking data
 */
export type ReviewWithDetails = Review & {
  client: User;
  provider: User;
  booking: Booking;
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type for database transaction context
 */
export type DbTransaction = Parameters<Parameters<typeof import("./index").db.transaction>[0]>[0];

/**
 * Common database operation result types
 */
export type DbResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

/**
 * Paginated results type
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Search filters type for common queries
 */
export type SearchFilters = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// =============================================================================
// ENUM TYPES (from schema)
// =============================================================================

/**
 * User account status enum
 */
export type UserAccountStatus = User["accountStatus"];

/**
 * User roles enum  
 */
export type UserRole = NonNullable<User["roles"]>[number];

/**
 * Booking status enum
 */
export type BookingStatus = Booking["status"];

/**
 * Payment status enum
 */
export type PaymentStatus = PaymentTransaction["status"];

/**
 * Review status enum
 */
export type ReviewStatus = Review["status"];

/**
 * Address type enum
 */
export type AddressType = Address["type"];

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if user has provider profile
 */
export function isUserProvider(user: CompleteUser): user is CompleteUser & { providerProfile: ProviderProfile } {
  return user.providerProfile !== null;
}

/**
 * Type guard to check if user has client profile  
 */
export function isUserClient(user: CompleteUser): user is CompleteUser & { clientProfile: ClientProfile } {
  return user.clientProfile !== null;
}

/**
 * Type guard to check if booking is completed
 */
export function isBookingCompleted(booking: Booking): boolean {
  return booking.status === "completed";
}

/**
 * Type guard to check if payment is successful
 */
export function isPaymentSuccessful(payment: PaymentTransaction): boolean {
  return payment.status === "completed";
}`;

  return content;
}

function main() {
  try {
    log('Starting type generation...');
    
    // Create backup of existing types file
    createBackup();
    
    // Generate new types content
    const typesContent = generateTypesContent();
    
    // Write the new types file
    fs.writeFileSync(TYPES_FILE, typesContent);
    
    log(`Types generated successfully: ${TYPES_FILE}`);
    log('✅ Type generation completed');
    
  } catch (error) {
    console.error('[type-gen] Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateTypesContent };