# Booking Requirements

## A separate schema for managing individual booking transactions between clients and providers

## Core Booking Information

### Identity & References

- `bookingID` - Unique identifier for the booking
- `clientID` - Reference to the client who made the booking
- `providerID` - Reference to the provider being booked
- `status` - Enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "refunded"]

### Service Details

- `serviceCategory` - Type of organizing service being booked
- `serviceDescription` - Detailed description of work requested

## Scheduling Information

### Date & Time Management

- `serviceDate` - Date when service will be performed
- `timezone` - Timezone for the booking

### Booking Lifecycle

- `createdAt` - When booking request was created
- `updatedAt` - Last modification timestamp
- `completedAt` - When service was marked complete
- `cancelledAt` - When booking was cancelled (if applicable)

## Location & Access

### Service Location

- `serviceAddress` - Full address where service will be performed
- `serviceArea` - Specific area/room (e.g., "master bedroom", "kitchen", "garage")
- `accessInstructions` - How provider should access the property
- `parkingInformation` - Parking details for the provider

## Pricing & Payment

### Financial Details

- `hourlyRate` - Rate agreed upon for this booking (in cents)
- `totalPrice` - Final amount charged
- `paymentStatus` - Enum: ["pending", "authorized", "captured", "refunded"]
- `paymentMethodID` - Reference to payment method used

## Communication & Notes

### Booking Communication

- `clientNotes` - Special requests or information from client
- `providerNotes` - Notes from provider about the booking
- `internalNotes` - System notes for customer service
- `cancellationReason` - Reason if booking was cancelled

## Additional Considerations

### Contract/Property Details

- `hasChildren` - Boolean (affects organizing approach/safety)
- `hasPets` - Boolean (provider allergies, approach considerations)
- `homeType` - Enum: ["apartment", "house", "condo", "office"]
- `accessibilityNeeds` - Array of special requirements
- `emergencyContact` - Object with emergency contact info

### Quality & Follow-up

- `photosBeforeService` - Array of URLs (optional before photos)
- `photosAfterService` - Array of URLs (optional after photos)
- `followUpRequired` - Boolean indicating if follow-up is needed
- `followUpDate` - Scheduled follow-up date

### Business Logic

- `remindersSent` - Array of reminder notifications sent
- `reviewEligible` - Boolean (can client/provider leave reviews)

NOTES:
Design rationale for referencing usersTable instead of profile tables:

- A booking should remain valid even if someone deletes their client/provider profile
- The core relationship is between users, not profiles
- Profile tables are supplementary data, users table contains the essential identity
- This prevents orphaned bookings if profiles are deleted but users remain

  This is the correct approach for referential integrity in this booking system.
