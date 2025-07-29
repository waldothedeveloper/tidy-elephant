# Database Schema Relationships

## Overview

This document provides a comprehensive overview of the database schema relationships for the professional organizer marketplace application. The schema consists of 6 core tables with various relationship types and cardinalities.

## Entity Relationship Diagram (ASCII)

```text
                            ┌─────────────────┐
                            │      USERS      │
                            │    (Central)    │
                            │─────────────────│
                            │ • id (PK)       │
                            │ • firstname     │
                            │ • lastname      │
                            │ • email (UNIQUE)│
                            │ • clerkUserID   │
                            │ • roles[]       │
                            │ • referredBy ─┐ │
                            └─────┬───────┬─┘ │
                                  │       │   │
                      ┌───────────┘       │   │ (Self-Reference)
                      │                   │   │
              ┌───────▼─────────┐ ┌───────▼──▼────────┐
              │ PROVIDER_PROFILES│ │  CLIENT_PROFILES  │
              │   (1:1 Users)    │ │   (1:1 Users)     │
              │──────────────────│ │───────────────────│
              │ • id (PK)        │ │ • id (PK)         │
              │ • userId (FK)    │ │ • userId (FK)     │
              │ • bio            │ │ • preferredProviders[] │
              │ • hourlyRate     │ │ • blockedProviders[]   │
              │ • averageRating  │ │ • timePreferences      │
              │ • totalReviews   │ │                   │
              └─────┬────────────┘ └─────────┬─────────────┘
                    │                           │
                    │ (Provider data feeds      │ (Client preferences
                    │  into bookings)           │  influence bookings)
            ┌───────▼───────────────────────────▼─────────┐
            │                BOOKINGS                    │
            │          (Many-to-Many Bridge)             │
            │────────────────────────────────────────────│
            │ • id (PK)                                  │
            │ • clientId (FK → users.id)                 │
            │ • providerId (FK → users.id)               │
            │ • status                                   │
            │ • serviceDate                              │
            │ • serviceAddress                           │
            │ • hourlyRate                               │
            │ • totalPrice                               │
            └──────────┬─────────────────────┬────────────────┘
                       │                     │
                       │ (1:1)               │ (1:Many)
                       │                     │
          ┌────────────▼──────────┐ ┌───────▼──────────────┐
          │        REVIEWS        │ │  PAYMENT_TRANSACTIONS │
          │    (1:1 Bookings)     │ │   (1:Many Bookings)   │
          │───────────────────────│ │───────────────────────│
          │ • id (PK)             │ │ • id (PK)             │
          │ • bookingId (FK) UNQ  │ │ • bookingId (FK)      │
          │ • clientId (FK)       │ │ • stripePaymentIntentId│
          │ • providerId (FK)     │ │ • stripeChargeId      │
          │ • rating (1-5)        │ │ • amount (cents)      │
          │ • comment             │ │ • type (payment/refund)│
          │ • status              │ │ • status (pending/succeeded)│
          │ • categoryRatings     │ │ • createdAt           │
          └──────────┬────────────┘ └───────────────────────┘
                     │                           
                     │ (Reviews update provider           
                     │  ratings via triggers)             
                     │                                    
              ┌──────▼──────────────────────────────────┐
              │         FEEDBACK LOOP                   │
              │─────────────────────────────────────────│
              │ Reviews → Provider averageRating        │
              │ Reviews → Provider totalReviews         │  
              │ Reviews → Provider ratingBreakdown      │
              │ Payments → Booking paymentStatus        │
              └─────────────────────────────────────────┘
```

## Detailed Relationship Analysis

### 1. Users Table (Central Hub)

**Role**: Central entity that all other tables reference
**Relationships**:

- **Self-Reference**: `referredBy` → `users.id` (Who referred this user)
- **1:1** with Provider Profiles (optional)
- **1:1** with Client Profiles (optional)
- **1:Many** with Bookings (as client)
- **1:Many** with Bookings (as provider)
- **1:Many** with Reviews (as client who wrote review)
- **1:Many** with Reviews (as provider being reviewed)

### 2. Provider Profiles → Users (1:1)

```sql
provider_profiles.userId → users.id (CASCADE DELETE)
```

**Relationship Type**: One-to-One (Optional)
**Business Logic**:

- A user can have at most one provider profile
- Provider profile cannot exist without a user
- When user is deleted, provider profile is automatically deleted

**Key Fields**:

- `averageRating`: Calculated from reviews
- `totalReviews`: Count of reviews received
- `categories[]`: Array of service categories offered

### 3. Client Profiles → Users (1:1)

```sql
client_profiles.userId → users.id (CASCADE DELETE)
```

**Relationship Type**: One-to-One (Optional)
**Business Logic**:

- A user can have at most one client profile
- Client profile cannot exist without a user
- Stores client preferences and booking history

**Key Fields**:

- `preferredProviders[]`: Array of provider UUIDs (conceptual FK)
- `blockedProviders[]`: Array of provider UUIDs (conceptual FK)
- `timePreferences`: JSON object with scheduling preferences

### 4. Bookings → Users (Many-to-One, Twice)

```sql
bookings.clientId → users.id (CASCADE DELETE)
bookings.providerId → users.id (CASCADE DELETE)
```

**Relationship Type**: Many-to-Many Bridge Table
**Business Logic**:

