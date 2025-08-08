import "server-only";

import {
  addressesTable,
  businessAddressesTable,
} from "@/lib/db/address-schema";
import { and, eq, isNull } from "drizzle-orm";

import type { BusinessInfoFormOutput } from "@/app/onboarding/business-info/business-info-schema";
import { db } from "@/lib/db";
import { enforceAuthProvider } from "@/lib/dal/clerk";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";

type AddressInfo = {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
};

async function findOrCreateAddress(addressInfo: AddressInfo): Promise<string> {
  const addressLine2Condition = addressInfo.addressLine2
    ? eq(addressesTable.addressLine2, addressInfo.addressLine2)
    : isNull(addressesTable.addressLine2);

  const [existingAddress] = await db
    .select({ id: addressesTable.id })
    .from(addressesTable)
    .where(
      and(
        eq(addressesTable.addressLine1, addressInfo.addressLine1),
        addressLine2Condition,
        eq(addressesTable.city, addressInfo.city),
        eq(addressesTable.state, addressInfo.state),
        eq(addressesTable.postalCode, addressInfo.postalCode),
        eq(addressesTable.type, "work")
      )
    )
    .limit(1);

  if (existingAddress) {
    return existingAddress.id;
  }

  const [newAddress] = await db
    .insert(addressesTable)
    .values({
      addressLine1: addressInfo.addressLine1,
      addressLine2: addressInfo.addressLine2,
      city: addressInfo.city,
      state: addressInfo.state,
      postalCode: addressInfo.postalCode,
      country: "US",
      type: "work",
    })
    .returning({ id: addressesTable.id });

  return newAddress.id;
}

export async function saveBusinessInfoDAL(
  businessInfo: BusinessInfoFormOutput
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const clerkUserId = await enforceAuthProvider();

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    if (!user) {
      throw new Error("User not found in database");
    }

    const addressId = await findOrCreateAddress({
      addressLine1: businessInfo.addressLine1,
      addressLine2: businessInfo.addressLine2 || null,
      city: businessInfo.city,
      state: businessInfo.state,
      postalCode: businessInfo.postalCode,
    });

    const [providerProfile] = await db
      .insert(providerProfilesTable)
      .values({
        userId: user.id,
        businessType: businessInfo.businessType,
        businessName: businessInfo.businessName,
        businessPhone: businessInfo.businessPhone,
        employerEin: businessInfo.employerEin,
      })
      .onConflictDoUpdate({
        target: providerProfilesTable.userId,
        set: {
          businessType: businessInfo.businessType,
          businessName: businessInfo.businessName,
          businessPhone: businessInfo.businessPhone,
          employerEin: businessInfo.employerEin,
          updatedAt: new Date(),
        },
      })
      .returning({ id: providerProfilesTable.id });

    const [existingBusinessAddress] = await db
      .select()
      .from(businessAddressesTable)
      .where(
        and(
          eq(businessAddressesTable.providerProfileId, providerProfile.id),
          eq(businessAddressesTable.addressId, addressId),
          eq(businessAddressesTable.role, "work")
        )
      )
      .limit(1);

    if (!existingBusinessAddress) {
      await db.insert(businessAddressesTable).values({
        providerProfileId: providerProfile.id,
        addressId: addressId,
        role: "work",
        isPrimary: true,
      });
    }

    return {
      success: true,
      message: "Business information saved successfully",
    };
  } catch (error) {
    console.error("Error in saveBusinessInfoDAL:", error);
    return {
      success: false,
      error: "Failed to save business information",
    };
  }
}
