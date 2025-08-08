# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build` (production build with Turbopack)
- **Start production**: `npm start`
- **Lint**: `npm run lint` (ESLint with Next.js config)

## Architecture Overview

This is a Next.js 15 marketplace application connecting professional organizers (providers) with clients. The tech stack includes:

### Core Technologies

- **Next.js 15** with App Router and Turbopack
- **TypeScript** with strict configuration
- **Tailwind CSS v4** for styling
- **React 19** with React Hook Form
  **lucide-react** for icons
  **motion** for subtle animations
  **ShadCN/UI** for styling
  **react-hook-form** For Forms hooked with ShadCN
  **eslint**

### Pull Request Standards

All Pull Requests will add EVERY FILE, not just the files related to the branch. Make sure ALL files are ALWAYS added. This is NOT NEGOTIABLE.

### Styling Rules

Always use ShadCN/UI and TailwindCSS v4 and above.
Make sure to ALWAYS USE consistent TailwindcSS v4 styling utilities. You keep using v3 utilities and that is NON NEGOTIABLE. Common examples of v3 are using height and width utilities such as h-4 w-4. These should always match v4 like this: size-4

### Authentication & User Management

- **Clerk** for authentication with custom onboarding flows
- **Middleware** (`src/middleware.tsx`) enforces role-based access control:
  - Public routes: home, sign-in, become-an-ease-specialist
  - Provider routes: `/provider/*` (requires completed onboarding)
  - Onboarding routes: `/onboarding/*` (providers only, except welcome page)

### Database & Storage

- **Neon PostgreSQL** for data persistence with serverless scaling
- **Drizzle ORM** for type-safe database operations and schema management
- **Upstash Redis** with rate limiting

#### Database Driver Configuration

- **Current Setup**: Using `drizzle-orm/neon-serverless` with `@neondatabase/serverless` Pool
- **Transaction Support**: Full transaction support available with `db.transaction()`
- **Driver Choice**: 
  - `neon-http`: Faster for single queries, NO transaction support
  - `neon-serverless`: Session support, full transaction capabilities, WebSocket-based

### External Services

- **Twilio** for SMS verification (lookup, send, verify)
- **Resend** for email services
- **Vercel Analytics** and Speed Insights
  **Vercel** FOr hosting among other services

## Key Architecture Patterns

### Data Access Layer (DAL)

All database operations (data access layer) go through `src/lib/dal/**` which:

- Enforces authentication for all operations
- Provides separate `enforceAuth()` and `enforceAuthProvider()` functions
- Handles Twilio integration with comprehensive error handling
- Uses React `cache()` for server-side caching

### Authentication Flow

1. Users sign up via Clerk
2. Provider onboarding sets `privateMetadata.isAProvider = true`
3. Middleware routes users based on authentication state and provider status
4. PostgreSQL maintains user data with full relational capabilities

### Form Validation

Centralized schemas in `src/lib/schemas/**`:

- `userProfileSchema` - Basic profile information
- `userProfilePhoneVerificationSchema` - Phone number validation
- `userProfileCodeVerificationSchema` - SMS code verification
- `e164PhoneNumberSchema` - E.164 phone format validation
- `userCategoriesSchema` - Service category selection

There will be more schemas as the project grows

### Server Actions

Located in `src/app/actions/**` with subdirectories for feature areas:

- Onboarding actions handle provider registration flow
- All actions use DAL functions for data access
- Rate limiting applied where appropriate

### MANDATORY SERVER ACTION SECURITY RULES

1. **NEVER THROW EXCEPTIONS** - Always return error objects
2. **AUTHENTICATE FIRST** - Check auth before any logic
3. **VALIDATE ALL INPUTS** - Use `safeParse()`, never `parse()`
4. **SANITIZE INPUTS** - Clean data before validation
5. **RATE LIMIT EARLY** - Check limits before expensive operations (ASK USER FIRST)
6. **TRY/CATCH EVERYTHING** - Wrap all external calls
7. **LOG ERRORS SAFELY** - Never expose internal details to client
8. **RETURN CONSISTENT TYPES** - Use types from `src/types/api-responses.ts`
9. **USE GENERIC ERROR MESSAGES** - Don't leak validation details
10. **CHECK PERMISSIONS** - Verify user can perform this action
11. **NO HARDCODED SENSITIVE DATA OR ENVIRONMENT VARIABLES** - Never hardcode sensitive data, Never use environments variables. ONLY DAL functions can use environment variables

