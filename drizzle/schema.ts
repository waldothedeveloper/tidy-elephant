import { pgTable, index, foreignKey, uuid, boolean, varchar, timestamp, unique, check, text, integer, json, numeric, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const accountStatus = pgEnum("account_status", ['active', 'inactive', 'suspended', 'pending_verification'])
export const addressType = pgEnum("address_type", ['home', 'work', 'service_location', 'billing', 'other'])
export const backgroundCheckStatus = pgEnum("background_check_status", ['not_required', 'pending', 'approved', 'rejected'])
export const bookingStatus = pgEnum("booking_status", ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'])
export const businessType = pgEnum("business_type", ['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corporation', 'other'])
export const cancellationPolicy = pgEnum("cancellation_policy", ['flexible', 'moderate', 'strict'])
export const country = pgEnum("country", ['US'])
export const homeType = pgEnum("home_type", ['apartment', 'house', 'condo', 'office'])
export const idVerificationStatus = pgEnum("id_verification_status", ['not_required', 'pending', 'approved', 'rejected', 'expired'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'authorized', 'captured', 'refunded'])
export const paymentTransactionStatus = pgEnum("payment_transaction_status", ['pending', 'succeeded', 'failed', 'canceled'])
export const paymentType = pgEnum("payment_type", ['payment', 'refund', 'chargeback'])
export const phoneLineType = pgEnum("phone_line_type", ['landline', 'mobile', 'fixedVoip', 'nonFixedVoip', 'personal', 'tollFree', 'premium', 'sharedCost', 'uan', 'voicemail', 'pager', 'unknown'])
export const preferredContactMethod = pgEnum("preferred_contact_method", ['email', 'phone', 'app_messaging'])
export const reviewStatus = pgEnum("review_status", ['active', 'flagged', 'removed'])
export const userRole = pgEnum("user_role", ['client', 'provider'])


export const userAddresses = pgTable("user_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	addressId: uuid("address_id").notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	label: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_address_lookup").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.addressId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_address_primary").using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isPrimary.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_addresses_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addresses.id],
			name: "user_addresses_address_id_addresses_id_fk"
		}).onDelete("cascade"),
]);

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	providerId: uuid("provider_id").notNull(),
	status: bookingStatus().default('pending').notNull(),
	serviceCategoryId: uuid("service_category_id"),
	serviceDescription: text("service_description"),
	serviceDate: timestamp("service_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: 'string' }),
	serviceArea: varchar("service_area", { length: 100 }),
	hourlyRate: integer("hourly_rate").notNull(),
	totalPrice: integer("total_price"),
	paymentStatus: paymentStatus("payment_status").default('pending').notNull(),
	paymentMethodId: varchar("payment_method_id", { length: 100 }),
	clientNotes: text("client_notes"),
	providerNotes: text("provider_notes"),
	internalNotes: text("internal_notes"),
	cancellationReason: text("cancellation_reason"),
	hasChildren: boolean("has_children").default(false).notNull(),
	hasPets: boolean("has_pets").default(false).notNull(),
	homeType: homeType("home_type"),
	accessibilityNeeds: text("accessibility_needs").array().default([""]),
	emergencyContact: json("emergency_contact"),
	photosBeforeService: text("photos_before_service").array().default([""]),
	photosAfterService: text("photos_after_service").array().default([""]),
	followUpRequired: boolean("follow_up_required").default(false).notNull(),
	followUpDate: timestamp("follow_up_date", { withTimezone: true, mode: 'string' }),
	remindersSent: json("reminders_sent").default([]),
	reviewEligible: boolean("review_eligible").default(true).notNull(),
}, (table) => [
	index("idx_booking_accessibility_needs_gin").using("gin", table.accessibilityNeeds.asc().nullsLast().op("array_ops")),
	index("idx_booking_category_date").using("btree", table.serviceCategoryId.asc().nullsLast().op("timestamptz_ops"), table.serviceDate.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_category_status").using("btree", table.serviceCategoryId.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_client_dashboard").using("btree", table.clientId.asc().nullsLast().op("timestamptz_ops"), table.status.asc().nullsLast().op("timestamptz_ops"), table.serviceDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_booking_client_date_status").using("btree", table.clientId.asc().nullsLast().op("uuid_ops"), table.serviceDate.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_booking_client_id").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_booking_date_status").using("btree", table.serviceDate.asc().nullsLast().op("timestamptz_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_booking_payment_status").using("btree", table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("idx_booking_provider_dashboard").using("btree", table.providerId.asc().nullsLast().op("timestamptz_ops"), table.status.asc().nullsLast().op("enum_ops"), table.serviceDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_booking_provider_date_status").using("btree", table.providerId.asc().nullsLast().op("enum_ops"), table.serviceDate.asc().nullsLast().op("timestamptz_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_booking_provider_id").using("btree", table.providerId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_provider_service_area").using("btree", table.providerId.asc().nullsLast().op("uuid_ops"), table.serviceArea.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_service_category").using("btree", table.serviceCategoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_service_date").using("btree", table.serviceDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_booking_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_booking_status_date_range").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.serviceDate.asc().nullsLast().op("enum_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [users.id],
			name: "bookings_client_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [users.id],
			name: "bookings_provider_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceCategoryId],
			foreignColumns: [categories.id],
			name: "bookings_service_category_id_categories_id_fk"
		}),
	unique("unique_client_provider_datetime").on(table.clientId, table.providerId, table.serviceDate),
	check("positive_hourly_rate", sql`hourly_rate > 0`),
	check("positive_total_price", sql`(total_price IS NULL) OR (total_price > 0)`),
]);

