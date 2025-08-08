"use server";

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

import * as v from "valibot";

import {
  categoriesFormSchema,
  type CategoriesFormInput,
} from "@/app/onboarding/select-categories/categories-schema";
import { saveProviderCategoriesDAL } from "@/lib/dal/onboarding/categories";
import { auth } from "@clerk/nextjs/server";

interface ProviderCategoriesResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function saveProviderCategoriesAction(
  formData: CategoriesFormInput
): Promise<ProviderCategoriesResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in and try again.",
    };
  }

  const validationResult = v.safeParse(categoriesFormSchema, formData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid category selection provided.",
    };
  }

  try {
    const result = await saveProviderCategoriesDAL(validationResult.output);
    return result;
  } catch (error) {
    console.error("Error saving provider categories:", error);
    return {
      success: false,
      error: "Unable to save categories. Please try again later.",
    };
  }
}
