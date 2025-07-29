import { index, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";
import { providerProfilesTable } from "./provider-schema";
import { clientProfilesTable } from "./client-schema";
import { bookingsTable } from "./booking-schema";
import { reviewsTable } from "./review-schema";
import { paymentTransactionsTable } from "./payment-schema";
import { categoriesTable, providerCategoriesTable, clientPreferredCategoriesTable } from "./category-schema";
import { addressesTable, userAddressesTable, bookingAddressesTable } from "./address-schema";

// =============================================================================
// USERS TABLE INDEXES
// =============================================================================

// Authentication and lookup indexes
export const usersEmailIndex = index("idx_users_email").on(usersTable.email);
export const usersClerkUserIdIndex = index("idx_users_clerk_user_id").on(usersTable.clerkUserID);
export const usersReferralCodeIndex = index("idx_users_referral_code").on(usersTable.referralCode);

// Query optimization indexes
export const usersAccountStatusIndex = index("idx_users_account_status").on(usersTable.accountStatus);
export const usersRolesGinIndex = index("idx_users_roles_gin").using("gin", usersTable.roles);
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
export const providerYearsExperienceIndex = index("idx_provider_years_experience").on(providerProfilesTable.yearsOfExperience);

// Verification status indexes
export const providerBackgroundCheckIndex = index("idx_provider_background_check").on(providerProfilesTable.backgroundCheckStatus);
export const providerIdVerificationIndex = index("idx_provider_id_verification").on(providerProfilesTable.idVerificationStatus);

// Array field GIN indexes for provider searching
export const providerLanguagesGinIndex = index("idx_provider_languages_gin").using("gin", providerProfilesTable.languages);
export const providerCertificationsGinIndex = index("idx_provider_certifications_gin").using("gin", providerProfilesTable.certifications);

// Composite indexes for common search patterns
export const providerSearchIndex = index("idx_provider_search")
  .on(providerProfilesTable.isOnboarded, providerProfilesTable.averageRating, providerProfilesTable.hourlyRate);

// =============================================================================
// CLIENT PROFILES TABLE INDEXES
// =============================================================================

// Core lookup index
export const clientUserIdIndex = unique("idx_client_user_id").on(clientProfilesTable.userId);

// Preference indexes for matching (GIN for array operations)
export const clientPreferredProvidersGinIndex = index("idx_client_preferred_providers_gin").using("gin", clientProfilesTable.preferredProviders);
export const clientBlockedProvidersGinIndex = index("idx_client_blocked_providers_gin").using("gin", clientProfilesTable.blockedProviders);

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
export const bookingServiceCategoryIndex = index("idx_booking_service_category").on(bookingsTable.serviceCategoryId);

// Array field GIN indexes for booking features
export const bookingAccessibilityNeedsGinIndex = index("idx_booking_accessibility_needs_gin").using("gin", bookingsTable.accessibilityNeeds);

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
// CATEGORIES SYSTEM INDEXES
// =============================================================================

// Categories table indexes
export const categoriesSlugIndex = unique("idx_categories_slug").on(categoriesTable.slug);
export const categoriesNameIndex = unique("idx_categories_name").on(categoriesTable.name);
export const categoriesActiveIndex = index("idx_categories_active").on(categoriesTable.isActive);
export const categoriesPrimaryIndex = index("idx_categories_primary").on(categoriesTable.isPrimary);
export const categoriesSortOrderIndex = index("idx_categories_sort_order").on(categoriesTable.sortOrder);

// Provider categories junction table indexes
export const providerCategoriesProviderIndex = index("idx_provider_categories_provider").on(providerCategoriesTable.providerId);
export const providerCategoriesCategoryIndex = index("idx_provider_categories_category").on(providerCategoriesTable.categoryId);
export const providerCategoriesPrimaryIndex = index("idx_provider_categories_primary").on(providerCategoriesTable.providerId, providerCategoriesTable.isPrimary);
export const providerCategoriesCompositeIndex = index("idx_provider_categories_composite").on(providerCategoriesTable.providerId, providerCategoriesTable.categoryId);

// Client preferred categories junction table indexes
export const clientPreferredCategoriesClientIndex = index("idx_client_preferred_categories_client").on(clientPreferredCategoriesTable.clientId);
export const clientPreferredCategoriesCategoryIndex = index("idx_client_preferred_categories_category").on(clientPreferredCategoriesTable.categoryId);
export const clientPreferredCategoriesPriorityIndex = index("idx_client_preferred_categories_priority").on(clientPreferredCategoriesTable.clientId, clientPreferredCategoriesTable.priority);
export const clientPreferredCategoriesCompositeIndex = index("idx_client_preferred_categories_composite").on(clientPreferredCategoriesTable.clientId, clientPreferredCategoriesTable.categoryId);

// =============================================================================
// ADDRESS SYSTEM INDEXES
// =============================================================================

// Geographic indexes for location-based queries
export const addressGeocodeIndex = index("idx_address_geocode").on(addressesTable.latitude, addressesTable.longitude);
export const addressLatitudeIndex = index("idx_address_latitude").on(addressesTable.latitude);
export const addressLongitudeIndex = index("idx_address_longitude").on(addressesTable.longitude);

// Address validation and lookup indexes
export const addressTypeIndex = index("idx_address_type").on(addressesTable.type);
export const addressCityStateIndex = index("idx_address_city_state").on(addressesTable.city, addressesTable.state);
export const addressPostalCodeIndex = index("idx_address_postal_code").on(addressesTable.postalCode);
export const addressVerificationIndex = index("idx_address_verification").on(addressesTable.isVerified, addressesTable.isDeliverable);

// User address junction table indexes
export const userAddressPrimaryIndex = index("idx_user_address_primary").on(userAddressesTable.userId, userAddressesTable.isPrimary);
export const userAddressLookupIndex = index("idx_user_address_lookup").on(userAddressesTable.userId, userAddressesTable.addressId);

// Booking address junction table indexes
export const bookingAddressRoleIndex = index("idx_booking_address_role").on(bookingAddressesTable.bookingId, bookingAddressesTable.role);
export const bookingAddressLookupIndex = index("idx_booking_address_lookup").on(bookingAddressesTable.bookingId, bookingAddressesTable.addressId);

// =============================================================================
// ENHANCED BOOKING INDEXES FOR COMPLEX QUERIES
// =============================================================================

// Date range queries with status filtering
export const bookingDateStatusIndex = index("idx_booking_date_status").on(bookingsTable.serviceDate, bookingsTable.status);
export const bookingStatusDateRangeIndex = index("idx_booking_status_date_range").on(bookingsTable.status, bookingsTable.serviceDate, bookingsTable.createdAt);

// Service category filtering with other criteria
export const bookingCategoryStatusIndex = index("idx_booking_category_status").on(bookingsTable.serviceCategoryId, bookingsTable.status);
export const bookingCategoryDateIndex = index("idx_booking_category_date").on(bookingsTable.serviceCategoryId, bookingsTable.serviceDate);

// Provider availability and scheduling optimization
export const bookingProviderDateStatusIndex = index("idx_booking_provider_date_status").on(bookingsTable.providerId, bookingsTable.serviceDate, bookingsTable.status);
export const bookingClientDateStatusIndex = index("idx_booking_client_date_status").on(bookingsTable.clientId, bookingsTable.serviceDate, bookingsTable.status);

// Geographic proximity composite indexes (for use with address joins)
export const bookingProviderServiceAreaIndex = index("idx_booking_provider_service_area").on(bookingsTable.providerId, bookingsTable.serviceArea);

// =============================================================================
// ADDITIONAL CONSTRAINTS (Beyond Foreign Keys)
// =============================================================================

// Note: Check constraints are now implemented directly in schema files using Drizzle's check() function:
// - User phone number validation (E.164 format: +1234567890)
// - User email format validation (standard email regex)
// - Provider hourly rate validation (2500-25000 cents = $25-$250)
// - Review rating validation (1-5 scale)
// - Review comment length validation (minimum 10 characters)
// - Payment amount validation (positive amounts only)
// - Booking price validation (positive amounts only)
// - Self-referential foreign key handled via Drizzle relations