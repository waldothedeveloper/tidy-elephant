"use server";

import * as v from "valibot";

import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";
import type { UserAvailability } from "@/features/onboarding/inngest/functions";
import { availabilitySchema } from "@/app/onboarding/select-availability/availability-schema";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { getUserProfileDAL } from "@/lib/dal/onboarding/user-profile";
import { inngest } from "@/lib/inngest/client";

type AvailabilityFormData = {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
};

type SaveAvailabilityInput = v.InferInput<typeof availabilitySchema>;

interface SaveAvailabilityResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function saveAvailabilityAction(
  formData: SaveAvailabilityInput
): Promise<SaveAvailabilityResult> {
  let clerkUserId: string;
  try {
    clerkUserId = await enforceAuthProvider();
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

  const availabilityData = validationResult.output;
  const {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    timezone,
  }: {
    monday: AvailabilityFormData;
    tuesday: AvailabilityFormData;
    wednesday: AvailabilityFormData;
    thursday: AvailabilityFormData;
    friday: AvailabilityFormData;
    saturday: AvailabilityFormData;
    sunday: AvailabilityFormData;
    timezone: (typeof US_TIMEZONE_IDENTIFIERS)[number];
  } = availabilityData;

  //  call the database to get the basic info from the user, specifically, their name and email
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

  try {
    const resultFromInngest = await inngest.send({
      name: "onboarding/create-calendar-managed-user",
      data: {
        clerkUserId,
        email: userProfileData.email,
        name: `${userProfileData.firstname} ${userProfileData.lastname}`,
        timezone,
        availability: {
          monday: transformToUserAvailability(monday),
          tuesday: transformToUserAvailability(tuesday),
          wednesday: transformToUserAvailability(wednesday),
          thursday: transformToUserAvailability(thursday),
          friday: transformToUserAvailability(friday),
          saturday: transformToUserAvailability(saturday),
          sunday: transformToUserAvailability(sunday),
        },
      },
    });

    console.log(`resultFromInngest: ${JSON.stringify(resultFromInngest)}`);
    return {
      success: true,
      message: "Availability saved successfully!",
    };
  } catch (error) {
    console.error("Error saving availability:", error);
    return {
      success: false,
      error: "Unable to save availability. Please try again later.",
    };
  }
}
