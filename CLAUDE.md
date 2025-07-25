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
- **React 19** with React Hook Form and Zod validation

### Styling Rules

Always use ShadCN/UI and TailwindCSS v4 and above.
Do NOT use tailwindcss utility classes such e.g. "h-4 w-4", these height and width sizes can be set easily like this e.g. "size-4" , "size-12" and so on.

### Authentication & User Management

- **Clerk** for authentication with custom onboarding flows
- **Middleware** (`src/middleware.tsx`) enforces role-based access control:
  - Public routes: home, sign-in, waitlist, become-an-ease-specialist
  - Provider routes: `/provider/*` (requires completed onboarding)
  - Onboarding routes: `/onboarding/*` (providers only, except welcome page)

### Database & Storage

- **Firebase Firestore** for data persistence
- **Firebase Storage** for file uploads
- **Firebase Auth** integration with Clerk for dual authentication
- **Upstash Redis** with rate limiting

### External Services

- **Twilio** for SMS verification (lookup, send, verify)
- **Resend** for email services
- **Vercel Analytics** and Speed Insights

## Key Architecture Patterns

### Data Access Layer (DAL)

All database operations go through `src/lib/dal/index.ts` which:

- Enforces authentication for all operations
- Provides separate `enforceAuth()` and `enforceAuthProvider()` functions
- Handles Twilio integration with comprehensive error handling
- Uses React `cache()` for server-side caching

### Authentication Flow

1. Users sign up via Clerk
2. Provider onboarding sets `privateMetadata.isAProvider = true`
3. Middleware routes users based on authentication state and provider status
4. Firebase maintains parallel user records for additional data

### Form Validation

Centralized schemas in `src/lib/schemas/index.ts`:

- `userProfileSchema` - Basic profile information
- `userProfilePhoneVerificationSchema` - Phone number validation
- `userProfileCodeVerificationSchema` - SMS code verification
- `e164PhoneNumberSchema` - E.164 phone format validation
- `userCategoriesSchema` - Service category selection

### Server Actions

Located in `src/app/actions/` with subdirectories for feature areas:

- Onboarding actions handle provider registration flow
- All actions use DAL functions for data access
- Rate limiting applied where appropriate

**MANDATORY SERVER ACTION SECURITY RULES:**

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
11. **USE ENVIRONMENT VARIABLES** - Never hardcode sensitive data

**Important**: Always ask user if server action should be rate limited before implementing. Use helper functions from `src/types/api-responses.ts` for consistent response types.

### UI Components

- Custom components in `src/components/ui/` following Radix UI patterns
- Shadcn/ui component library integration
- Motion animations with Framer Motion
- Toast notifications via Sonner

## Firebase Configuration

### Emulators (for development)

- **Auth**: Port 9099
- **Firestore**: Port 8080
- **Storage**: Port 9199
- **UI**: Enabled for local development

### Collections Structure

- `Users` - Provider profiles with nested data structure
- `Provider_Categories` - Available service categories

## Environment Variables Required

### Clerk

- Clerk authentication keys

### Firebase

- `NEXT_PUBLIC_FIREBASE_*` variables for client-side config
- Server-side Firebase service account credentials

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

Completion sets `privateMetadata.onboardingComplete = true` allowing provider dashboard access.
