import "server-only";

import type {
  ProviderOnboardingFlowMutationResult,
  ProviderOnboardingStepName,
  ProviderOnboardingStepStatus,
} from "@/types/onboarding";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { providerOnboardingFlowTable } from "@/lib/db/onboarding-schema";
import { usersTable } from "@/lib/db/user-schema";

type InitializeOnboardingFlowResult = ProviderOnboardingFlowMutationResult;

export type ProviderOnboardingFlowStep = {
  id: string;
  stepName: ProviderOnboardingStepName;
  stepDescription: string;
  status: ProviderOnboardingStepStatus;
  sortOrder: number;
  completedAt: Date | null;
};

export async function initializeProviderOnboardingFlowDAL(): Promise<InitializeOnboardingFlowResult> {
  try {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found in database.",
      };
    }

    const existingFlow = await db
      .select({ id: providerOnboardingFlowTable.id })
      .from(providerOnboardingFlowTable)
      .where(eq(providerOnboardingFlowTable.userId, user.id))
      .limit(1);

    if (existingFlow.length > 0) {
      return {
        success: true,
        message: "The logged in user already has an onboarding progress state.",
      };
    }

    await db.insert(providerOnboardingFlowTable).values([
      {
        userId: user.id,
        stepName: "Build Profile",
        stepDescription: "Add your info, services, and photos.",
        status: "current",
        sortOrder: 1,
      },
      {
        userId: user.id,
        stepName: "Provider Activation Fee",
        stepDescription: "Helps cover the cost of verification & account setup",
        status: "upcoming",
        sortOrder: 2,
      },
      {
        userId: user.id,
        stepName: "Trust & Safety",
        stepDescription: "Verify your identity & submit the background check.",
        status: "upcoming",
        sortOrder: 3,
      },
    ]);

    return {
      success: true,
      message:
        "A new onboarding process has been created successfully for the currently logged in user.",
    };
  } catch (error) {
    console.error("initializeProviderOnboardingFlowDAL error:", error);
    return {
      success: false,
      error: "Failed to initialize onboarding flow.",
    };
  }
}

type GetOnboardingFlowResult =
  | { success: true; data: ProviderOnboardingFlowStep[] }
  | { success: false; error: string };

export async function getProviderOnboardingFlowDAL(): Promise<GetOnboardingFlowResult> {
  try {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found in database.",
      };
    }

    const rows = await db
      .select({
        id: providerOnboardingFlowTable.id,
        stepName: providerOnboardingFlowTable.stepName,
        stepDescription: providerOnboardingFlowTable.stepDescription,
        status: providerOnboardingFlowTable.status,
        sortOrder: providerOnboardingFlowTable.sortOrder,
        completedAt: providerOnboardingFlowTable.completedAt,
      })
      .from(providerOnboardingFlowTable)
      .where(eq(providerOnboardingFlowTable.userId, user.id))
      .orderBy(asc(providerOnboardingFlowTable.sortOrder));

    if (rows.length === 0) {
      return {
        success: false,
        error: "Onboarding steps not initialized for this user.",
      };
    }

    return {
      success: true,
      data: rows.map((row) => ({
        ...row,
        completedAt: row.completedAt ?? null,
      })),
    };
  } catch (error) {
    console.error("getProviderOnboardingFlowDAL error:", error);
    return {
      success: false,
      error: "Failed to fetch onboarding progress.",
    };
  }
}

type AdvanceOnboardingFlowResult = ProviderOnboardingFlowMutationResult;

export async function advanceProviderOnboardingToTrustSafetyDAL(): Promise<AdvanceOnboardingFlowResult> {
  try {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found in database.",
      };
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(providerOnboardingFlowTable)
        .set({
          status: "complete",
          completedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(providerOnboardingFlowTable.userId, user.id),
            eq(providerOnboardingFlowTable.sortOrder, 1)
          )
        );

      await tx
        .update(providerOnboardingFlowTable)
        .set({
          status: "current",
          completedAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(providerOnboardingFlowTable.userId, user.id),
            eq(providerOnboardingFlowTable.sortOrder, 2)
          )
        );
    });

    return {
      success: true,
      message: "Onboarding progress updated successfully.",
    };
  } catch (error) {
    console.error("advanceProviderOnboardingToTrustSafetyDAL error:", error);
    return {
      success: false,
      error: "Failed to update onboarding progress.",
    };
  }
}