**Important**: Always ask user if server action should be rate limited before implementing. Use helper functions from `src/types/api-responses.ts` for consistent response types.

### UI Components

- Custom components in `src/components/ui/` following Radix UI patterns
- Shadcn/ui component library integration
- Motion animations with Framer Motion
- Toast notifications via Sonner

## Database Configuration

### Neon PostgreSQL

- **Production**: Neon serverless PostgreSQL database
- **Connection**: Uses connection pooling for optimal performance
- **SSL**: Required for all connections

### Drizzle ORM

- **Schema**: Defined in `src/lib/db/schema.ts`
- **Migrations**: Located in `drizzle/` directory
- **Studio**: `npx drizzle-kit studio` for database management
- **Config**: `drizzle.config.ts` with Neon connection

### Database Schema

- To be created soon...

## Environment Variables Required

### Clerk

- Clerk authentication keys

### Database

- `DATABASE_URL` - Neon PostgreSQL connection string

### Twilio

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

### Upstash Redis

- Redis connection credentials for rate limiting

## Rate Limiting

- Implemented via Upstash Redis in `src/lib/upstash-rate-limiter/index.ts`
- Applied to Twilio operations with specific retry delays:
  - Rate limit errors: 60 seconds
  - Max attempts: 3600 seconds (1 hour)

## Onboarding Flow

Multi-step provider onboarding:

1. **Welcome** (`/onboarding/welcome`) - Open to all authenticated users
2. **Basic Info** (`/onboarding/basic-info`) - Profile creation
3. **Phone Verification** (`/onboarding/verify-phone`) - Twilio SMS verification
4. **Category Selection** (`/onboarding/select-categories`) - Service areas
5. **Hourly Rate** (`/onboarding/hourly-rate`) - Hourly Rate
6. **Upload Work Photos** (`/onboarding/upload-work-photos`) - Upload at least 3 to max 8 work photos during onboarding

Completion sets `privateMetadata.onboardingComplete = true` allowing provider dashboard access.

## TypeScript Guidelines

- **No `any`** - ever. Use `unknown` if type is truly unknown
- **No type assertions** (`as SomeType`) unless absolutely necessary with clear justification
- **No `@ts-ignore`** or `@ts-expect-error` without explicit explanation
- These rules apply to test code as well as production code

### Type Definitions

- **Prefer `type` over `interface`** in all cases
- Use explicit typing where it aids clarity, but leverage inference where appropriate
- Utilize utility types effectively (`Pick`, `Omit`, `Partial`, `Required`, etc.)
- Create domain-specific types (e.g., `UserId`, `PaymentId`) for type safety
- Use Valibot to create types, by creating schemas first

```typescript
// Good
type UserId = string & { readonly brand: unique symbol };
type PaymentAmount = number & { readonly brand: unique symbol };

// Avoid
type UserId = string;
type PaymentAmount = number;
```

#### Schema-First Development with Drizzle-Valibot package

Always define your schemas first with Drizzle, then derive types from them:

```typescript
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-valibot";
import { parse } from "valibot";

const users = pgTable("users", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: text().notNull(),
  age: integer().notNull(),
});

const userSelectSchema = createSelectSchema(users);

const rows = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .limit(1);
const parsed: { id: number; name: string; age: number } = parse(
  userSelectSchema,
  rows[0]
); // Error: `age` is not returned in the above query

const rows = await db.select().from(users).limit(1);
const parsed: { id: number; name: string; age: number } = parse(
  userSelectSchema,
  rows[0]
); // Will parse successfully
```

## Code Style

### Functional Programming

I follow a "functional light" approach:

- **No data mutation** - work with immutable data structures
- **Pure functions** wherever possible
- **Composition** as the primary mechanism for code reuse
- Avoid heavy FP abstractions (no need for complex monads or pipe/compose patterns) unless there is a clear advantage to using them
- Use array methods (`map`, `filter`, `reduce`) over imperative loops

#### Examples of Functional Patterns

