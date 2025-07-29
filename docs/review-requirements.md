# Review Requirements

## For client feedback and ratings of providers after completed bookings

## Core Review Information

### Identity & References

- `reviewID` - Unique identifier for the review
- `bookingID` - Reference to the completed booking
- `clientID` - Reference to the client who left the review
- `providerID` - Reference to the provider being reviewed

## Review Content

### Rating & Feedback

- `rating` - Numeric rating on 1-5 scale
- `comment` - Written review text (minimum 10 characters)
- `isVerified` - Boolean indicating review is from actual completed booking

## Review Lifecycle

### Status & Timing

- `createdAt` - When review was submitted
- `updatedAt` - If review was edited (optional feature)
- `status` - Enum: ["active", "flagged", "removed"]

## Optional Enhancement Fields

### Review Categories _(Future consideration)_

- `categoryRatings` - Object with specific ratings
  - `communication` - Rating for provider communication
  - `punctuality` - Rating for timeliness
  - `quality` - Rating for work quality
  - `professionalism` - Rating for professional behavior

### Moderation

- `flaggedReason` - Reason if review was flagged
- `moderatedBy` - Admin who reviewed flagged content
- `moderatedAt` - When moderation action was taken
