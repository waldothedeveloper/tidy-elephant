# Provider Requirements

_The following properties and functionality will be available ONLY to users with the "provider" role in their roles array._

## Provider Profile & Business

- `bio` - About me section describing experience, skills, and approach (50-1000 characters)
- `isOnboarded` - Boolean indicating if provider has completed onboarding process
- `workPhotos` - Array of URLs showcasing previous work/portfolio images
- `backgroundCheckStatus` - Enum: ["not_required", "pending", "approved", "rejected"]
- `backgroundCheckCompletedAt` - Timestamp when background check was successfully completed
- `idVerificationStatus` - Enum: ["not_required", "pending", "approved", "rejected", "expired"]
- `idVerificationCompletedAt` - Timestamp when ID verification was successfully completed

## Service Categories

- `categories` - Array of service categories offered (at least one required if provided)

## Pricing

- `hourlyRate` - Hourly rate in cents (min: $25.00, max: $250.00)
- `cancellationPolicy` - Enum: ["flexible", "moderate", "strict"]
- `offersFreeConsultation` - Boolean for initial consultation offerings

## Professional Information

- `certifications` - Array of professional certifications
- `yearsOfExperience` - Number of years of experience (integer)
- `languages` - Array of languages spoken
- `insuranceVerified` - Boolean indicating liability insurance verification

## Availability & Scheduling

- `availability` - Object containing schedule information (placeholder for expansion)

## Ratings & Reviews

### Provider Ratings

- `averageRating` - Calculated average rating (0-5 scale)
- `totalReviews` - Total number of reviews received
- `ratingBreakdown` - Object containing count of 1-5 star ratings
  - `oneStar` - Count of 1-star reviews
  - `twoStar` - Count of 2-star reviews
  - `threeStar` - Count of 3-star reviews
  - `fourStar` - Count of 4-star reviews
  - `fiveStar` - Count of 5-star reviews
