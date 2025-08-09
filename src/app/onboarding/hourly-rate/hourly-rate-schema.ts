import * as v from "valibot";

import { createInsertSchema } from "drizzle-valibot";
import { providerProfilesTable } from "@/lib/db/provider-schema";

const {
  entries: { hourlyRate },
} = createInsertSchema(providerProfilesTable);

export const createHourlyRateSchema = v.object({
  hourlyRate: v.pipe(
    hourlyRate,
    v.check(
      (value) =>
        value === null || value === undefined || (value >= 25 && value <= 250),
      "Hourly rate must be between $25 and $250 per hour"
    )
  ),
});

export type CreateHourlyRateInput = v.InferInput<typeof createHourlyRateSchema>;
export type CreateHourlyRateOutput = v.InferOutput<
  typeof createHourlyRateSchema
>;
