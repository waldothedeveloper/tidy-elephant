# Database Seeding Scripts

This directory contains scripts to seed your database with the 11 professional organizer categories.

## Category Seeding

### Quick Start

```bash
# Seed categories in development (using your local .env.local)
npm run db:seed:categories

# Force reseed (delete existing and recreate)
npm run db:seed:categories -- --force
```

### For Production

To seed categories in production, you need to set your production `DATABASE_URL`:

```bash
# Set your production database URL
export DATABASE_URL="postgresql://username:password@host:port/database"

# Run the seeding
npm run db:seed:categories

# Or force reseed in production
npm run db:seed:categories -- --force
```

### Using Environment Variables

For production deployment, you can also create a separate environment file:

```bash
# Create production environment file
echo "DATABASE_URL=your_production_neon_url" > .env.production

# Load and run
export $(cat .env.production | xargs) && npm run db:seed:categories
```

### Categories Being Seeded

The script will create these 11 categories:

1. **👑 Core Professional Organizers** (Primary Category)
2. Home Stagers
3. Feng Shui Consultants  
4. Move Managers and Downsizing Specialists
5. Interior Designers
6. Office Organizers
7. Home Organizers
8. Paperwork/Document Organizers
9. Digital Organizers
10. Time & Productivity Coaches
11. Estate Cleanout / Hoarding Specialists

### Script Behavior

- **Safety First**: Won't overwrite existing categories without `--force` flag
- **Rollback Safe**: Shows count of existing categories before proceeding
- **Visual Output**: Clear emojis and formatting for easy monitoring
- **Error Handling**: Proper error messages and exit codes

### Available Scripts

| Script | File | Description |
|--------|------|-------------|
| `scripts/seed-categories.js` | JavaScript | Production-ready, no TypeScript dependencies |
| `scripts/seed-categories.ts` | TypeScript | Development version with full type checking |

Both scripts do exactly the same thing, but the JavaScript version is more portable for production environments.

### Troubleshooting

**❌ DATABASE_URL not set**
- Make sure your `.env.local` file contains `DATABASE_URL`
- For production, export the environment variable before running

**⚠️ Categories already exist**
- Use the `--force` flag to recreate: `npm run db:seed:categories -- --force`
- This will delete all existing categories and recreate them

**🔌 Connection errors**
- Verify your Neon database is running and accessible
- Check your database URL format: `postgresql://user:pass@host:port/db`
- Ensure your IP is whitelisted in Neon dashboard

### Integration with Drizzle

The seeding uses the same category definitions from your schema:
- `src/lib/db/category-schema.ts` - Contains `INITIAL_CATEGORIES` constant
- Consistent with your existing Drizzle setup
- Uses proper UUID generation and timestamps