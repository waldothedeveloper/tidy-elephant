import { sql } from "drizzle-orm";
import { db } from "./index";
import { categoriesTable, providerCategoriesTable, clientPreferredCategoriesTable, INITIAL_CATEGORIES } from "./category-schema";
import { providerProfilesTable } from "./provider-schema";
import { clientProfilesTable } from "./client-schema";

/**
 * Migration strategy for converting from text[] categories to normalized category system
 * This handles the data migration from existing provider/client category arrays to junction tables
 */

export async function migrateCategoriesData() {
  // Start a transaction for data integrity
  await db.transaction(async (tx) => {
    
    // Step 1: Seed the categories table with initial data
    console.log("Seeding categories table...");
    await tx.insert(categoriesTable).values(INITIAL_CATEGORIES).onConflictDoNothing();
    
    // Step 2: Migrate provider categories from text[] to junction table
    console.log("Migrating provider categories...");
    await tx.execute(sql`
      INSERT INTO provider_categories (provider_id, category_id, is_main_specialty, created_at)
      SELECT 
        pp.user_id as provider_id,
        c.id as category_id,
        -- First category in array becomes main specialty
        (array_position(pp.categories, c.name) = 1) as is_main_specialty,
        NOW() as created_at
      FROM provider_profiles pp
      CROSS JOIN categories c
      WHERE c.name = ANY(pp.categories)
        AND array_length(pp.categories, 1) > 0
      ON CONFLICT (provider_id, category_id) DO NOTHING;
    `);

    // Step 3: Migrate client preferred categories from text[] to junction table
    console.log("Migrating client preferred categories...");
    await tx.execute(sql`
      INSERT INTO client_preferred_categories (client_id, category_id, priority, created_at)
      SELECT 
        cp.user_id as client_id,
        c.id as category_id,
        -- Array position determines priority (1 = highest)
        array_position(cp.preferred_service_categories, c.name) as priority,
        NOW() as created_at
      FROM client_profiles cp
      CROSS JOIN categories c
      WHERE c.name = ANY(cp.preferred_service_categories)
        AND array_length(cp.preferred_service_categories, 1) > 0
      ON CONFLICT (client_id, category_id) DO NOTHING;
    `);

    console.log("Categories data migration completed successfully!");
  });
}

/**
 * Rollback strategy - converts normalized data back to text arrays
 * WARNING: This will lose some metadata (experience years, exact priorities)
 */
export async function rollbackCategoriesData() {
  await db.transaction(async (tx) => {
    
    // Step 1: Restore provider categories to text[] format
    console.log("Rolling back provider categories...");
    await tx.execute(sql`
      UPDATE provider_profiles 
      SET categories = (
        SELECT array_agg(c.name ORDER BY 
          CASE WHEN pc.is_main_specialty THEN 0 ELSE 1 END,
          c.sort_order
        )
        FROM provider_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE pc.provider_id = provider_profiles.user_id
      )
      WHERE EXISTS (
        SELECT 1 FROM provider_categories pc 
        WHERE pc.provider_id = provider_profiles.user_id
      );
    `);

    // Step 2: Restore client preferred categories to text[] format
    console.log("Rolling back client preferred categories...");
    await tx.execute(sql`
      UPDATE client_profiles 
      SET preferred_service_categories = (
        SELECT array_agg(c.name ORDER BY 
          COALESCE(cpc.priority, 999),
          c.sort_order
        )
        FROM client_preferred_categories cpc
        JOIN categories c ON cpc.category_id = c.id
        WHERE cpc.client_id = client_profiles.user_id
      )
      WHERE EXISTS (
        SELECT 1 FROM client_preferred_categories cpc 
        WHERE cpc.client_id = client_profiles.user_id
      );
    `);

    console.log("Categories data rollback completed!");
  });
}

/**
 * Validation function to ensure data integrity after migration
 */
export async function validateCategoriesMigration() {
  const results = await db.execute(sql`
    SELECT 
      'provider_categories' as table_name,
      COUNT(*) as total_relationships,
      COUNT(CASE WHEN is_main_specialty THEN 1 END) as main_specialties,
      COUNT(DISTINCT provider_id) as unique_providers
    FROM provider_categories
    
    UNION ALL
    
    SELECT 
      'client_preferred_categories' as table_name,
      COUNT(*) as total_relationships,
      COUNT(CASE WHEN priority = 1 THEN 1 END) as top_priorities,
      COUNT(DISTINCT client_id) as unique_clients
    FROM client_preferred_categories
    
    UNION ALL
    
    SELECT 
      'categories' as table_name,
      COUNT(*) as total_categories,
      COUNT(CASE WHEN is_active THEN 1 END) as active_categories,
      COUNT(CASE WHEN is_primary THEN 1 END) as primary_categories
    FROM categories;
  `);

  console.log("Migration validation results:");
  console.table(results);
  
  // Check for providers with multiple main specialties (should be 0 or 1 per provider)
  const multipleMainSpecialties = await db.execute(sql`
    SELECT provider_id, COUNT(*) as main_specialty_count
    FROM provider_categories 
    WHERE is_main_specialty = true
    GROUP BY provider_id
    HAVING COUNT(*) > 1;
  `);

  if (multipleMainSpecialties.length > 0) {
    console.warn("⚠️  Found providers with multiple main specialties:", multipleMainSpecialties);
  } else {
    console.log("✅ No providers have multiple main specialties");
  }

  return results;
}

/**
 * Backup existing category data before migration
 * Creates backup tables that can be used for rollback if needed
 */
export async function backupCategoryData() {
  await db.execute(sql`
    -- Backup provider categories
    CREATE TABLE IF NOT EXISTS provider_categories_backup AS
    SELECT user_id, categories, created_at, updated_at
    FROM provider_profiles
    WHERE array_length(categories, 1) > 0;
    
    -- Backup client preferred categories  
    CREATE TABLE IF NOT EXISTS client_categories_backup AS
    SELECT user_id, preferred_service_categories, created_at, updated_at
    FROM client_profiles
    WHERE array_length(preferred_service_categories, 1) > 0;
  `);
  
  console.log("Category data backed up successfully!");
}

/**
 * Clean up backup tables after successful migration
 */
export async function cleanupBackupTables() {
  await db.execute(sql`
    DROP TABLE IF EXISTS provider_categories_backup;
    DROP TABLE IF EXISTS client_categories_backup;
  `);
  
  console.log("Backup tables cleaned up!");
}

/**
 * Complete migration workflow with safety checks
 */
export async function runCategoriesMigration() {
  try {
    console.log("🚀 Starting categories migration...");
    
    // Step 1: Create backup
    await backupCategoryData();
    
    // Step 2: Run migration
    await migrateCategoriesData();
    
    // Step 3: Validate results
    await validateCategoriesMigration();
    
    console.log("✅ Categories migration completed successfully!");
    console.log("💡 Run cleanupBackupTables() after verifying everything works correctly");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("💡 Use rollbackCategoriesData() to restore previous state");
    throw error;
  }
}