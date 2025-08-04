# Type System Documentation

This document outlines the comprehensive type system for the Tidy Elephant marketplace application, including database types, validation schemas, and application-level types.

## Architecture Overview

Our type system follows a layered architecture:

1. **Database Layer** (`src/lib/db/types.ts`) - Auto-generated types from Drizzle schemas
2. **Validation Layer** (`src/lib/schemas/`) - Zod schemas for runtime validation
3. **Application Layer** (`src/types/`) - Business logic and UI-specific types

## Database Types

### Auto-Generated Types

Database types are automatically generated from Drizzle schemas using our type generation script:

```bash
npm run types:generate    # Generate types from schemas
npm run db:types         # Generate Drizzle schemas and types
```

The generated types follow this pattern:

- `TableName` - Select model (read operations)
- `InsertTableName` - Insert model (create operations)
- `UpdateTableName` - Update model (partial update operations)

### Core Entity Types

```typescript
// Users
export type User = InferSelectModel<typeof usersTable>;
export type InsertUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<Omit<InsertUser, "id" | "createdAt">>;

// Providers
export type ProviderProfile = InferSelectModel<typeof providerProfilesTable>;
export type InsertProviderProfile = InferInsertModel<
  typeof providerProfilesTable
>;
export type UpdateProviderProfile = Partial<
  Omit<InsertProviderProfile, "userId" | "createdAt">
>;

// Categories
export type Category = InferSelectModel<typeof categoriesTable>;
export type ProviderCategory = InferSelectModel<typeof providerCategoriesTable>;
export type ClientPreferredCategory = InferSelectModel<
  typeof clientPreferredCategoriesTable
>;
```

### Composite Types

For complex queries with relations:

```typescript
export type CompleteUser = User & {
  providerProfile: ProviderProfile | null;
  clientProfile: ClientProfile | null;
};

export type BookingWithDetails = Booking & {
  client: User;
  provider: User;
  category: Category;
  review: Review | null;
  payments: PaymentTransaction[];
};
```

## Validation Schemas

### Zod Schema Organization

Validation schemas are organized by domain:

- `src/lib/schemas/user-schemas.ts` - User, provider, and client validation
- `src/lib/schemas/booking-schemas.ts` - Booking and review validation
- `src/lib/schemas/index.ts` - Centralized exports

### Core Validation Patterns

```typescript
// Basic user profile validation
export const userProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phoneNumber: e164PhoneNumberSchema.optional(),
});

// Provider-specific validation
export const createProviderProfileSchema = z.object({
  userId: uuidSchema,
  hourlyRate: z.number().int().min(2500).max(25000), // $25-$250
  yearsOfExperience: z.number().int().min(0).max(50),
  // ... other fields
});
```

### Validation Utilities

```typescript
// Validate data with detailed error handling
const result = validateData(userProfileSchema, userData);
if (result.success) {
  // Use result.data
} else {
  // Handle result.errors
}

// Form validation with simplified error format
const { data, errors } = validateFormData(bookingRequestSchema, formData);
```

## Application Types

### Form Data Types

Derived from validation schemas for type-safe form handling:

```typescript
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ProviderOnboardingBasicInfo = z.infer<
  typeof providerOnboardingBasicInfoSchema
>;
export type BookingRequestData = z.infer<typeof bookingRequestSchema>;
```

### UI Display Types

Enhanced types for user interface components:

```typescript
export type ProviderListingData = ProviderProfile & {
  user: User;
  categories: Array<{ category: Category; isMainSpecialty: boolean }>;
  displayCategories: string[];
  mainSpecialty: string | null;
  isAvailable: boolean;
  ratingDisplay: string;
  priceDisplay: string;
};
```

### Search and Filter Types

```typescript
export type ProviderSearchFilters = {
  categoryIds?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  priceRange?: { min: number; max: number };
  rating?: number;
  // ... other filters
};
```

## Type Safety Guidelines

### 1. Never Use `any`

```typescript
// ❌ Avoid
function processUser(user: any) {}

// ✅ Use specific types
function processUser(user: CompleteUser) {}

// ✅ Use unknown for truly unknown data
function processData(data: unknown) {
  if (typeof data === "object" && data !== null) {
    // Type narrowing
  }
}
```

### 2. Use Type Guards

```typescript
export function isProvider(
  user: CompleteUser
): user is CompleteUser & { providerProfile: ProviderProfile } {
  return user.providerProfile !== null && user.roles.includes("provider");
}

// Usage
if (isProvider(user)) {
  // user.providerProfile is guaranteed to exist
  console.log(user.providerProfile.hourlyRate);
}
```

