import * as v from "valibot";

// Pick only the hourlyRate field and add validation rules
export const updateHourlyRateSchema = v.object({
  hourlyRate: v.pipe(
    v.nullable(v.number("Hourly rate must be a valid number")),
    v.check(
      (value) => value === null || (value >= 25 && value <= 250),
      "Hourly rate must be between $25 and $250 per hour"
    )
  ),
});

// Type inference
export type HourlyRateFormInput = v.InferInput<typeof updateHourlyRateSchema>;
export type HourlyRateFormOutput = v.InferOutput<typeof updateHourlyRateSchema>;
