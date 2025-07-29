import { index, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";
import { providerProfilesTable } from "./provider-schema";
import { clientProfilesTable } from "./client-schema";
import { bookingsTable } from "./booking-schema";
import { reviewsTable } from "./review-schema";
import { paymentTransactionsTable } from "./payment-schema";

// =============================================================================
// USERS TABLE INDEXES
// =============================================================================

// Authentication and lookup indexes
export const usersEmailIndex = index("idx_users_email").on(usersTable.email);
export const usersClerkUserIdIndex = index("idx_users_clerk_user_id").on(usersTable.clerkUserID);
export const usersReferralCodeIndex = index("idx_users_referral_code").on(usersTable.referralCode);

// Query optimization indexes
export const usersAccountStatusIndex = index("idx_users_account_status").on(usersTable.accountStatus);
export const usersRolesIndex = index("idx_users_roles").on(usersTable.roles);
export const usersReferredByIndex = index("idx_users_referred_by").on(usersTable.referredBy);

// =============================================================================
// PROVIDER PROFILES TABLE INDEXES
// =============================================================================

// Core lookup indexes
export const providerUserIdIndex = unique("idx_provider_user_id").on(providerProfilesTable.userId);
export const providerOnboardedIndex = index("idx_provider_onboarded").on(providerProfilesTable.isOnboarded);

// Search and filtering indexes
export const providerRatingIndex = index("idx_provider_avg_rating").on(providerProfilesTable.averageRating);
export const providerHourlyRateIndex = index("idx_provider_hourly_rate").on(providerProfilesTable.hourlyRate);
export const providerCategoriesIndex = index("idx_provider_categories").on(providerProfilesTable.categories);
export const providerYearsExperienceIndex = index("idx_provider_years_experience").on(providerProfilesTable.yearsOfExperience);

// Verification status indexes
export const providerBackgroundCheckIndex = index("idx_provider_background_check").on(providerProfilesTable.backgroundCheckStatus);
export const providerIdVerificationIndex = index("idx_provider_id_verification").on(providerProfilesTable.idVerificationStatus);

// Composite indexes for common search patterns
export const providerSearchIndex = index("idx_provider_search")
  .on(providerProfilesTable.isOnboarded, providerProfilesTable.averageRating, providerProfilesTable.hourlyRate);

// =============================================================================
// CLIENT PROFILES TABLE INDEXES
// =============================================================================

// Core lookup index
export const clientUserIdIndex = unique("idx_client_user_id").on(clientProfilesTable.userId);

// Preference indexes for matching
export const clientPreferredCategoriesIndex = index("idx_client_preferred_categories").on(clientProfilesTable.preferredServiceCategories);
export const clientPreferredProvidersIndex = index("idx_client_preferred_providers").on(clientProfilesTable.preferredProviders);
export const clientBlockedProvidersIndex = index("idx_client_blocked_providers").on(clientProfilesTable.blockedProviders);

// =============================================================================
// BOOKINGS TABLE INDEXES
// =============================================================================

// Foreign key indexes (critical for joins)
export const bookingClientIdIndex = index("idx_booking_client_id").on(bookingsTable.clientId);
export const bookingProviderIdIndex = index("idx_booking_provider_id").on(bookingsTable.providerId);

// Status and lifecycle indexes
export const bookingStatusIndex = index("idx_booking_status").on(bookingsTable.status);
export const bookingServiceDateIndex = index("idx_booking_service_date").on(bookingsTable.serviceDate);
export const bookingCreatedAtIndex = index("idx_booking_created_at").on(bookingsTable.createdAt);

// Payment status index
export const bookingPaymentStatusIndex = index("idx_booking_payment_status").on(bookingsTable.paymentStatus);

// Composite indexes for dashboard queries
export const bookingClientDashboardIndex = index("idx_booking_client_dashboard")
  .on(bookingsTable.clientId, bookingsTable.status, bookingsTable.serviceDate);

export const bookingProviderDashboardIndex = index("idx_booking_provider_dashboard")
  .on(bookingsTable.providerId, bookingsTable.status, bookingsTable.serviceDate);

// Service category index for analytics
export const bookingServiceCategoryIndex = index("idx_booking_service_category").on(bookingsTable.serviceCategory);

// =============================================================================
// REVIEWS TABLE INDEXES
// =============================================================================

// Foreign key indexes
export const reviewBookingIdIndex = unique("idx_review_booking_id").on(reviewsTable.bookingId); // One review per booking
export const reviewClientIdIndex = index("idx_review_client_id").on(reviewsTable.clientId);
export const reviewProviderIdIndex = index("idx_review_provider_id").on(reviewsTable.providerId);

// Content and status indexes
export const reviewRatingIndex = index("idx_review_rating").on(reviewsTable.rating);
export const reviewStatusIndex = index("idx_review_status").on(reviewsTable.status);
export const reviewCreatedAtIndex = index("idx_review_created_at").on(reviewsTable.createdAt);

// Composite index for provider review listings
export const reviewProviderListingIndex = index("idx_review_provider_listing")
  .on(reviewsTable.providerId, reviewsTable.status, reviewsTable.createdAt);

// =============================================================================
// PAYMENT TRANSACTIONS TABLE INDEXES
// =============================================================================

// Foreign key index
export const paymentBookingIdIndex = index("idx_payment_booking_id").on(paymentTransactionsTable.bookingId);

// Stripe integration indexes
export const paymentStripeIntentIndex = index("idx_payment_stripe_intent").on(paymentTransactionsTable.stripePaymentIntentId);
export const paymentStripeChargeIndex = index("idx_payment_stripe_charge").on(paymentTransactionsTable.stripeChargeId);

// Status and type indexes
export const paymentStatusIndex = index("idx_payment_status").on(paymentTransactionsTable.status);
export const paymentTypeIndex = index("idx_payment_type").on(paymentTransactionsTable.type);
export const paymentCreatedAtIndex = index("idx_payment_created_at").on(paymentTransactionsTable.createdAt);

// Composite index for transaction history
export const paymentHistoryIndex = index("idx_payment_history")
  .on(paymentTransactionsTable.status, paymentTransactionsTable.type, paymentTransactionsTable.createdAt);

// =============================================================================
// ADDITIONAL CONSTRAINTS (Beyond Foreign Keys)
// =============================================================================

// Note: These would be added via migrations as they require specific constraint syntax
/*
ALTER TABLE users ADD CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT chk_users_phone_format CHECK (phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_hourly_rate_range CHECK (hourly_rate >= 2500 AND hourly_rate <= 25000);
ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_avg_rating_range CHECK (average_rating >= 0 AND average_rating <= 5);
ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_years_experience CHECK (years_of_experience >= 0 AND years_of_experience <= 50);

ALTER TABLE reviews ADD CONSTRAINT chk_review_rating_range CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE reviews ADD CONSTRAINT chk_review_comment_length CHECK (char_length(comment) >= 10);

ALTER TABLE payment_transactions ADD CONSTRAINT chk_payment_amount_positive CHECK (amount > 0);

-- Self-referential foreign key for users.referredBy (couldn't be added in schema due to TypeScript circular reference)
ALTER TABLE users ADD CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by) REFERENCES users(id);
*/