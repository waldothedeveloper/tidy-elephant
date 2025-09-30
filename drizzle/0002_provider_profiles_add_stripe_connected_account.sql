ALTER TABLE "provider_profiles"
  ADD COLUMN IF NOT EXISTS "stripe_connected_account_id" varchar(255);
