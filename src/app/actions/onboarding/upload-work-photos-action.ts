"use server";

import * as v from "valibot";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { put } from "@vercel/blob";
import { workPhotosUploadSchema } from "@/app/onboarding/upload-work-photos/work-photos-schema";
import { saveProviderWorkPhotosDAL } from "@/lib/dal/onboarding/work-photos";

export async function uploadWorkPhotosAction(formData: FormData) {
  try {
    // 1. AUTHENTICATE FIRST - Check auth before any logic
    const userId = await enforceAuthProvider();

    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo-") && value instanceof File) {
        files.push(value);
      }
    }

    // 2. VALIDATE ALL INPUTS - Use safeParse, never parse
    const validationResult = v.safeParse(workPhotosUploadSchema, {
      photos: files,
    });
    if (!validationResult.success) {
      const firstError = validationResult.issues?.[0]?.message;
      return {
        success: false,
        message: firstError || "Invalid files uploaded",
      };
    }

    const validFiles = validationResult.output.photos;

    // 3. TRY/CATCH EVERYTHING - Wrap all external calls
    const uploadPromises = validFiles.map(async (file) => {
      const filename = `work-photos/${userId}/${file.name}`;
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });
      return blob.url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    // Save URLs to database using DAL
    const saveResult = await saveProviderWorkPhotosDAL(uploadedUrls);
    
    if (!saveResult.success) {
      return {
        success: false,
        message: saveResult.error || "Failed to save photos to database",
      };
    }

    return {
      success: true,
      message: "Work photos uploaded successfully",
    };
  } catch (error) {
    // 4. LOG ERRORS SAFELY - Never expose internal details to client
    console.error("Upload work photos error:", error);

    if (error instanceof Error) {
      if (
        error.name === "AuthenticationError" ||
        error.name === "AuthorizationError"
      ) {
        return {
          success: false,
          message: "You must be authenticated to perform this action.",
        };
      }
    }

    // 5. USE GENERIC ERROR MESSAGES - Don't leak validation details
    return {
      success: false,
      message: "Failed to upload work photos. Please try again.",
    };
  }
}