- Connects clients with providers through booking transactions
- A user can have multiple bookings as a client
- A user can have multiple bookings as a provider
- Booking cannot exist without both client and provider

**Key Fields**:

- `status`: Booking lifecycle state
- `serviceDate`: When service is scheduled
- `hourlyRate`: Rate agreed for this specific booking
- `totalPrice`: Final calculated amount

### 5. Reviews → Bookings (1:1) + Users (Many-to-One, Twice)

```sql
reviews.bookingId → bookings.id (CASCADE DELETE, UNIQUE)
reviews.clientId → users.id (CASCADE DELETE)
reviews.providerId → users.id (CASCADE DELETE)
```

**Relationship Type**:

- **1:1** with Bookings (one review per booking)
- **Many-to-1** with Users (clients can write many reviews)
- **Many-to-1** with Users (providers can receive many reviews)

**Business Logic**:

- Each completed booking can have exactly one review
- Reviews update provider's `averageRating` and `totalReviews`
- Reviews cannot exist without the original booking

### 6. Payment Transactions → Bookings (Many-to-One)

```sql
payment_transactions.bookingId → bookings.id (CASCADE DELETE)
```

**Relationship Type**: Many-to-One
**Business Logic**:

- Each booking can have multiple payment transactions (payment, refund, chargeback)
- Payment transactions track Stripe integration
- Transactions cannot exist without a booking

## Relationship Cardinalities Summary

| Relationship                 | Cardinality | Constraint         | Business Rule                        |
| ---------------------------- | ----------- | ------------------ | ------------------------------------ |
| Users ↔ Provider Profiles   | 1:0..1      | `userId UNIQUE`    | Optional provider profile per user   |
| Users ↔ Client Profiles     | 1:0..1      | `userId UNIQUE`    | Optional client profile per user     |
| Users ↔ Bookings (Client)   | 1:Many      | `clientId FK`      | User can book multiple services      |
| Users ↔ Bookings (Provider) | 1:Many      | `providerId FK`    | Provider can have multiple bookings  |
| Bookings ↔ Reviews          | 1:0..1      | `bookingId UNIQUE` | One review per completed booking     |
| Bookings ↔ Payments         | 1:Many      | `bookingId FK`     | Multiple payment events per booking  |
| Users ↔ Users (Referrals)   | 1:0..1      | `referredBy FK`    | Self-referencing for referral system |

## Data Flow Patterns

### 1. User Registration & Onboarding

```text
1. User signs up → users table
2. User chooses role → provider_profiles OR client_profiles
3. Complete onboarding → profile fields populated
```

### 2. Booking Lifecycle

```text
1. Client searches → provider_profiles filtered by criteria
2. Client books → bookings table (status: pending)
3. Provider accepts → bookings.status = confirmed
4. Service completed → bookings.status = completed
5. Client reviews → reviews table + provider stats updated
6. Payment processed → payment_transactions table
```

### 3. Provider Rating Calculation

```text
1. New review created → reviews table
2. Trigger calculation → provider_profiles.averageRating updated
3. Count updated → provider_profiles.totalReviews incremented
4. Rating breakdown → provider_profiles.ratingBreakdown updated
```

## Referential Integrity Rules

### Cascade Deletes

- **User deleted** → Provider/Client profiles deleted
- **User deleted** → Bookings deleted → Reviews & Payments deleted
- **Booking deleted** → Reviews & Payment transactions deleted

### Constraint Validations

- **Email uniqueness**: Enforced at users level
- **One review per booking**: Unique constraint on `reviews.bookingId`
- **Profile uniqueness**: One provider/client profile per user
- **Self-referral prevention**: Business logic prevents users from referring themselves

## Conceptual Relationships (Array Fields)

### Arrays as Pseudo-Foreign Keys

Several fields store arrays of UUIDs that conceptually reference other tables:

```sql
-- Client preferences (conceptual FKs)
client_profiles.preferredProviders[] → provider_profiles.id[]
client_profiles.blockedProviders[] → provider_profiles.id[]

-- Provider categories (future FK when categories table created)
provider_profiles.categories[] → categories.id[] (future)
client_profiles.preferredServiceCategories[] → categories.id[] (future)
```

**Note**: These are stored as UUID arrays for flexibility, but application-level validation ensures referential integrity.

## Performance Optimization

### Join Patterns

Most common queries involve these join patterns:

```sql
-- Provider search with user info
users ⟕ provider_profiles

-- Booking details with participants
bookings ⟕ users (client) ⟕ users (provider)

-- Provider profile with reviews
provider_profiles ⟕ reviews ⟕ users (client info)

-- Booking history for dashboard
users ⟕ bookings ⟕ payment_transactions
```

All foreign key relationships have corresponding indexes to optimize these joins.

## Business Logic Relationships

### Role-Based Access

- Users with role "provider" can access provider-specific features
- Users with role "client" can create bookings
- Users can have both roles simultaneously

### Data Consistency Rules

1. **Booking integrity**: Both client and provider must exist as users
2. **Review eligibility**: Only completed bookings can be reviewed
3. **Payment tracking**: Every booking must have at least one payment transaction
4. **Profile completeness**: Provider profiles must be complete before accepting bookings

This schema design ensures data integrity while providing flexibility for the marketplace's complex business relationships.
