"use server";

/* ***
=== SERVER ACTION SECURITY RULES ===
COPY/PASTE THIS TO ALL SERVER ACTIONS:

1. ✅ NEVER THROW EXCEPTIONS - Always return error objects
2. ✅ AUTHENTICATE FIRST - Check auth before any logic  
3. ✅ VALIDATE ALL INPUTS - Use safeParse(), never parse()
4. ✅ TRY/CATCH EVERYTHING - Wrap all external calls
5. ✅ LOG ERRORS SAFELY - Never expose internal details to client
6. ✅ RETURN CONSISTENT TYPES - Always same interface structure
7. ✅ USE GENERIC ERROR MESSAGES - Don't leak validation details
8. ✅ CHECK PERMISSIONS - Verify user can perform this action
*** */

import * as v from "valibot";

import { InferInput } from "valibot";
import { auth } from "@clerk/nextjs/server";
import { userProfileSchema } from "@/app/onboarding/basic-info/profile-schema";

interface ProfileResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createProviderProfileAction(
  formData: InferInput<typeof userProfileSchema>
): Promise<ProfileResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  const validationResult = v.safeParse(userProfileSchema, formData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid profile information provided.",
    };
  }

  try {
    // TODO: Implement actual profile creation logic
    // This should create both user profile and provider profile records

    return {
      success: true,
      message: "Profile created successfully!",
    };
  } catch (error) {
    console.error("Error creating provider profile:", error);
    return {
      success: false,
      error: "Unable to create profile. Please try again later.",
    };
  }
}
