"use server";

import * as v from "valibot";

import { availabilitySchema } from "@/app/onboarding/(provider-flow)/select-availability/availability-schema";
import type { UserAvailability } from "@/features/onboarding/inngest/functions";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { getUserProfileDAL } from "@/lib/dal/onboarding/user-profile";

type AvailabilityFormData = {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
};

type SaveAvailabilityInput = v.InferInput<typeof availabilitySchema>;
type SaveAvailabilityOutput = v.InferOutput<typeof availabilitySchema>;

type SaveAvailabilityResult = {
  success: boolean;
  message?: string;
  error?: string;
  availabilitySummary?: string;
};

export async function saveAvailabilityAction(
  formData: SaveAvailabilityInput
): Promise<SaveAvailabilityResult> {
  try {
    await enforceAuthProvider();
  } catch (error) {
    return {
      success: false,
      error: `Authentication required. Please sign in as a provider. ${error}`,
    };
  }

  const validationResult = v.safeParse(availabilitySchema, formData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid availability information provided.",
    };
  }

  const availabilityData: SaveAvailabilityOutput = validationResult.output;
  const {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    timezone,
  } = availabilityData;

  const userProfileData = await getUserProfileDAL();

  if (!userProfileData) {
    return {
      success: false,
      error: "User profile not found.",
    };
  }

  const transformToUserAvailability = (
    day: AvailabilityFormData
  ): UserAvailability => ({
    isAvailable: day.isAvailable,
    startTime: day.startTime || "",
    endTime: day.endTime || "",
  });

  const availability = {
    monday: transformToUserAvailability(monday),
    tuesday: transformToUserAvailability(tuesday),
    wednesday: transformToUserAvailability(wednesday),
    thursday: transformToUserAvailability(thursday),
    friday: transformToUserAvailability(friday),
    saturday: transformToUserAvailability(saturday),
    sunday: transformToUserAvailability(sunday),
  } satisfies Record<string, UserAvailability>;

  const availableDayCount = Object.values(availability).filter(
    (dayAvailability) => dayAvailability.isAvailable
  ).length;

  const availabilitySummary =
    availableDayCount > 0
      ? `Availability saved for ${availableDayCount} day${
          availableDayCount === 1 ? "" : "s"
        } in ${timezone}.`
      : `No days marked as available in ${timezone}.`;

  try {
    return {
      success: true,
      message: "Availability saved successfully!",
      availabilitySummary,
    };
  } catch (error) {
    console.error("Error saving availability:", error);
    return {
      success: false,
      error: "Unable to save availability. Please try again later.",
    };
  }
}
