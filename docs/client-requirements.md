# Client Requirements

## Service Preferences

- `preferredServiceCategories` - Array of service types the client frequently needs
- `preferredProviders` - Array of provider IDs that client likes to work with
- `blockedProviders` - Array of provider IDs that client doesn't want to see

### Scheduling Preferences

- `timePreferences` - Object containing scheduling preferences
  - `preferredDays` - Array of preferred days of the week (e.g., ["Monday", "Wednesday", "Friday"])
  - `preferredTimes` - Array of preferred time slots/ranges (e.g., ["morning", "afternoon", "evening"])

NOTES:
Key design decisions:

1. Separate table: client_profiles with foreign key to users table
2. Provider relationships: Used UUID arrays for preferred/blocked providers - these reference providerProfilesTable.id conceptually
3. Flexible preferences: JSON object for timePreferences allows easy extension
4. Proper imports: References both user and provider schemas

Schema features:

- One-to-one relationship with users (each user can have one client profile)
- Cascade delete when user is removed
- Arrays for multiple service categories and provider preferences
- Typed JSON for structured scheduling preferences

  Future considerations:

- When categories table is created, preferredServiceCategories should reference it
- Consider junction tables if provider relationships become more complex (with metadata like "favorite since", etc.)
- Could add validation constraints for the provider arrays to ensure they reference valid provider profiles

  The schema maintains consistency with the provider pattern and properly handles cross-references between all three schemas.
