import "server-only";

export const CAL_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID;
export const CAL_OAUTH_CLIENT_SECRET = process.env.CAL_CLIENT_SECRET;
export const CAL_REFRESH_URL = process.env.NEXT_PUBLIC_CAL_REFRESH_URL;

if (!CAL_OAUTH_CLIENT_ID || !CAL_OAUTH_CLIENT_SECRET) {
  throw new Error(
    "Cal.com OAuth credentials not configured. Please set CAL_OAUTH_CLIENT_ID and CAL_OAUTH_CLIENT_SECRET environment variables."
  );
}
