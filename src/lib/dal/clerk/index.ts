import "server-only";

import { User, auth, clerkClient, currentUser } from "@clerk/nextjs/server";

// Import Twilio functions from separate module
export {
  lookupTwilioPhoneNumberDAL,
  sendTwilioVerificationCodeDAL,
  verifyTwilioCodeDAL,
} from "@/lib/dal/twilio";

/*

  !!!ABOUT ENFORCING AUTHENTICATION FOR ANY DAL OPERATIONS
  We enforce authentication for any DAL operations to ensure that only authenticated users can access or manipulate data.
  It is better here because any server action or API endpoint could FORGET to enforce authentication, leading to potential security issues.
  By enforcing authentication at the DAL level, we ensure that all database operations are secure and that
  only authorized users can perform actions on the database.

*/

class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export const enforceAuth = async (): Promise<User["id"]> => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }
  return userId;
};

// users that are not providers should not be able to access provider DAL functions
export const enforceAuthProvider = async (): Promise<User["id"]> => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }

  const user = await currentUser();
  if (!user?.privateMetadata?.isAProvider) {
    throw new AuthorizationError("User is not a provider");
  }
  return userId;
};

// *** CLERK DAL FUNCTIONS ***
export async function addClerkProviderMetadataDAL() {
  const userId = await enforceAuth();
  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        isAProvider: true,
        onboardingComplete: false,
      },
    });
    return {
      success: true,
      message: "User metadata updated successfully.",
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred trying to update user metadata";
    return {
      success: false,
      message: `There was an error updating the user metadata. ${errorMessage}`,
    };
  }
}
