DROP INDEX "idx_booking_status";--> statement-breakpoint
DROP INDEX "idx_booking_created_at";--> statement-breakpoint
DROP INDEX "idx_booking_payment_status";--> statement-breakpoint
DROP INDEX "idx_booking_service_category";--> statement-breakpoint
DROP INDEX "idx_booking_date_status";--> statement-breakpoint
DROP INDEX "idx_booking_status_date_range";--> statement-breakpoint
DROP INDEX "idx_booking_category_status";--> statement-breakpoint
DROP INDEX "idx_booking_category_date";--> statement-breakpoint
DROP INDEX "idx_booking_provider_date_status";--> statement-breakpoint
DROP INDEX "idx_booking_client_date_status";--> statement-breakpoint
DROP INDEX "idx_booking_provider_service_area";--> statement-breakpoint
DROP INDEX "idx_booking_service_date";--> statement-breakpoint
DROP INDEX "idx_booking_client_dashboard";--> statement-breakpoint
DROP INDEX "idx_booking_provider_dashboard";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_invoice_id" varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_payment_intent_id" varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_customer_id" varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_subscription_id" varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "amount_refunded" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refunded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_default_schedule_id" integer;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_access_token" text;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_access_token_expires_at" bigint;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_refresh_token" text;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "cal_atoms_refresh_token_expires_at" bigint;--> statement-breakpoint
CREATE INDEX "idx_booking_status_created" ON "bookings" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_booking_payment_status_created" ON "bookings" USING btree ("payment_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_booking_stripe_payment_intent" ON "bookings" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_booking_stripe_invoice" ON "bookings" USING btree ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_booking_stripe_customer" ON "bookings" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_booking_stripe_subscription" ON "bookings" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_booking_service_category_status" ON "bookings" USING btree ("service_category_id","status","service_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_booking_service_date" ON "bookings" USING btree ("service_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_booking_client_dashboard" ON "bookings" USING btree ("client_id","status","service_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_booking_provider_dashboard" ON "bookings" USING btree ("provider_id","status","service_date" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "refund_amount_valid" CHECK ("bookings"."amount_refunded" IS NULL OR 
          ("bookings"."amount_refunded" >= 0 AND 
           ("bookings"."total_price" IS NULL OR "bookings"."amount_refunded" <= "bookings"."total_price")));--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "refund_timestamp_logic" CHECK (("bookings"."amount_refunded" IS NULL OR "bookings"."amount_refunded" = 0) OR 
          "bookings"."refunded_at" IS NOT NULL);