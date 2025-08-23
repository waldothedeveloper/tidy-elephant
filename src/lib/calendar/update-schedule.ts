import "server-only";

import * as v from "valibot";

import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const updateScheduleAvailabilitySchema = v.object({
  days: v.array(v.union(WEEKDAYS.map((d) => v.literal(d)))),
  startTime: v.pipe(v.string(), v.regex(TIME_REGEX)),
  endTime: v.pipe(v.string(), v.regex(TIME_REGEX)),
});

const updateScheduleOverrideSchema = v.object({
  date: v.pipe(v.string(), v.isoDate()),
  startTime: v.pipe(v.string(), v.regex(TIME_REGEX)),
  endTime: v.pipe(v.string(), v.regex(TIME_REGEX)),
});

const updateCalendarScheduleSchema = v.object({
  scheduleId: v.pipe(v.string(), v.minLength(1)),
  accessToken: v.pipe(v.string(), v.minLength(1)),
  name: v.optional(v.pipe(v.string(), v.minLength(1))),
  timeZone: v.optional(v.union(US_TIMEZONE_IDENTIFIERS.map((tz) => v.literal(tz)))),
  availability: v.optional(v.array(updateScheduleAvailabilitySchema)),
  isDefault: v.optional(v.boolean()),
  overrides: v.optional(v.array(updateScheduleOverrideSchema)),
});

type UpdateScheduleData = {
  id: string;
  name: string;
  timeZone: (typeof US_TIMEZONE_IDENTIFIERS)[number];
  isDefault: boolean;
  availability: Array<{
    days: Weekday[];
    startTime: string;
    endTime: string;
  }>;
  overrides?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
};

type UpdateScheduleResult =
  | {
      status: "success";
      data: UpdateScheduleData;
    }
  | {
      status: "error";
      error: Record<string, unknown>;
    };

export async function updateCalendarSchedule(
  formData: v.InferInput<typeof updateCalendarScheduleSchema>
): Promise<ApiResponse<UpdateScheduleData>> {
  const validationResult = v.safeParse(updateCalendarScheduleSchema, formData);
  if (!validationResult.success) {
    return createErrorResponse({
      message: "Invalid schedule update data provided.",
    });
  }

  const { scheduleId, accessToken, ...updateData } = validationResult.output;

  try {
    const response = await fetch(
      `https://api.cal.com/v2/schedules/${scheduleId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "cal-api-version": "2024-06-11",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cal.com API error:", response.status, errorData);
      return createErrorResponse({
        code: "API_ERROR",
        message: "Failed to update calendar schedule.",
      });
    }

    const result: UpdateScheduleResult = await response.json();

    if (result.status !== "success") {
      return createErrorResponse({
        code: result.error?.code as string,
        message:
          (result.error?.message as string) ||
          "Failed to update calendar schedule.",
      });
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return createErrorResponse({
      code: "UNKNOWN_ERROR",
      message: `An unknown error occurred: ${error}`,
    });
  }
}
