"use server";

import * as v from "valibot";

import {
  imageFileSchema,
  workPhotoUrlsSchema,
} from "@/app/onboarding/(provider-flow)/upload-work-photos/work-photos-schema";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { put } from "@vercel/blob";
import { saveProviderWorkPhotosDAL } from "@/lib/dal/onboarding/work-photos";

export async function uploadSingleWorkPhotoAction(formData: FormData) {
  try {
    const userId = await enforceAuthProvider();

    const photoEntry = formData.get("photo");
    if (!(photoEntry instanceof File)) {
      return {
        success: false,
        message: "A photo is required",
      };
    }

    const validationResult = v.safeParse(imageFileSchema, photoEntry);
    if (!validationResult.success) {
      const firstError = validationResult.issues?.[0]?.message;
      return {
        success: false,
        message: firstError || "Invalid photo provided",
      };
    }

    const validFile = validationResult.output;

    const filename = `work-photos/${userId}/${validFile.name}`;
    const blob = await put(filename, validFile, {
      access: "public",
      addRandomSuffix: true,
    });

    return {
      success: true,
      url: blob.url,
    };
  } catch (error) {
    console.error("Upload single work photo error:", error);

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

    return {
      success: false,
      message: "Failed to upload work photo. Please try again.",
    };
  }
}

type FinalizeWorkPhotosActionInput = {
  urls: string[];
};

export async function finalizeWorkPhotosAction({
  urls,
}: FinalizeWorkPhotosActionInput) {
  try {
    await enforceAuthProvider();

    const validationResult = v.safeParse(workPhotoUrlsSchema, urls);
    if (!validationResult.success) {
      const firstError = validationResult.issues?.[0]?.message;
      return {
        success: false,
        message: firstError || "Invalid photo URLs provided",
      };
    }

    const validUrls = validationResult.output;

    const saveResult = await saveProviderWorkPhotosDAL(validUrls);

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
    console.error("Finalize work photos error:", error);

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

    return {
      success: false,
      message: "Failed to save work photos. Please try again.",
    };
  }
}
