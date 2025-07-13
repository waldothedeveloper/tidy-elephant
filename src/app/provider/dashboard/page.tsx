"use client";

import { SignedIn, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase/clientApp";
import { signInWithCustomToken } from "firebase/auth";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [authError, setAuthError] = useState<unknown>(null);

  useEffect(() => {
    const signInToFirebaseWithClerk = async () => {
      /* ***
          CLERK AUTH:
          This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute.      
          Tokens can only be generated if the user is signed in.
      *** */
      try {
        const token = await getToken({ template: "integration_firebase" });
        const userCredentials = await signInWithCustomToken(auth, token || "");

        if (userCredentials.user) {
          const fireIDToken = await userCredentials.user.getIdToken();
          // TODO: we could use js-cookie or similar later on for more robust cookie handling: https://www.npmjs.com/package/js-cookie
          document.cookie = `__firebase__session=${fireIDToken}; path=/dashboard; secure; SameSite=Strict`;
        } else {
          // console.error("Failed to sign in to Firebase");
          document.cookie = `__firebase__session=; path=/dashboard; secure; SameSite=Strict`;
        }
      } catch (error) {
        setAuthError(error);
        document.cookie = `__firebase__session=; path=/dashboard; secure; SameSite=Strict`;
      }
    };

    if (userId) {
      signInToFirebaseWithClerk();
    }
  }, [getToken, userId]);

  if (authError) {
    throw new Error(`Failed to sign in to Firebase: ${authError}`);
  }

  return (
    <div className="flex flex-col text-6xl font-bold text-foreground text-center items-center justify-center min-h-screen">
      PROVIDER DASHBOARD
      <div className="mt-8">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
