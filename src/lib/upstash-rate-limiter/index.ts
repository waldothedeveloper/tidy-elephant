"server-only";

import { auth } from "@clerk/nextjs/server";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitConfig {
  // Verification limits (SMS/Code verification)
  verificationAttempts: number;
  verificationWindow: string;
  dailyAttempts: number;
  dailyWindow: string;

  // Lookup limits (Phone number lookup)
  lookupAttempts: number;
  lookupWindow: string;
  dailyAttemptsLookup: number;
  dailyWindowLookup: string;

  // Send verification code limits
  sendVerificationAttempts: number;
  sendVerificationWindow: string;
  dailySendVerificationAttempts: number;
  dailySendVerificationWindow: string;
}

export const getRateLimitConfig = (): RateLimitConfig => {
  return {
    // Verification limits (stricter)
    verificationAttempts: parseInt(
      process.env.RATE_LIMIT_VERIFICATION_ATTEMPTS || "5"
    ),
    verificationWindow: process.env.RATE_LIMIT_VERIFICATION_WINDOW || "60s",
    dailyAttempts: parseInt(process.env.RATE_LIMIT_DAILY_ATTEMPTS || "25"),
    dailyWindow: process.env.RATE_LIMIT_DAILY_WINDOW || "86400s",

    // Lookup limits (more lenient)
    lookupAttempts: parseInt(process.env.RATE_LIMIT_LOOKUP_ATTEMPTS || "10"),
    lookupWindow: process.env.RATE_LIMIT_LOOKUP_WINDOW || "60s",
    dailyAttemptsLookup: parseInt(
      process.env.RATE_LIMIT_DAILY_ATTEMPTS_LOOKUP || "100"
    ),
    dailyWindowLookup: process.env.RATE_LIMIT_DAILY_WINDOW_LOOKUP || "86400s",

    // Send verification code limits (strictest - SMS costs money!)
    sendVerificationAttempts: parseInt(
      process.env.RATE_LIMIT_SEND_VERIFICATION_ATTEMPTS || "3"
    ),
    sendVerificationWindow:
      process.env.RATE_LIMIT_SEND_VERIFICATION_WINDOW || "59s",
    dailySendVerificationAttempts: parseInt(
      process.env.RATE_LIMIT_DAILY_SEND_VERIFICATION_ATTEMPTS || "10"
    ),
    dailySendVerificationWindow:
      process.env.RATE_LIMIT_DAILY_SEND_VERIFICATION_WINDOW || "86401s",
  };
};

// Helper function to get rate limits for specific action types
export const getActionRateLimits = (
  actionType: "verification" | "lookup" | "send-verification"
) => {
  const config = getRateLimitConfig();

  switch (actionType) {
    case "verification":
      return {
        attempts: config.verificationAttempts,
        window: config.verificationWindow,
        dailyAttempts: config.dailyAttempts,
        dailyWindow: config.dailyWindow,
      };
    case "lookup":
      return {
        attempts: config.lookupAttempts,
        window: config.lookupWindow,
        dailyAttempts: config.dailyAttemptsLookup,
        dailyWindow: config.dailyWindowLookup,
      };
    case "send-verification":
      return {
        attempts: config.sendVerificationAttempts,
        window: config.sendVerificationWindow,
        dailyAttempts: config.dailySendVerificationAttempts,
        dailyWindow: config.dailySendVerificationWindow,
      };
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
};

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  error?: string;
}

export async function rateLimiter(
  action: string,
  limit: number = 5,
  window: Duration = "60s"
): Promise<RateLimitResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      remaining: 0,
      reset: 0,
      error: "Authentication required",
    };
  }

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    ephemeralCache: new Map(),
    prefix: `@upstash/ratelimit`,
    analytics: true,
  });

  const rateLimitKey = `${action}:${userId}`;
  const {
    success,
    limit: rateLimitMax,
    remaining,
    reset,
  } = await ratelimit.limit(rateLimitKey);

  // Log for internal monitoring (server-side only)
  if (!success) {
    console.warn(
      `Rate limit exceeded for user ${userId} on action ${action}. Limit: ${rateLimitMax}/${window}`
    );
  }

  return {
    success,
    remaining,
    reset,
    ...(!success && {
      error: "Too many requests. Please try again later.",
    }),
  };
}