export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
	addressLine2: varchar("address_line_2", { length: 255 }),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 50 }).notNull(),
	postalCode: varchar("postal_code", { length: 20 }).notNull(),
	country: country().default('US').notNull(),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
	type: addressType().default('home').notNull(),
	label: varchar({ length: 50 }),
	isVerified: boolean("is_verified").default(false).notNull(),
	isDeliverable: boolean("is_deliverable").default(true).notNull(),
	accessInstructions: text("access_instructions"),
	parkingInformation: text("parking_information"),
	buildingInfo: text("building_info"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_address_city_state").using("btree", table.city.asc().nullsLast().op("text_ops"), table.state.asc().nullsLast().op("text_ops")),
	index("idx_address_geocode").using("btree", table.latitude.asc().nullsLast().op("numeric_ops"), table.longitude.asc().nullsLast().op("numeric_ops")),
	index("idx_address_latitude").using("btree", table.latitude.asc().nullsLast().op("numeric_ops")),
	index("idx_address_longitude").using("btree", table.longitude.asc().nullsLast().op("numeric_ops")),
	index("idx_address_postal_code").using("btree", table.postalCode.asc().nullsLast().op("text_ops")),
	index("idx_address_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("idx_address_verification").using("btree", table.isVerified.asc().nullsLast().op("bool_ops"), table.isDeliverable.asc().nullsLast().op("bool_ops")),
]);

export const bookingAddresses = pgTable("booking_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	addressId: uuid("address_id").notNull(),
	role: addressType().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_address_lookup").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops"), table.addressId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_address_role").using("btree", table.bookingId.asc().nullsLast().op("enum_ops"), table.role.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_addresses_booking_id_bookings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addresses.id],
			name: "booking_addresses_address_id_addresses_id_fk"
		}).onDelete("cascade"),
]);

export const clientProfiles = pgTable("client_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	preferredProviders: uuid("preferred_providers").array().default([""]),
	blockedProviders: uuid("blocked_providers").array().default([""]),
	timePreferences: json("time_preferences").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_client_blocked_providers_gin").using("gin", table.blockedProviders.asc().nullsLast().op("array_ops")),
	index("idx_client_preferred_providers_gin").using("gin", table.preferredProviders.asc().nullsLast().op("array_ops")),
	uniqueIndex("idx_client_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "client_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("client_profiles_user_id_unique").on(table.userId),
]);

export const reviews = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	clientId: uuid("client_id").notNull(),
	providerId: uuid("provider_id").notNull(),
	rating: integer().notNull(),
	comment: text().notNull(),
	isVerified: boolean("is_verified").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	status: reviewStatus().default('active').notNull(),
	categoryRatings: json("category_ratings"),
	flaggedReason: varchar("flagged_reason", { length: 200 }),
	moderatedBy: uuid("moderated_by"),
	moderatedAt: timestamp("moderated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("idx_review_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_review_client_id").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("idx_review_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_review_provider_id").using("btree", table.providerId.asc().nullsLast().op("uuid_ops")),
	index("idx_review_provider_listing").using("btree", table.providerId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops"), table.createdAt.asc().nullsLast().op("enum_ops")),
	index("idx_review_rating").using("btree", table.rating.asc().nullsLast().op("int4_ops")),
	index("idx_review_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "reviews_booking_id_bookings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [users.id],
			name: "reviews_client_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [users.id],
			name: "reviews_provider_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moderatedBy],
			foreignColumns: [users.id],
			name: "reviews_moderated_by_users_id_fk"
		}),
	unique("reviews_booking_id_unique").on(table.bookingId),
	check("rating_range", sql`(rating >= 1) AND (rating <= 5)`),
	check("comment_length", sql`length(comment) >= 10`),
]);

