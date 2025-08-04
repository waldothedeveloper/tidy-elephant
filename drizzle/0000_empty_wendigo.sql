CREATE TYPE "public"."address_type" AS ENUM('home', 'work', 'service_location', 'billing', 'other');--> statement-breakpoint
CREATE TYPE "public"."country" AS ENUM('US', 'CA', 'UK', 'AU');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."home_type" AS ENUM('apartment', 'house', 'condo', 'office');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'captured', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_transaction_status" AS ENUM('pending', 'succeeded', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('payment', 'refund', 'chargeback');--> statement-breakpoint
CREATE TYPE "public"."background_check_status" AS ENUM('not_required', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."cancellation_policy" AS ENUM('flexible', 'moderate', 'strict');--> statement-breakpoint
CREATE TYPE "public"."id_verification_status" AS ENUM('not_required', 'pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('active', 'flagged', 'removed');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'inactive', 'suspended', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."preferred_contact_method" AS ENUM('email', 'phone', 'app_messaging');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'provider');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_line_1" varchar(255) NOT NULL,
	"address_line_2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" "country" DEFAULT 'US' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"type" "address_type" DEFAULT 'home' NOT NULL,
	"label" varchar(50),
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_deliverable" boolean DEFAULT true NOT NULL,
	"access_instructions" text,
	"parking_information" text,
	"building_info" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"role" "address_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"label" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"service_category_id" uuid,
	"service_description" text,
	"service_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"service_area" varchar(100),
	"hourly_rate" integer NOT NULL,
	"total_price" integer,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method_id" varchar(100),
	"client_notes" text,
	"provider_notes" text,
	"internal_notes" text,
	"cancellation_reason" text,
	"has_children" boolean DEFAULT false NOT NULL,
	"has_pets" boolean DEFAULT false NOT NULL,
	"home_type" "home_type",
	"accessibility_needs" text[] DEFAULT '{}',
	"emergency_contact" json,
	"photos_before_service" text[] DEFAULT '{}',
	"photos_after_service" text[] DEFAULT '{}',
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_date" timestamp with time zone,
	"reminders_sent" json DEFAULT '[]'::json,
	"review_eligible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "unique_client_provider_datetime" UNIQUE("client_id","provider_id","service_date"),
	CONSTRAINT "positive_hourly_rate" CHECK ("bookings"."hourly_rate" > 0),
	CONSTRAINT "positive_total_price" CHECK ("bookings"."total_price" IS NULL OR "bookings"."total_price" > 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"icon_name" varchar(50),
	"color_hex" varchar(7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "valid_hex_color" CHECK ("categories"."color_hex" IS NULL OR "categories"."color_hex" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
CREATE TABLE "client_preferred_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"priority" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_client_category" UNIQUE("client_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "provider_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_main_specialty" boolean DEFAULT false NOT NULL,
	"experience_years" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_provider_category" UNIQUE("provider_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "client_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferred_providers" uuid[] DEFAULT '{}',
	"blocked_providers" uuid[] DEFAULT '{}',
	"time_preferences" json DEFAULT '{}'::json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"stripe_charge_id" varchar(255),
	"amount" integer NOT NULL,
	"type" "payment_type" DEFAULT 'payment' NOT NULL,
	"status" "payment_transaction_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "positive_amount" CHECK ("payment_transactions"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "provider_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"work_photos" text[] DEFAULT '{}',
	"background_check_status" "background_check_status" DEFAULT 'not_required' NOT NULL,
	"background_check_completed_at" timestamp with time zone,
	"id_verification_status" "id_verification_status" DEFAULT 'not_required' NOT NULL,
	"id_verification_completed_at" timestamp with time zone,
	"hourly_rate" integer,
	"cancellation_policy" "cancellation_policy" DEFAULT 'moderate',
	"offers_free_consultation" boolean DEFAULT false NOT NULL,
	"certifications" text[] DEFAULT '{}',
	"years_of_experience" integer,
	"languages" text[] DEFAULT '{}',
	"insurance_verified" boolean DEFAULT false NOT NULL,
	"availability" json,
	"average_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"rating_breakdown" json DEFAULT '{"oneStar":0,"twoStar":0,"threeStar":0,"fourStar":0,"fiveStar":0}'::json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "provider_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "review_status" DEFAULT 'active' NOT NULL,
	"category_ratings" json,
	"flagged_reason" varchar(200),
	"moderated_by" uuid,
	"moderated_at" timestamp with time zone,
	CONSTRAINT "reviews_booking_id_unique" UNIQUE("booking_id"),
	CONSTRAINT "rating_range" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5),
	CONSTRAINT "comment_length" CHECK (length("reviews"."comment") >= 10)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar(100) NOT NULL,
	"lastname" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"profile_image" text,
	"roles" "user_role"[] DEFAULT '{"client"}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"preferred_contact_method" "preferred_contact_method" DEFAULT 'email',
	"language" varchar(10) DEFAULT 'en',
	"account_status" "account_status" DEFAULT 'pending_verification' NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"agreed_to_terms" boolean DEFAULT false NOT NULL,
	"agreed_to_terms_at" timestamp with time zone,
	"privacy_policy_accepted" boolean DEFAULT false NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"sms_notifications" boolean DEFAULT true NOT NULL,
	"marketing_emails" boolean DEFAULT false NOT NULL,
	"referral_code" varchar(20),
	"referred_by" uuid,
	"how_did_you_hear_about" varchar(100),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "booking_addresses" ADD CONSTRAINT "booking_addresses_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_addresses" ADD CONSTRAINT "booking_addresses_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_category_id_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_preferred_categories" ADD CONSTRAINT "client_preferred_categories_client_id_client_profiles_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_preferred_categories" ADD CONSTRAINT "client_preferred_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_provider_id_provider_profiles_user_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."provider_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;