import "server-only";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/user-schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

type UserProfile = {
  email: string;
  firstname: string;
  lastname: string;
};

export const getUserProfileDAL = cache(
  async (): Promise<UserProfile | null> => {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({
        email: usersTable.email,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
      })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    return user ?? null;
  }
);