export const paymentTransactions = pgTable("payment_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull(),
	stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
	amount: integer().notNull(),
	type: paymentType().default('payment').notNull(),
	status: paymentTransactionStatus().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_payment_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_payment_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_payment_history").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.type.asc().nullsLast().op("enum_ops"), table.createdAt.asc().nullsLast().op("enum_ops")),
	index("idx_payment_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_payment_stripe_charge").using("btree", table.stripeChargeId.asc().nullsLast().op("text_ops")),
	index("idx_payment_stripe_intent").using("btree", table.stripePaymentIntentId.asc().nullsLast().op("text_ops")),
	index("idx_payment_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "payment_transactions_booking_id_bookings_id_fk"
		}).onDelete("cascade"),
	check("positive_amount", sql`amount > 0`),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text().notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	iconName: varchar("icon_name", { length: 50 }),
	colorHex: varchar("color_hex", { length: 7 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_categories_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("idx_categories_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_categories_primary").using("btree", table.isPrimary.asc().nullsLast().op("bool_ops")),
	uniqueIndex("idx_categories_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("idx_categories_sort_order").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	unique("categories_name_unique").on(table.name),
	unique("categories_slug_unique").on(table.slug),
	check("valid_hex_color", sql`(color_hex IS NULL) OR ((color_hex)::text ~ '^#[0-9A-Fa-f]{6}$'::text)`),
]);

export const clientPreferredCategories = pgTable("client_preferred_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	priority: integer().default(1),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_client_preferred_categories_category").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_client_preferred_categories_client").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("idx_client_preferred_categories_composite").using("btree", table.clientId.asc().nullsLast().op("uuid_ops"), table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_client_preferred_categories_priority").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "client_preferred_categories_category_id_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clientProfiles.userId],
			name: "client_preferred_categories_client_id_client_profiles_user_id_f"
		}).onDelete("cascade"),
	unique("unique_client_category").on(table.clientId, table.categoryId),
]);

export const providerCategories = pgTable("provider_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	providerId: uuid("provider_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	isMainSpecialty: boolean("is_main_specialty").default(false).notNull(),
	experienceYears: integer("experience_years"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_provider_categories_category").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_provider_categories_composite").using("btree", table.providerId.asc().nullsLast().op("uuid_ops"), table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_provider_categories_main_specialty").using("btree", table.providerId.asc().nullsLast().op("bool_ops"), table.isMainSpecialty.asc().nullsLast().op("bool_ops")),
	index("idx_provider_categories_provider").using("btree", table.providerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providerProfiles.userId],
			name: "provider_categories_provider_id_provider_profiles_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "provider_categories_category_id_categories_id_fk"
		}).onDelete("cascade"),
	unique("unique_provider_category").on(table.providerId, table.categoryId),
]);

