import "server-only";

import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";
import { createCalendarManagedUser } from "@/lib/calendar/create-managed-user";
import { createCalendarSchedule } from "@/lib/calendar/create-schedule";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

export type UserAvailability = {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

export type OnboardingData = {
  clerkUserId: string;
  email: string;
  name: string;
  timezone: (typeof US_TIMEZONE_IDENTIFIERS)[number];
  availability: {
    monday: UserAvailability;
    tuesday: UserAvailability;
    wednesday: UserAvailability;
    thursday: UserAvailability;
    friday: UserAvailability;
    saturday: UserAvailability;
    sunday: UserAvailability;
  };
};

export const createManagedUserWorkflow = inngest.createFunction(
  { id: "create-managed-user-workflow" },
  { event: "onboarding/create-calendar-managed-user" },
  async ({ step, event }) => {
    const { clerkUserId, email, name, timezone, availability } = event.data;

    const createUserResult = await step.run(
      "create-calendar-managed-user",
      async () => {
        return await createCalendarManagedUser({
          email,
          name,
          timeZone: timezone,
        });
      }
    );

    if (!createUserResult.success) {
      return createUserResult;
    }

    const { calAtomsAccessToken, calAtomsDefaultScheduleId } =
      createUserResult.data;

    if (!calAtomsDefaultScheduleId) {
      return {
        success: false,
        error: {
          message: "No default schedule ID returned from calendar creation",
        },
      };
    }

    const createScheduleResult = await step.run(
      "create-calendar-schedule",
      async () => {
        type DayName =
          | "Monday"
          | "Tuesday"
          | "Wednesday"
          | "Thursday"
          | "Friday"
          | "Saturday"
          | "Sunday";

        const dayNameMap: Record<string, DayName> = {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
        };

        const availabilityArray = Object.entries(availability)
          .filter(([, dayData]: [string, UserAvailability]) => dayData.isAvailable)
          .map(([dayName, dayData]: [string, UserAvailability]) => ({
            days: [dayNameMap[dayName]],
            startTime: dayData.startTime,
            endTime: dayData.endTime,
          }));

        return await createCalendarSchedule({
          accessToken: calAtomsAccessToken,
          name: "Provider Schedule",
          timeZone: timezone,
          availability: availabilityArray,
          isDefault: false,
        });
      }
    );

    const saveToDbResult = await step.run("save-calendar-data", async () => {
      const calendarData = createUserResult.data;

      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerkUserID, clerkUserId))
        .limit(1);

      if (!user) {
        throw new Error(`User not found for clerkUserId: ${clerkUserId}`);
      }

      const updateData = {
        calAtomsUserId: calendarData.calAtomsUserId.toString(),
        calAtomsAccessToken: calendarData.calAtomsAccessToken,
        calAtomsRefreshToken: calendarData.calAtomsRefreshToken,
        calAtomsDefaultScheduleId: calendarData.calAtomsDefaultScheduleId,
        calAtomsAccessTokenExpiresAt: calendarData.calAtomsAccessTokenExpiresAt,
        calAtomsRefreshTokenExpiresAt:
          calendarData.calAtomsRefreshTokenExpiresAt,
      };

      await db
        .update(providerProfilesTable)
        .set(updateData)
        .where(eq(providerProfilesTable.userId, user.id))
        .returning({
          calAtomsAccessTokenExpiresAt:
            providerProfilesTable.calAtomsAccessTokenExpiresAt,
          calAtomsRefreshTokenExpiresAt:
            providerProfilesTable.calAtomsRefreshTokenExpiresAt,
        });

      return { success: true, message: "Calendar data saved to database" };
    });

    return {
      createUserResult,
      createScheduleResult,
      saveToDbResult,
    };
  }
);
