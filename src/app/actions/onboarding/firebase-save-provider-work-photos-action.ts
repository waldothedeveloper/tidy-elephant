"use server";

import { OperationResult, createErrorResponse } from "@/types/api-responses";

import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { saveFirebaseProviderWorkPhotosDAL } from "@/lib/dal/firebase";
import { workPhotosSchema } from "@/lib/schemas";
import { getFirestore } from "firebase/firestore";
import { z } from "zod";

export async function firebaseSaveProviderWorkPhotosAction(
  data: z.infer<typeof workPhotosSchema>
): Promise<OperationResult> {
  try {
    // 1. AUTHENTICATE FIRST - Check auth before any logic
    // (This is handled by the DAL function)

    // 2. VALIDATE ALL INPUTS - Use safeParse(), never parse()
    const validationResult = workPhotosSchema.safeParse(data);
    if (!validationResult.success) {
      return createErrorResponse("Invalid work photos data provided");
    }

    // 3. SANITIZE INPUTS - Clean data before validation
    const sanitizedData = {
      workPhotos: validationResult.data.workPhotos.map((url) => url.trim()),
    };

    // 4. TRY/CATCH EVERYTHING - Wrap all external calls
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const db = getFirestore(firebaseServerApp);
    const result = await saveFirebaseProviderWorkPhotosDAL(
      sanitizedData,
      db
    );

    // 5. RETURN CONSISTENT TYPES - Use types from api-responses.ts
    return result;
  } catch (error) {
    // 6. LOG ERRORS SAFELY - Never expose internal details to client
    console.error("Server action error saving work photos:", error);

    // 7. USE GENERIC ERROR MESSAGES - Don't leak validation details
    return createErrorResponse("Failed to save work photos");
  }
}
