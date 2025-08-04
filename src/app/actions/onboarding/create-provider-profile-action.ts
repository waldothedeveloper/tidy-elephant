"use server";

// import { createFirebaseUserProviderDAL } from "@/lib/dal/clerk";

export async function createProviderProfileAction(formData: FormData) {
  try {
    // return await createFirebaseUserProviderDAL(formData);
    return `ok`;
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
