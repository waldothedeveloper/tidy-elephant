type VerificationFromOAuth = {
  attempts: null;
  expire_at: null;
  object: "verification_from_oauth";
  status: "verified";
  strategy: string;
};

type VerificationOAuth = {
  attempts: null;
  error?: {
    code: string;
    long_message: string;
    message: string;
  };
  expire_at: number;
  object: "verification_oauth";
  status: "verified" | "unverified";
  strategy: string;
};

type EmailAddress = {
  created_at: number;
  email_address: string;
  id: string;
  linked_to: Array<{
    id: string;
    type: string;
  }>;
  matches_sso_connection: boolean;
  object: "email_address";
  reserved: boolean;
  updated_at: number;
  verification: VerificationFromOAuth;
};

type ExternalAccount = {
  approved_scopes: string;
  avatar_url: string;
  created_at: number;
  email_address: string;
  external_account_id: string;
  family_name: string;
  first_name: string;
  given_name: string;
  google_id: string;
  id: string;
  identification_id: string;
  image_url: string;
  label: null;
  last_name: string;
  object: "google_account";
  picture: string;
  provider: "oauth_google";
  provider_user_id: string;
  public_metadata: Record<string, unknown>;
  updated_at: number;
  username: null;
  verification: VerificationOAuth;
};

export type ClerkUserCreatedData = {
  backup_code_enabled: boolean;
  banned: boolean;
  create_organization_enabled: boolean;
  created_at: number;
  delete_self_enabled: boolean;
  email_addresses: EmailAddress[];
  enterprise_accounts: unknown[];
  external_accounts: ExternalAccount[];
  external_id: null;
  first_name: string;
  has_image: boolean;
  id: string;
  image_url: string;
  last_active_at: number;
  last_name: string;
  last_sign_in_at: number | null;
  legal_accepted_at: number;
  locked: boolean;
  lockout_expires_in_seconds: null;
  mfa_disabled_at: null;
  mfa_enabled_at: null;
  object: "user";
  passkeys: unknown[];
  password_enabled: boolean;
  phone_numbers: unknown[];
  primary_email_address_id: string;
  primary_phone_number_id: null;
  primary_web3_wallet_id: null;
  private_metadata: Record<string, unknown>;
  profile_image_url: string;
  public_metadata: Record<string, unknown>;
  saml_accounts: unknown[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: Record<string, unknown>;
  updated_at: number;
  username: null;
  verification_attempts_remaining: number;
  web3_wallets: unknown[];
};

export type ClerkUserCreatedEvent = {
  data: ClerkUserCreatedData;
  id: string;
  name: "clerk/user.created";
  ts: number;
  user: Record<string, unknown>;
};