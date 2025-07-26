"use server";

import { auth } from "@clerk/nextjs/server";
import { createErrorResponse } from "@/types/api-responses";
import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { getFirebaseUserByIdDAL } from "@/lib/dal/firebase";
import { getFirestore } from "firebase/firestore";

export async function getFirebaseUserByClerkIDAction() {
  const { userId } = await auth();
  if (!userId) {
    return createErrorResponse("Authentication required to save categories");
  }

  try {
    // Get authenticated Firebase app
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const db = getFirestore(firebaseServerApp);

    // Call the DAL function to get user by Clerk ID
    const user = await getFirebaseUserByIdDAL(db);
    console.log("firebaseuser: ", user);

    if (!user) {
      return createErrorResponse("User not found");
    }
    // WE will NEED A DTO here so we don't return the full user object
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return createErrorResponse("Failed to fetch user data");
  }
}