export const providerProfiles = pgTable("provider_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	bio: text(),
	isOnboarded: boolean("is_onboarded").default(false).notNull(),
	workPhotos: text("work_photos").array().default([""]),
	backgroundCheckStatus: backgroundCheckStatus("background_check_status").default('not_required').notNull(),
	backgroundCheckCompletedAt: timestamp("background_check_completed_at", { withTimezone: true, mode: 'string' }),
	idVerificationStatus: idVerificationStatus("id_verification_status").default('not_required').notNull(),
	idVerificationCompletedAt: timestamp("id_verification_completed_at", { withTimezone: true, mode: 'string' }),
	hourlyRate: integer("hourly_rate"),
	cancellationPolicy: cancellationPolicy("cancellation_policy").default('moderate'),
	offersFreeConsultation: boolean("offers_free_consultation").default(false).notNull(),
	certifications: text().array().default([""]),
	yearsOfExperience: integer("years_of_experience"),
	languages: text().array().default([""]),
	insuranceVerified: boolean("insurance_verified").default(false).notNull(),
	availability: json(),
	averageRating: numeric("average_rating", { precision: 3, scale:  2 }).default('0.00'),
	totalReviews: integer("total_reviews").default(0).notNull(),
	ratingBreakdown: json("rating_breakdown").default({"oneStar":0,"twoStar":0,"threeStar":0,"fourStar":0,"fiveStar":0}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	businessType: businessType("business_type"),
	businessName: varchar("business_name", { length: 255 }),
	businessPhone: varchar("business_phone", { length: 16 }),
	businessPhoneLineType: phoneLineType("business_phone_line_type"),
	employerEin: varchar("employer_ein", { length: 10 }),
	stripeConnectedAccountId: varchar("stripe_connected_account_id", { length: 255 }),
}, (table) => [
	index("idx_provider_avg_rating").using("btree", table.averageRating.asc().nullsLast().op("numeric_ops")),
	index("idx_provider_background_check").using("btree", table.backgroundCheckStatus.asc().nullsLast().op("enum_ops")),
	index("idx_provider_business_name").using("btree", table.businessName.asc().nullsLast().op("text_ops")),
	index("idx_provider_business_type").using("btree", table.businessType.asc().nullsLast().op("enum_ops")),
	index("idx_provider_certifications_gin").using("gin", table.certifications.asc().nullsLast().op("array_ops")),
	index("idx_provider_hourly_rate").using("btree", table.hourlyRate.asc().nullsLast().op("int4_ops")),
	index("idx_provider_id_verification").using("btree", table.idVerificationStatus.asc().nullsLast().op("enum_ops")),
	index("idx_provider_languages_gin").using("gin", table.languages.asc().nullsLast().op("array_ops")),
	index("idx_provider_onboarded").using("btree", table.isOnboarded.asc().nullsLast().op("bool_ops")),
	index("idx_provider_phone_line_type").using("btree", table.businessPhoneLineType.asc().nullsLast().op("enum_ops")),
	index("idx_provider_search").using("btree", table.isOnboarded.asc().nullsLast().op("int4_ops"), table.averageRating.asc().nullsLast().op("int4_ops"), table.hourlyRate.asc().nullsLast().op("bool_ops")),
	uniqueIndex("idx_provider_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_provider_years_experience").using("btree", table.yearsOfExperience.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "provider_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("provider_profiles_user_id_unique").on(table.userId),
	check("hourly_rate_positive", sql`hourly_rate > 0`),
	check("average_rating_range", sql`(average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric)`),
	check("years_of_experience_non_negative", sql`years_of_experience >= 0`),
]);

export const businessAddresses = pgTable("business_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	providerProfileId: uuid("provider_profile_id").notNull(),
	addressId: uuid("address_id").notNull(),
	role: addressType().default('work').notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_business_address_lookup").using("btree", table.providerProfileId.asc().nullsLast().op("uuid_ops"), table.addressId.asc().nullsLast().op("uuid_ops")),
	index("idx_business_address_primary").using("btree", table.providerProfileId.asc().nullsLast().op("uuid_ops"), table.isPrimary.asc().nullsLast().op("uuid_ops")),
	index("idx_business_address_provider").using("btree", table.providerProfileId.asc().nullsLast().op("uuid_ops")),
	index("idx_business_address_role").using("btree", table.providerProfileId.asc().nullsLast().op("uuid_ops"), table.role.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.providerProfileId],
			foreignColumns: [providerProfiles.id],
			name: "business_addresses_provider_profile_id_provider_profiles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addresses.id],
			name: "business_addresses_address_id_addresses_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar({ length: 100 }).notNull(),
	lastname: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 12 }),
	email: varchar({ length: 255 }).notNull(),
	clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
	profileImage: text("profile_image"),
	roles: userRole().array().default(["client"]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	preferredContactMethod: preferredContactMethod("preferred_contact_method").default('email'),
	language: varchar({ length: 10 }).default('en'),
	accountStatus: accountStatus("account_status").default('active').notNull(),
	isEmailVerified: boolean("is_email_verified").default(false).notNull(),
	isPhoneVerified: boolean("is_phone_verified").default(false).notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	agreedToTerms: boolean("agreed_to_terms").default(false).notNull(),
	agreedToTermsAt: timestamp("agreed_to_terms_at", { withTimezone: true, mode: 'string' }),
	privacyPolicyAccepted: boolean("privacy_policy_accepted").default(false).notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	smsNotifications: boolean("sms_notifications").default(true).notNull(),
	marketingEmails: boolean("marketing_emails").default(false).notNull(),
	referralCode: varchar("referral_code", { length: 20 }),
	referredBy: uuid("referred_by"),
	howDidYouHearAbout: varchar("how_did_you_hear_about", { length: 100 }),
}, (table) => [
	index("idx_users_account_status").using("btree", table.accountStatus.asc().nullsLast().op("enum_ops")),
	index("idx_users_clerk_user_id").using("btree", table.clerkUserId.asc().nullsLast().op("text_ops")),
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_referral_code").using("btree", table.referralCode.asc().nullsLast().op("text_ops")),
	index("idx_users_referred_by").using("btree", table.referredBy.asc().nullsLast().op("uuid_ops")),
	index("idx_users_roles_gin").using("gin", table.roles.asc().nullsLast().op("array_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_clerk_user_id_unique").on(table.clerkUserId),
	unique("users_referral_code_unique").on(table.referralCode),
	check("email_format", sql`(email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$'::text`),
	check("phone_format", sql`(phone)::text ~ '^+[1-9]d{1,14}$'::text`),
]);
