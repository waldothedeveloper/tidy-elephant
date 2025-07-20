import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase/clientApp";
import { signInWithCustomToken } from "firebase/auth";
import { useAuth } from "@clerk/nextjs";

export const useFirebaseAuth = () => {
  const { getToken, userId } = useAuth();
  const [authError, setAuthError] = useState<unknown>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const signInToFirebaseWithClerk = async () => {
      if (!userId) return;

      try {
        /* ***
          CLERK AUTH:
          This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute.      
          Tokens can only be generated if the user is signed in.
      *** */
        const token = await getToken({ template: "integration_firebase" });

        if (!token) {
          throw new Error("Failed to retrieve Firebase token from Clerk");
        }
        const userCredentials = await signInWithCustomToken(auth, token || "");
        if (userCredentials.user) {
          const fireIDToken = await userCredentials.user.getIdToken();

          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000); // 1 hour

          document.cookie = [
            `__firebase__session=${fireIDToken}`,
            `expires=${expirationDate.toUTCString()}`,
            "path=/onboarding",
            ...(window.location.protocol === "https:" ? ["secure"] : []),
            "SameSite=Strict",
          ].join("; ");

          setIsAuthenticated(true);
        }
      } catch (error) {
        setAuthError(error);
        // Clear the Firebase session cookie on error
        document.cookie = [
          "__firebase__session=",
          "expires=Thu, 01 Jan 1970 00:00:00 UTC",
          "path=/onboarding",
          ...(window.location.protocol === "https:" ? ["secure"] : []),
          "SameSite=Strict",
        ].join("; ");
      }
    };

    signInToFirebaseWithClerk();
  }, [getToken, userId]);

  return { authError, isAuthenticated };
};
