import "server-only";

import { Firestore, addDoc, collection } from "firebase/firestore";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import { userProfileSchema } from "../schemas";
import { z } from "zod";

// import { cache } from "react";

/*

  !!!ABOUT ENFORCING AUTHENTICATION FOR ANY DAL OPERATIONS
  We enforce authentication for any DAL operations to ensure that only authenticated users can access or manipulate data.
  It is better here because any server action or API endpoint could FORGET to enforce authentication, leading to potential security issues.
  By enforcing authentication at the DAL level, we ensure that all database operations are secure and that
  only authorized users can perform actions on the database.

*/

const enforceAuth = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
};

export async function addClerkProviderMetadataDAL() {
  const userId = await enforceAuth();
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        isAProvider: true,
        onboardingComplete: false,
      },
    });
    return { success: true, message: res.publicMetadata };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred trying to update user metadata";
    return {
      success: false,
      error: `There was an error updating the user metadata. ${errorMessage}`,
    };
  }
}

export async function createFirebaseUserProviderDAL(
  data: z.infer<typeof userProfileSchema>,
  authenticatedFirebaseDB: Firestore
) {
  await enforceAuth();
  const clerkUser = await currentUser();

  try {
    const docRef = await addDoc(collection(authenticatedFirebaseDB, "Users"), {
      createdAt: new Date(),
      updatedAt: null,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        about: data.about,
        photo: data.photo,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
      },
      isAProvider: true,
      roles: {
        provider: true,
      },
      providerDetails: {
        isOnboarded: false,
        isActive: false,
        isPhoneVerified: false,
      },
      providerRatings: {
        averageRating: 0,
        totalReviews: 0,
      },
      providerReviews: [],
    });

    if (!docRef.id) {
      throw new Error("Failed to create provider profile in Firestore");
    }

    return { success: true, message: "Provider profile created successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred trying to update user metadata";
    return {
      success: false,
      error: `Failed to create provider profile: ${errorMessage}`,
    };
  }
}
