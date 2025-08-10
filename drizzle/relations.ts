import { relations } from "drizzle-orm/relations";
import { users, userAddresses, addresses, bookings, categories, bookingAddresses, clientProfiles, reviews, paymentTransactions, clientPreferredCategories, providerProfiles, providerCategories, businessAddresses } from "./schema";

export const userAddressesRelations = relations(userAddresses, ({one}) => ({
	user: one(users, {
		fields: [userAddresses.userId],
		references: [users.id]
	}),
	address: one(addresses, {
		fields: [userAddresses.addressId],
		references: [addresses.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userAddresses: many(userAddresses),
	bookings_clientId: many(bookings, {
		relationName: "bookings_clientId_users_id"
	}),
	bookings_providerId: many(bookings, {
		relationName: "bookings_providerId_users_id"
	}),
	clientProfiles: many(clientProfiles),
	reviews_clientId: many(reviews, {
		relationName: "reviews_clientId_users_id"
	}),
	reviews_providerId: many(reviews, {
		relationName: "reviews_providerId_users_id"
	}),
	reviews_moderatedBy: many(reviews, {
		relationName: "reviews_moderatedBy_users_id"
	}),
	providerProfiles: many(providerProfiles),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	userAddresses: many(userAddresses),
	bookingAddresses: many(bookingAddresses),
	businessAddresses: many(businessAddresses),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	user_clientId: one(users, {
		fields: [bookings.clientId],
		references: [users.id],
		relationName: "bookings_clientId_users_id"
	}),
	user_providerId: one(users, {
		fields: [bookings.providerId],
		references: [users.id],
		relationName: "bookings_providerId_users_id"
	}),
	category: one(categories, {
		fields: [bookings.serviceCategoryId],
		references: [categories.id]
	}),
	bookingAddresses: many(bookingAddresses),
	reviews: many(reviews),
	paymentTransactions: many(paymentTransactions),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	bookings: many(bookings),
	clientPreferredCategories: many(clientPreferredCategories),
	providerCategories: many(providerCategories),
}));

export const bookingAddressesRelations = relations(bookingAddresses, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingAddresses.bookingId],
		references: [bookings.id]
	}),
	address: one(addresses, {
		fields: [bookingAddresses.addressId],
		references: [addresses.id]
	}),
}));

export const clientProfilesRelations = relations(clientProfiles, ({one, many}) => ({
	user: one(users, {
		fields: [clientProfiles.userId],
		references: [users.id]
	}),
	clientPreferredCategories: many(clientPreferredCategories),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	booking: one(bookings, {
		fields: [reviews.bookingId],
		references: [bookings.id]
	}),
	user_clientId: one(users, {
		fields: [reviews.clientId],
		references: [users.id],
		relationName: "reviews_clientId_users_id"
	}),
	user_providerId: one(users, {
		fields: [reviews.providerId],
		references: [users.id],
		relationName: "reviews_providerId_users_id"
	}),
	user_moderatedBy: one(users, {
		fields: [reviews.moderatedBy],
		references: [users.id],
		relationName: "reviews_moderatedBy_users_id"
	}),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one}) => ({
	booking: one(bookings, {
		fields: [paymentTransactions.bookingId],
		references: [bookings.id]
	}),
}));

export const clientPreferredCategoriesRelations = relations(clientPreferredCategories, ({one}) => ({
	category: one(categories, {
		fields: [clientPreferredCategories.categoryId],
		references: [categories.id]
	}),
	clientProfile: one(clientProfiles, {
		fields: [clientPreferredCategories.clientId],
		references: [clientProfiles.userId]
	}),
}));

export const providerCategoriesRelations = relations(providerCategories, ({one}) => ({
	providerProfile: one(providerProfiles, {
		fields: [providerCategories.providerId],
		references: [providerProfiles.userId]
	}),
	category: one(categories, {
		fields: [providerCategories.categoryId],
		references: [categories.id]
	}),
}));

export const providerProfilesRelations = relations(providerProfiles, ({one, many}) => ({
	providerCategories: many(providerCategories),
	user: one(users, {
		fields: [providerProfiles.userId],
		references: [users.id]
	}),
	businessAddresses: many(businessAddresses),
}));

export const businessAddressesRelations = relations(businessAddresses, ({one}) => ({
	providerProfile: one(providerProfiles, {
		fields: [businessAddresses.providerProfileId],
		references: [providerProfiles.id]
	}),
	address: one(addresses, {
		fields: [businessAddresses.addressId],
		references: [addresses.id]
	}),
}));