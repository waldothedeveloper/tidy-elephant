import "server-only";

import {
  DataOrError,
  OperationResult,
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-responses";
import {
  FirebaseUser,
  ProviderDetails,
  ProviderRatings,
  ProviderReview,
  ServiceCategory,
  UserProfile,
  UserRoles,
} from "@/types/user";
import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { enforceAuth, enforceAuthProvider } from "@/lib/dal/clerk";
import {
  userCategoriesSchema,
  userProfileSchema,
  workPhotosSchema,
} from "@/lib/schemas/index";

import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { dollarsToCents } from "@/lib/utils";
import { z } from "zod";

// *** FIRESTORE DAL FUNCTIONS ***
export async function createFirebaseUserProviderDAL(
  data: z.infer<typeof userProfileSchema>,
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  await enforceAuth();
  const clerkUser = await currentUser();

  try {
    const userProfile: UserProfile = {
      firstName: data.firstName,
      lastName: data.lastName,
      about: data.about,
      photo: data.photo,
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    };

    const userRoles: UserRoles = {
      provider: true,
    };

    const providerDetails: ProviderDetails = {
      isOnboarded: false,
      isActive: false,
      isPhoneVerified: false,
      categories: [],
      workPhotos: [],
    };

    const providerRatings: ProviderRatings = {
      averageRating: 0,
      totalReviews: 0,
    };

    const providerReviews: ProviderReview[] = [];

    const firebaseUser: Omit<FirebaseUser, "id"> = {
      createdAt: new Date(),
      updatedAt: null,
      clerkUserID: clerkUser?.id || "",
      isAProvider: true,
      profile: userProfile,
      roles: userRoles,
      providerDetails,
      providerRatings,
      providerReviews,
    };

    const docRef = await addDoc(
      collection(authenticatedFirebaseDB, "Users"),
      firebaseUser
    );

    if (!docRef.id) {
      throw new Error("Failed to create provider profile in Firestore");
    }

    return createSuccessResponse("Provider profile created successfully.");
  } catch (error) {
    console.error("Error creating provider profile:", error);
    return createErrorResponse("Failed to create provider profile");
  }
}

export const getFirebaseProviderCategoriesDAL = cache(
  async (
    authenticatedFirebaseDB: Firestore
  ): Promise<DataOrError<ServiceCategory[]>> => {
    await enforceAuth();

    try {
      const categoriesRef = collection(
        authenticatedFirebaseDB,
        "Provider_Categories"
      );
      const snapshot = await getDocs(categoriesRef);

      const categories = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Ensure the data matches our expected structure
        const category: ServiceCategory = {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          isActive: data.isActive ?? true,
        };

        return category;
      });

      // Filter to only return active categories
      return categories.filter((category) => category.isActive);
    } catch (error) {
      console.error("Error fetching provider categories:", error);

      return createErrorResponse("Failed to retrieve provider categories");
    }
  }
);

export async function getFirebaseUserByIdDAL(
  authenticatedFirebaseDB: Firestore
): Promise<DataOrError<FirebaseUser | null>> {
  const userId = await enforceAuth();

  try {
    const querySnapshot = await getDocs(
      query(
        collection(authenticatedFirebaseDB, "Users"),
        where("clerkUserID", "==", userId)
      )
    );

    if (querySnapshot.empty) {
      return null;
    }

    // Should only be one user per clerkUserID
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Map Firestore data to FirebaseUser interface
    const firebaseUser: FirebaseUser = {
      id: userDoc.id,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || null,
      clerkUserID: userData.clerkUserID || "",
      isAProvider: userData.isAProvider || false,
      profile: {
        firstName: userData.profile?.firstName || "",
        lastName: userData.profile?.lastName || "",
        about: userData.profile?.about || "",
        photo: userData.profile?.photo || "",
        email: userData.profile?.email || "",
        phoneNumber: userData.profile?.phoneNumber,
        address: userData.profile?.address,
      },
      roles: userData.roles || {},
      providerDetails: userData.providerDetails,
      providerRatings: userData.providerRatings,
      providerReviews: userData.providerReviews || [],
      clientDetails: userData.clientDetails,
      bookingHistory: userData.bookingHistory || [],
      clientPreferences: userData.clientPreferences,
    };

    return firebaseUser;
  } catch (error) {
    console.error("Error fetching Firebase user by ID:", error);
    return createErrorResponse("Failed to retrieve user");
  }
}

export async function saveFirebaseProviderCategoriesDAL(
  data: z.infer<typeof userCategoriesSchema>,
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  const userId = await enforceAuthProvider();

  try {
    // First, find the user's document by clerkUserID
    const userQuery = query(
      collection(authenticatedFirebaseDB, "Users"),
      where("clerkUserID", "==", userId)
    );

    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return createErrorResponse(
        "User profile not found. Please complete your basic profile first."
      );
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(authenticatedFirebaseDB, "Users", userDoc.id);

    // Update the provider's categories in their providerDetails
    await updateDoc(userDocRef, {
      "providerDetails.categories": data.categories,
      updatedAt: new Date(),
    });

    return createSuccessResponse(
      `Successfully saved ${data.categories.length} service categories to your profile.`
    );
  } catch (error) {
    console.error("Error saving provider categories:", error);
    return createErrorResponse(
      "Failed to save service categories. Please try again."
    );
  }
}

export async function saveFirebaseProviderHourlyRateDAL(
  data: { hourlyRate: number },
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  const userId = await enforceAuthProvider();

  try {
    // First, find the user's document by clerkUserID
    const userQuery = query(
      collection(authenticatedFirebaseDB, "Users"),
      where("clerkUserID", "==", userId)
    );

    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return createErrorResponse(
        "User profile not found. Please complete your basic profile first."
      );
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(authenticatedFirebaseDB, "Users", userDoc.id);

    // Convert dollars to cents for storage
    const hourlyRateInCents = dollarsToCents(data.hourlyRate.toString());

    // Update the provider's hourly rate in their providerDetails (stored in cents)
    await updateDoc(userDocRef, {
      "providerDetails.hourlyRate": hourlyRateInCents,
      updatedAt: new Date(),
    });

    return createSuccessResponse(
      `Successfully set your hourly rate to $${data.hourlyRate} per hour.`
    );
  } catch (error) {
    console.error(
      "Error saving provider hourly rate during onboarding:",
      error
    );
    return createErrorResponse("Failed to save hourly rate. Please try again.");
  }
}

export async function saveFirebaseProviderWorkPhotosDAL(
  data: z.infer<typeof workPhotosSchema>,
  authenticatedFirebaseDB: Firestore
): Promise<OperationResult> {
  const userId = await enforceAuthProvider();

  try {
    // First, find the user's document by clerkUserID
    const userQuery = query(
      collection(authenticatedFirebaseDB, "Users"),
      where("clerkUserID", "==", userId)
    );

    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return createErrorResponse(
        "User profile not found. Please complete your basic profile first."
      );
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(authenticatedFirebaseDB, "Users", userDoc.id);

    // Update the provider's work photos in their providerDetails
    await updateDoc(userDocRef, {
      "providerDetails.workPhotos": data.workPhotos,
      updatedAt: new Date(),
    });

    return createSuccessResponse(
      `Successfully saved ${data.workPhotos.length} work photo${data.workPhotos.length === 1 ? "" : "s"} to your profile.`
    );
  } catch (error) {
    console.error("Error saving provider work photos:", error);
    return createErrorResponse("Failed to save work photos. Please try again.");
  }
}
