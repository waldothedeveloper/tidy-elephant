CREATE TYPE "public"."business_type" AS ENUM('sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corporation', 'other');--> statement-breakpoint
CREATE TYPE "public"."phone_line_type" AS ENUM('landline', 'mobile', 'fixedVoip', 'nonFixedVoip', 'personal', 'tollFree', 'premium', 'sharedCost', 'uan', 'voicemail', 'pager', 'unknown');--> statement-breakpoint
CREATE TABLE "business_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_profile_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"role" "address_type" DEFAULT 'work' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "country" SET DEFAULT 'US'::text;--> statement-breakpoint
DROP TYPE "public"."country";--> statement-breakpoint
CREATE TYPE "public"."country" AS ENUM('US');--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "country" SET DEFAULT 'US'::"public"."country";--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE "public"."country" USING "country"::"public"."country";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET DATA TYPE varchar(12);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "business_type" "business_type";--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "business_name" varchar(255);--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "business_phone" varchar(16);--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "business_phone_line_type" "phone_line_type";--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "employer_ein" varchar(10);--> statement-breakpoint
ALTER TABLE "business_addresses" ADD CONSTRAINT "business_addresses_provider_profile_id_provider_profiles_id_fk" FOREIGN KEY ("provider_profile_id") REFERENCES "public"."provider_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_addresses" ADD CONSTRAINT "business_addresses_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_business_address_provider" ON "business_addresses" USING btree ("provider_profile_id");--> statement-breakpoint
CREATE INDEX "idx_business_address_role" ON "business_addresses" USING btree ("provider_profile_id","role");--> statement-breakpoint
CREATE INDEX "idx_business_address_primary" ON "business_addresses" USING btree ("provider_profile_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_business_address_lookup" ON "business_addresses" USING btree ("provider_profile_id","address_id");--> statement-breakpoint
CREATE INDEX "idx_address_geocode" ON "addresses" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_address_latitude" ON "addresses" USING btree ("latitude");--> statement-breakpoint
CREATE INDEX "idx_address_longitude" ON "addresses" USING btree ("longitude");--> statement-breakpoint
CREATE INDEX "idx_address_type" ON "addresses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_address_city_state" ON "addresses" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "idx_address_postal_code" ON "addresses" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "idx_address_verification" ON "addresses" USING btree ("is_verified","is_deliverable");--> statement-breakpoint
CREATE INDEX "idx_booking_address_role" ON "booking_addresses" USING btree ("booking_id","role");--> statement-breakpoint
CREATE INDEX "idx_booking_address_lookup" ON "booking_addresses" USING btree ("booking_id","address_id");--> statement-breakpoint
CREATE INDEX "idx_user_address_primary" ON "user_addresses" USING btree ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_user_address_lookup" ON "user_addresses" USING btree ("user_id","address_id");--> statement-breakpoint
CREATE INDEX "idx_booking_client_id" ON "bookings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_booking_provider_id" ON "bookings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_booking_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_booking_service_date" ON "bookings" USING btree ("service_date");--> statement-breakpoint
CREATE INDEX "idx_booking_created_at" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_booking_payment_status" ON "bookings" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_booking_client_dashboard" ON "bookings" USING btree ("client_id","status","service_date");--> statement-breakpoint
CREATE INDEX "idx_booking_provider_dashboard" ON "bookings" USING btree ("provider_id","status","service_date");--> statement-breakpoint
CREATE INDEX "idx_booking_service_category" ON "bookings" USING btree ("service_category_id");--> statement-breakpoint
CREATE INDEX "idx_booking_accessibility_needs_gin" ON "bookings" USING gin ("accessibility_needs");--> statement-breakpoint
CREATE INDEX "idx_booking_date_status" ON "bookings" USING btree ("service_date","status");--> statement-breakpoint
CREATE INDEX "idx_booking_status_date_range" ON "bookings" USING btree ("status","service_date","created_at");--> statement-breakpoint
CREATE INDEX "idx_booking_category_status" ON "bookings" USING btree ("service_category_id","status");--> statement-breakpoint
CREATE INDEX "idx_booking_category_date" ON "bookings" USING btree ("service_category_id","service_date");--> statement-breakpoint
CREATE INDEX "idx_booking_provider_date_status" ON "bookings" USING btree ("provider_id","service_date","status");--> statement-breakpoint
CREATE INDEX "idx_booking_client_date_status" ON "bookings" USING btree ("client_id","service_date","status");--> statement-breakpoint
CREATE INDEX "idx_booking_provider_service_area" ON "bookings" USING btree ("provider_id","service_area");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_slug" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_name" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_categories_active" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_categories_primary" ON "categories" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "idx_categories_sort_order" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_client_preferred_categories_client" ON "client_preferred_categories" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_preferred_categories_category" ON "client_preferred_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_client_preferred_categories_priority" ON "client_preferred_categories" USING btree ("client_id","priority");--> statement-breakpoint
CREATE INDEX "idx_client_preferred_categories_composite" ON "client_preferred_categories" USING btree ("client_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_provider_categories_provider" ON "provider_categories" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_provider_categories_category" ON "provider_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_provider_categories_main_specialty" ON "provider_categories" USING btree ("provider_id","is_main_specialty");--> statement-breakpoint
CREATE INDEX "idx_provider_categories_composite" ON "provider_categories" USING btree ("provider_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_client_user_id" ON "client_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_client_preferred_providers_gin" ON "client_profiles" USING gin ("preferred_providers");--> statement-breakpoint
CREATE INDEX "idx_client_blocked_providers_gin" ON "client_profiles" USING gin ("blocked_providers");--> statement-breakpoint
CREATE INDEX "idx_payment_booking_id" ON "payment_transactions" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_payment_stripe_intent" ON "payment_transactions" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_payment_stripe_charge" ON "payment_transactions" USING btree ("stripe_charge_id");--> statement-breakpoint
CREATE INDEX "idx_payment_status" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_type" ON "payment_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payment_created_at" ON "payment_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_history" ON "payment_transactions" USING btree ("status","type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_provider_user_id" ON "provider_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_provider_onboarded" ON "provider_profiles" USING btree ("is_onboarded");--> statement-breakpoint
CREATE INDEX "idx_provider_avg_rating" ON "provider_profiles" USING btree ("average_rating");--> statement-breakpoint
CREATE INDEX "idx_provider_hourly_rate" ON "provider_profiles" USING btree ("hourly_rate");--> statement-breakpoint
CREATE INDEX "idx_provider_years_experience" ON "provider_profiles" USING btree ("years_of_experience");--> statement-breakpoint
CREATE INDEX "idx_provider_background_check" ON "provider_profiles" USING btree ("background_check_status");--> statement-breakpoint
CREATE INDEX "idx_provider_id_verification" ON "provider_profiles" USING btree ("id_verification_status");--> statement-breakpoint
CREATE INDEX "idx_provider_languages_gin" ON "provider_profiles" USING gin ("languages");--> statement-breakpoint
CREATE INDEX "idx_provider_certifications_gin" ON "provider_profiles" USING gin ("certifications");--> statement-breakpoint
CREATE INDEX "idx_provider_business_name" ON "provider_profiles" USING btree ("business_name");--> statement-breakpoint
CREATE INDEX "idx_provider_business_type" ON "provider_profiles" USING btree ("business_type");--> statement-breakpoint
CREATE INDEX "idx_provider_phone_line_type" ON "provider_profiles" USING btree ("business_phone_line_type");--> statement-breakpoint
CREATE INDEX "idx_provider_search" ON "provider_profiles" USING btree ("is_onboarded","average_rating","hourly_rate");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_review_booking_id" ON "reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_review_client_id" ON "reviews" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_review_provider_id" ON "reviews" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_review_rating" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_review_status" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_review_created_at" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_review_provider_listing" ON "reviews" USING btree ("provider_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_clerk_user_id" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_users_referral_code" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_users_account_status" ON "users" USING btree ("account_status");--> statement-breakpoint
CREATE INDEX "idx_users_roles_gin" ON "users" USING gin ("roles");--> statement-breakpoint
CREATE INDEX "idx_users_referred_by" ON "users" USING btree ("referred_by");--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD CONSTRAINT "hourly_rate_positive" CHECK ("provider_profiles"."hourly_rate" > 0);--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD CONSTRAINT "average_rating_range" CHECK ("provider_profiles"."average_rating" >= 0 AND "provider_profiles"."average_rating" <= 5);--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD CONSTRAINT "years_of_experience_non_negative" CHECK ("provider_profiles"."years_of_experience" >= 0);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "phone_format" CHECK ("users"."phone" IS NULL OR ("users"."phone" ~ '^+1d{10}$' AND length("users"."phone") = 12));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "email_format" CHECK ("users"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$');