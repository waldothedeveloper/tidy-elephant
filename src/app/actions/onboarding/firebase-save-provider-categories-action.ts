/* ***
=== SERVER ACTION SECURITY RULES ===
COPY/PASTE THIS TO ALL SERVER ACTIONS:

1. ✅ NEVER THROW EXCEPTIONS - Always return error objects
   WHY: Thrown exceptions bypass security checks like rate limiting and expose internal stack traces

2. ✅ AUTHENTICATE FIRST - Check auth before any logic
   WHY: Prevents unauthorized users from consuming resources or accessing data

3. ✅ VALIDATE ALL INPUTS - Use safeParse(), never parse()
   WHY: parse() throws exceptions (breaks rule #1), safeParse() returns validation results safely

4. ✅ SANITIZE INPUTS - Clean data before validation
   WHY: Removes malicious characters, normalizes data, prevents injection attacks

5. ✅ RATE LIMIT EARLY - Check limits before expensive operations
   WHY: Prevents abuse, protects external APIs (like Twilio), reduces server costs

6. ✅ TRY/CATCH EVERYTHING - Wrap all external calls
   WHY: Third-party services can fail unexpectedly, prevents application crashes

7. ✅ LOG ERRORS SAFELY - Never expose internal details to client
   WHY: Internal errors reveal system architecture to attackers, helps debugging without security risk

8. ✅ RETURN CONSISTENT TYPES - Always same interface structure
   WHY: Frontend can handle responses predictably, prevents runtime TypeScript errors

9. ✅ USE GENERIC ERROR MESSAGES - Don't leak validation details
   WHY: Specific validation errors help attackers understand your system structure

10. ✅ CHECK PERMISSIONS - Verify user can perform this action
    WHY: Authentication ≠ Authorization. User might be logged in but lack permission for specific actions

11. ✅ USE ENVIRONMENT VARIABLES - Never hardcode sensitive data
    WHY: Environment variables keep secrets out of source code, allows different configs for dev/staging
    Use process.env.VARIABLE_NAME to access them
    Example: process.env.TWILIO_API_KEY
    Make sure to set these in your .env files or deployment environment
*** */

"use server";

import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-responses";

import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";
import { saveFirebaseProviderCategoriesDAL } from "@/lib/dal/clerk";
import { userCategoriesSchema } from "@/lib/schemas";
import { z } from "zod";

export async function firebaseSaveProviderCategoriesAction(
  formData: z.infer<typeof userCategoriesSchema>
) {
  // 1. AUTHENTICATE FIRST - Check auth before any logic
  const { userId } = await auth();
  if (!userId) {
    return createErrorResponse("Authentication required to save categories");
  }

  try {
    // 2. SANITIZE INPUTS - Clean data before validation
    const sanitizedData = {
      categories: Array.isArray(formData.categories)
        ? formData.categories
            .map((id) => (typeof id === "string" ? id.trim() : ""))
            .filter(Boolean)
        : [],
    };

    // 3. VALIDATE ALL INPUTS - Use safeParse(), never parse()
    const { success, data } = userCategoriesSchema.safeParse(sanitizedData);
    if (!success) {
      // 4. USE GENERIC ERROR MESSAGES - Don't leak validation details
      return createErrorResponse(
        "Invalid category selection. Please select at least one valid service category."
      );
    }

    // 5. TRY/CATCH EVERYTHING - Wrap all external calls
    let firebaseServerApp;
    let db;
    try {
      const authResult = await getAuthenticatedAppForUser();
      firebaseServerApp = authResult.firebaseServerApp;
      db = getFirestore(firebaseServerApp);
    } catch (authError) {
      // 6. LOG ERRORS SAFELY - Never expose internal details to client
      console.error("Firebase authentication failed:", authError);
      return createErrorResponse(
        "Unable to authenticate with database. Please try again."
      );
    }

    // Save categories using DAL function
    const result = await saveFirebaseProviderCategoriesDAL(data, db);

    // 7. RETURN CONSISTENT TYPES - Use types from api-responses
    if (!result.success) {
      return createErrorResponse(result.error);
    }

    return {
      ...createSuccessResponse(result.message),
      data: data.categories,
    };
  } catch (error) {
    // 8. LOG ERRORS SAFELY - Never expose internal details to client
    console.error("Unexpected error in firebaseSaveProviderCategoriesAction:", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // 9. USE GENERIC ERROR MESSAGES - Don't leak internal system details
    return createErrorResponse(
      "An unexpected error occurred while saving your categories. Please try again."
    );
  }
}
