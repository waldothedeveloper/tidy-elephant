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
        const userCredentials = await signInWithCustomToken(auth, token || "");

        if (userCredentials.user) {
          const fireIDToken = await userCredentials.user.getIdToken();

          // We could use js-cookie or similar later on for more robust cookie handling: https://www.npmjs.com/package/js-cookie
          document.cookie = `__firebase__session=${fireIDToken}; path=/; secure; SameSite=Strict`;
          setIsAuthenticated(true);
        }
      } catch (error) {
        setAuthError(error);
        document.cookie = `__firebase__session=; path=/; secure; SameSite=Strict`;
      }
    };

    signInToFirebaseWithClerk();
  }, [getToken, userId]);

  return { authError, isAuthenticated };
};
