import "server-only";

import * as v from "valibot";

import { CAL_OAUTH_CLIENT_ID, CAL_OAUTH_CLIENT_SECRET } from "./constants";

import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

const createCalendarManagedUserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(1)),
  timeFormat: v.optional(v.union([v.literal(12), v.literal(24)])),
  weekStart: v.optional(v.string()),
  //! timeZone cannot be optional because if not it will not create a default timezone, and we need one to be able to update it in the onboarding "Select your availability" step
  timeZone: v.union(US_TIMEZONE_IDENTIFIERS.map((tz) => v.literal(tz))),
  locale: v.optional(v.string()),
  avatarUrl: v.optional(v.pipe(v.string(), v.url())),
  bio: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.unknown())),
});

type CreateManagedUserData = {
  calAtomsUserId: number;
  calAtomsAccessToken: string;
  calAtomsRefreshToken: string;
  calAtomsDefaultScheduleId?: number | null;
  calAtomsAccessTokenExpiresAt: number;
  calAtomsRefreshTokenExpiresAt: number;
};

type CreateManagedUserResult =
  | {
      status: "success";
      data: {
        accessToken: string;
        refreshToken: string;
        user: {
          id: number;
          email: string;
          username: string;
          name: string;
          bio?: string | null;
          timeZone: string | null;
          weekStart?: string | null;
          createdDate?: string;
          timeFormat?: 12 | 24 | number;
          defaultScheduleId?: number | null;
          locale?: string;
          avatarUrl?: string | null;
          metadata?: Record<string, unknown>;
        };
        accessTokenExpiresAt: number;
        refreshTokenExpiresAt: number;
      };
    }
  | {
      status: "error";
      error: Record<string, unknown>;
    };

export async function createCalendarManagedUser(
  formData: v.InferInput<typeof createCalendarManagedUserSchema>
): Promise<ApiResponse<CreateManagedUserData>> {
  const validationResult = v.safeParse(
    createCalendarManagedUserSchema,
    formData
  );
  if (!validationResult.success) {
    return createErrorResponse({
      code: "INVALID_USER_INFO",
      message: "Invalid user information provided.",
    });
  }

  const { email, name, timeZone, ...optionalFields } = validationResult.output;

  try {
    const response = await fetch(
      `https://api.cal.com/v2/oauth-clients/${CAL_OAUTH_CLIENT_ID}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cal-secret-key": CAL_OAUTH_CLIENT_SECRET ?? "",
        },
        body: JSON.stringify({
          email,
          name,
          timeZone,
          ...optionalFields,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cal.com API error:", response.status, errorData);

      // Don't retry for ConflictException (user already exists)
      if (
        response.status === 409 &&
        errorData.error?.code === "ConflictException"
      ) {
        return createErrorResponse({
          code: "USER_ALREADY_EXISTS",
          message:
            errorData.error?.message || "User with this email already exists.",
        });
      }

      // Throw for all other errors to trigger Inngest retries
      throw new Error(
        `Cal.com API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const result: CreateManagedUserResult = await response.json();

    if (result.status !== "success") {
      return createErrorResponse({
        code: result.error?.code as string,
        message:
          (result.error?.message as string) ||
          "Failed to create calendar user.",
      });
    }

    return createSuccessResponse({
      calAtomsUserId: result.data.user.id,
      calAtomsAccessToken: result.data.accessToken,
      calAtomsRefreshToken: result.data.refreshToken,
      calAtomsDefaultScheduleId: result.data.user.defaultScheduleId,
      calAtomsAccessTokenExpiresAt: result.data.accessTokenExpiresAt,
      calAtomsRefreshTokenExpiresAt: result.data.refreshTokenExpiresAt,
    });
  } catch (error) {
    return createErrorResponse({
      code: "UNKNOWN_ERROR",
      message: `An unknown error occurred: ${error}`,
    });
  }
}