### 3. Leverage Utility Types

```typescript
// Extract specific fields
type UserBasicInfo = Pick<User, "id" | "firstName" | "lastName" | "email">;

// Make fields optional
type PartialBooking = Partial<Booking>;

// Omit sensitive fields
type PublicUser = Omit<User, "clerkUserID" | "referralCode">;
```

## Integration Patterns

### Server Actions

```typescript
export async function createProviderProfile(
  data: CreateProviderProfileData
): Promise<DbResult<ProviderProfile>> {
  try {
    // Validate input
    const validatedData = createProviderProfileSchema.parse(data);

    // Database operation
    const [profile] = await db
      .insert(providerProfilesTable)
      .values(validatedData)
      .returning();

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### React Hook Form Integration

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function ProviderOnboardingForm() {
  const form = useForm<ProviderOnboardingBasicInfo>({
    resolver: zodResolver(providerOnboardingBasicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Form is fully type-safe
}
```

### Database Queries

```typescript
async function getProviderWithCategories(
  providerId: string
): Promise<ProviderWithCategories | null> {
  const result = await db
    .select()
    .from(providerProfilesTable)
    .leftJoin(
      providerCategoriesTable,
      eq(providerProfilesTable.userId, providerCategoriesTable.providerId)
    )
    .leftJoin(
      categoriesTable,
      eq(providerCategoriesTable.categoryId, categoriesTable.id)
    )
    .where(eq(providerProfilesTable.userId, providerId));

  // Transform raw result to typed object
  return transformToProviderWithCategories(result);
}
```

## Type Generation Workflow

### Development Workflow

1. **Schema Changes**: Modify Drizzle schemas in `src/lib/db/*-schema.ts`
2. **Generate Types**: Run `npm run db:types` to update types
3. **Update Validation**: Update Zod schemas if needed
4. **Update Application Types**: Modify application-level types as needed
5. **Run Lint**: Ensure type safety with `npm run lint`

### Automated Type Generation

The type generation script (`scripts/generate-types.js`) automatically:

- Scans all `*-schema.ts` files
- Extracts table definitions
- Generates properly named TypeScript types
- Creates backups before overwriting
- Includes composite types and utilities

### CI/CD Integration

```json
// package.json
{
  "scripts": {
    "postinstall": "npm run db:generate",
    "build": "npm run db:types && next build",
    "type-check": "tsc --noEmit"
  }
}
```

## Best Practices

### 1. Schema-First Development

Always define Zod schemas first, then derive TypeScript types:

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>; // Derived type
```

### 2. Consistent Naming

- Database types: `PascalCase` singular (e.g., `User`, `ProviderProfile`)
- Form types: `PascalCase` with descriptive suffix (e.g., `UserProfileFormData`)
- Schemas: `camelCase` with `Schema` suffix (e.g., `userProfileSchema`)

### 3. Error Handling

Use discriminated unions for error handling:

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: ApiResult<T>) {
  if (result.success) {
    // result.data is available
  } else {
    // result.error is available
  }
}
```

### 4. Type Documentation

Document complex types with JSDoc comments:

```typescript
/**
 * Provider search result with computed display fields
 * Used in marketplace listing components
 */
export type ProviderSearchResult = ProviderListingData & {
  distance?: number; // in miles, if location search
  matchScore: number; // relevance score 0-1
  availableSlots?: string[]; // if availability search
};
```

## Migration from Firebase Types

The application is transitioning from Firebase-based types to Drizzle-based types:

1. **Legacy Types**: Marked as `@deprecated` and kept for reference
2. **Migration Strategy**: Gradual replacement of Firebase types with database types
3. **Type Guards**: Use type guards to safely transition between type systems

## Troubleshooting

### Common Type Errors

1. **Type not found**: Run `npm run types:generate` to regenerate types
2. **Validation errors**: Check that Zod schema matches expected data structure
3. **Lint errors**: Ensure no `any` types and all imports are used

### Debugging Tips

1. Use TypeScript's `satisfies` operator for type checking without widening
2. Enable strict mode in `tsconfig.json` for better type safety
3. Use type assertions sparingly and with clear justification

## Future Enhancements

1. **Runtime Type Checking**: Integration with libraries like `io-ts` for runtime validation
2. **API Type Generation**: Generate API client types from OpenAPI specs
3. **Database Migration Types**: Type-safe database migrations
4. **GraphQL Integration**: Type generation for GraphQL schemas