```typescript
// Good - Pure function with immutable updates
const applyDiscount = (order: Order, discountPercent: number): Order => {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: item.price * (1 - discountPercent / 100),
    })),
    totalPrice: order.items.reduce(
      (sum, item) => sum + item.price * (1 - discountPercent / 100),
      0
    ),
  };
};

// Good - Composition over complex logic
const processOrder = (order: Order): ProcessedOrder => {
  return pipe(
    order,
    validateOrder,
    applyPromotions,
    calculateTax,
    assignWarehouse
  );
};

// When heavy FP abstractions ARE appropriate:
// - Complex async flows that benefit from Task/IO types
// - Error handling chains that benefit from Result/Either types
// Example with Result type for complex error handling:
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const chainPaymentOperations = (
  payment: Payment
): Result<Receipt, PaymentError> => {
  return pipe(
    validatePayment(payment),
    chain(authorizePayment),
    chain(capturePayment),
    map(generateReceipt)
  );
};
```

### Code Structure

- **No nested if/else statements** - use early returns, guard clauses, or composition
- **Avoid deep nesting** in general (max 2 levels)
- Keep functions small and focused on a single responsibility
- Prefer flat, readable code over clever abstractions

### Naming Conventions

- **Functions**: `camelCase`, verb-based (e.g., `calculateTotal`, `validatePayment`)
- **Types**: `PascalCase` (e.g., `PaymentRequest`, `UserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for configuration
- **Files**: `kebab-case.ts` for all TypeScript files
- **Test files**: `*.test.ts` or `*.spec.ts`

### No Comments in Code

Code should be self-documenting through clear naming and structure. Comments indicate that the code itself is not clear enough.

```typescript
// Avoid: Comments explaining what the code does
const calculateDiscount = (price: number, customer: Customer): number => {
  // Check if customer is premium
  if (customer.tier === "premium") {
    // Apply 20% discount for premium customers
    return price * 0.8;
  }
  // Regular customers get 10% discount
  return price * 0.9;
};

// Good: Self-documenting code with clear names
const PREMIUM_DISCOUNT_MULTIPLIER = 0.8;
const STANDARD_DISCOUNT_MULTIPLIER = 0.9;

const isPremiumCustomer = (customer: Customer): boolean => {
  return customer.tier === "premium";
};

const calculateDiscount = (price: number, customer: Customer): number => {
  const discountMultiplier = isPremiumCustomer(customer)
    ? PREMIUM_DISCOUNT_MULTIPLIER
    : STANDARD_DISCOUNT_MULTIPLIER;

  return price * discountMultiplier;
};

// Avoid: Complex logic with comments
const processPayment = (payment: Payment): ProcessedPayment => {
  // First validate the payment
  if (!validatePayment(payment)) {
    throw new Error("Invalid payment");
  }

  // Check if we need to apply 3D secure
  if (payment.amount > 100 && payment.card.type === "credit") {
    // Apply 3D secure for credit cards over £100
    const securePayment = apply3DSecure(payment);
    // Process the secure payment
    return executePayment(securePayment);
  }

  // Process the payment
  return executePayment(payment);
};

// Good: Extract to well-named functions
const requires3DSecure = (payment: Payment): boolean => {
  const SECURE_PAYMENT_THRESHOLD = 100;
  return (
    payment.amount > SECURE_PAYMENT_THRESHOLD && payment.card.type === "credit"
  );
};

const processPayment = (payment: Payment): ProcessedPayment => {
  if (!validatePayment(payment)) {
    throw new PaymentValidationError("Invalid payment");
  }

  const securedPayment = requires3DSecure(payment)
    ? apply3DSecure(payment)
    : payment;

  return executePayment(securedPayment);
};
```

### Prefer Options Objects

Use options objects for function parameters as the default pattern. Only use positional parameters when there's a clear, compelling reason (e.g., single-parameter pure functions, well-established conventions like `map(item => item.value)`).

```typescript
// Avoid: Multiple positional parameters
const createPayment = (
  amount: number,
  currency: string,
  cardId: string,
  customerId: string,
  description?: string,
  metadata?: Record<string, unknown>,
  idempotencyKey?: string
): Payment => {
  // implementation
};

// Calling it is unclear
const payment = createPayment(
  100,
  "GBP",
  "card_123",
  "cust_456",
  undefined,
  { orderId: "order_789" },
  "key_123"
);

// Good: Options object with clear property names
type CreatePaymentOptions = {
  amount: number;
  currency: string;
  cardId: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

const createPayment = (options: CreatePaymentOptions): Payment => {
  const {
    amount,
    currency,
    cardId,
    customerId,
    description,
    metadata,
    idempotencyKey,
  } = options;

  // implementation
};

// Clear and readable at call site
const payment = createPayment({
  amount: 100,
  currency: "GBP",
  cardId: "card_123",
  customerId: "cust_456",
  metadata: { orderId: "order_789" },
  idempotencyKey: "key_123",
});

// Avoid: Boolean flags as parameters
const fetchCustomers = (
  includeInactive: boolean,
  includePending: boolean,
  includeDeleted: boolean,
  sortByDate: boolean
): Customer[] => {
  // implementation
};

// Confusing at call site
const customers = fetchCustomers(true, false, false, true);

// Good: Options object with clear intent
type FetchCustomersOptions = {
  includeInactive?: boolean;
  includePending?: boolean;
  includeDeleted?: boolean;
  sortBy?: "date" | "name" | "value";
};

const fetchCustomers = (options: FetchCustomersOptions = {}): Customer[] => {
  const {
    includeInactive = false,
    includePending = false,
    includeDeleted = false,
    sortBy = "name",
  } = options;

  // implementation
};

// Self-documenting at call site
const customers = fetchCustomers({
  includeInactive: true,
  sortBy: "date",
});

// Good: Configuration objects for complex operations
type ProcessOrderOptions = {
  order: Order;
  shipping: {
    method: "standard" | "express" | "overnight";
    address: Address;
  };
  payment: {
    method: PaymentMethod;
    saveForFuture?: boolean;
  };
  promotions?: {
    codes?: string[];
    autoApply?: boolean;
  };
};

const processOrder = (options: ProcessOrderOptions): ProcessedOrder => {
  const { order, shipping, payment, promotions = {} } = options;

  // Clear access to nested options
  const orderWithPromotions = promotions.autoApply
    ? applyAvailablePromotions(order)
    : order;

  return executeOrder({
    ...orderWithPromotions,
    shippingMethod: shipping.method,
    paymentMethod: payment.method,
  });
};

// Acceptable: Single parameter for simple transforms
const double = (n: number): number => n * 2;
const getName = (user: User): string => user.name;

// Acceptable: Well-established patterns
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);
const users = fetchUsers();
const names = users.map((user) => user.name);
```

**Guidelines for options objects:**

- Default to options objects unless there's a specific reason not to
- Always use for functions with optional parameters
- Destructure options at the start of the function for clarity
- Provide sensible defaults using destructuring
- Keep related options grouped (e.g., all shipping options together)
- Consider breaking very large options objects into nested groups

**When positional parameters are acceptable:**

- Single-parameter pure functions
- Well-established functional patterns (map, filter, reduce callbacks)
- Mathematical operations where order is conventional

## Example Patterns

### Error Handling

Use Result types or early returns:

```typescript
// Good - Result type pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const processPayment = (
  payment: Payment
): Result<ProcessedPayment, PaymentError> => {
  if (!isValidPayment(payment)) {
    return { success: false, error: new PaymentError("Invalid payment") };
  }

  if (!hasSufficientFunds(payment)) {
    return { success: false, error: new PaymentError("Insufficient funds") };
  }

  return { success: true, data: executePayment(payment) };
};

// Also good - early returns with exceptions
const processPayment = (payment: Payment): ProcessedPayment => {
  if (!isValidPayment(payment)) {
    throw new PaymentError("Invalid payment");
  }

  if (!hasSufficientFunds(payment)) {
    throw new PaymentError("Insufficient funds");
  }

  return executePayment(payment);
};
```

## Development Guidelines

- **MAKE SURE you are not adding stupid comments. Code should be self explanatory.**

### Development Memory

- Stop making stupid code comments. ONLY add code comments when some code is NOT self explanatory. Code should be readable by itself without adding comments that don't add any value.
