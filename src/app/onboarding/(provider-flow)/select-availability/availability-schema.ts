import * as v from "valibot";

import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";

const dayAvailabilitySchema = v.object({
  isAvailable: v.boolean(),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
});

export const availabilitySchema = v.object({
  timezone: v.picklist(US_TIMEZONE_IDENTIFIERS),
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});
