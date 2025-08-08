#!/usr/bin/env node
const { drizzle } = require("drizzle-orm/neon-serverless");
const { Pool } = require("@neondatabase/serverless");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd(), true);
// Categories data inline to avoid TypeScript import issues
const INITIAL_CATEGORIES = [
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
];

const seedCategories = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.log("💡 Make sure to set your DATABASE_URL in your environment");
    process.exit(1);
  }

  console.log("🌱 Starting category seeding...");
  console.log(`🔌 Connecting to database: ${databaseUrl.substring(0, 50)}...`);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    // Check if categories already exist
    const existingResult = await pool.query("SELECT COUNT(*) FROM categories");
    const existingCount = parseInt(existingResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories`);

      const forceFlag = process.argv.includes("--force");
      if (!forceFlag) {
        console.log(
          "💡 Run with --force to delete existing categories and reseed:"
        );
        console.log("   npm run db:seed:categories -- --force");
        await pool.end();
        return;
      }

      console.log("🗑️  Deleting existing categories...");
      await pool.query("DELETE FROM categories");
    }

    // Insert all categories
    console.log("📝 Inserting categories...");

    const values = INITIAL_CATEGORIES.map((category, index) => {
      return `($${index * 9 + 1}, $${index * 9 + 2}, $${index * 9 + 3}, $${index * 9 + 4}, $${index * 9 + 5}, $${index * 9 + 6}, $${index * 9 + 7}, $${index * 9 + 8}, $${index * 9 + 9})`;
    }).join(", ");

    const insertQuery = `
      INSERT INTO categories (name, slug, description, is_primary, sort_order, is_active, icon_name, color_hex, created_at)
      VALUES ${values}
      RETURNING id, name, slug, is_primary
    `;

    const params = INITIAL_CATEGORIES.flatMap((category) => [
      category.name,
      category.slug,
      category.description,
      category.isPrimary,
      category.sortOrder,
      true, // isActive
      category.iconName,
      category.colorHex,
      new Date().toISOString(),
    ]);

    const result = await pool.query(insertQuery, params);
    const insertedCategories = result.rows;

    console.log("✅ Successfully seeded categories:");
    insertedCategories.forEach((category, index) => {
      const icon = category.is_primary ? "👑" : "  ";
      console.log(`${icon} ${index + 1}. ${category.name} (${category.slug})`);
    });

    console.log(
      `\n🎉 Successfully seeded ${insertedCategories.length} categories!`
    );
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Handle command line execution
if (require.main === module) {
  seedCategories().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
}

module.exports = { seedCategories };
