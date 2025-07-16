"use server";

import { createFirebaseUserProviderDAL } from "@/lib/dal";
import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";
import { userProfileSchema } from "@/lib/schemas";
import { z } from "zod";

export async function firebaseCreateProviderProfileAction(
  formData: z.infer<typeof userProfileSchema>
) {
  try {
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const db = getFirestore(firebaseServerApp);
    const { success, error, data } = userProfileSchema.safeParse(formData);

    if (!success) {
      return {
        success: false,
        error:
          "We encountered an error while creating your profile. Please verify that the data you provided is correct.",
        details: error,
      };
    }

    return await createFirebaseUserProviderDAL(data, db);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to update user metadata";
    // Handle errors from Firebase authentication/initialization
    return {
      success: false,
      error: `Failed to create provider profile: ${errorMessage}`,
    };
  }
}
