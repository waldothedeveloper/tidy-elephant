"use server";

import * as v from "valibot";

import {
  HourlyRateFormInput,
  updateHourlyRateSchema,
} from "@/app/onboarding/hourly-rate/hourly-rate-schema";
import { saveProviderHourlyRateDAL } from "@/lib/dal/onboarding/hourly-rate";
import { auth } from "@clerk/nextjs/server";

export async function saveProviderHourlyRateAction(
  formData: HourlyRateFormInput
) {
  // 1. AUTHENTICATE FIRST - Check auth before any logic
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "You must be authenticated to perform this action.",
    };
  }
  try {
    const validationResult = v.safeParse(updateHourlyRateSchema, formData);
    if (!validationResult.success) {
      const firstError = validationResult.issues?.[0]?.message;
      return {
        success: false,
        message:
          firstError ||
          "Invalid hourly rate. Please enter a valid rate between $25 and $250 per hour.",
      };
    }

    // Save to database using DAL function
    const result = await saveProviderHourlyRateDAL(validationResult.output);
    return result;
  } catch (error) {
    console.error("Unexpected error in saveProviderHourlyRateAction:", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      message:
        "An unexpected error occurred while saving your hourly rate. Please try again.",
    };
  }
}
