"use server";

import { and, eq } from "drizzle-orm";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { db } from "@/lib/db";
import {
  addressesTable,
  businessAddressesTable,
} from "@/lib/db/address-schema";
import { providerProfilesTable } from "@/lib/db/provider-schema";
import { usersTable } from "@/lib/db/user-schema";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

type StripeBusinessType = "individual" | "company";

type StripeAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: "US";
};

type StripeCompanyStructure =
  | "sole_proprietorship"
  | "private_partnership"
  | "single_member_llc"
  | "multi_member_llc"
  | "private_corporation";

type StripeCompany = {
  name?: string;
  phone?: string;
  address?: StripeAddress;
  structure?: StripeCompanyStructure;
  tax_id?: string;
};

type StripeIndividual = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: StripeAddress;
};

type StripeBusinessProfile = {
  name?: string;
  product_description?: string;
  support_email?: string;
  support_phone?: string;
  support_address?: StripeAddress;
};

type StripeAccountCreateSeed = {
  country: "US";
  email?: string;
  business_type: StripeBusinessType;
  business_profile: StripeBusinessProfile;
  company?: StripeCompany;
  individual?: StripeIndividual;
  capabilities: {
    card_payments: { requested: true };
    transfers: { requested: true };
  };
};

type ProviderInfo = {
  stripe: StripeAccountCreateSeed;
  source: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      isPhoneVerified: boolean;
      profileImage: string | null;
    };
    provider: {
      bio: string | null;
      businessType: StripeCompanyStructure | "other" | null;
      businessName: string | null;
      businessPhone: string | null;
      employerEin: string | null;
    };
    address?: StripeAddress;
  };
};

const normalizeEin = (ein: string | null | undefined): string | undefined => {
  if (!ein) return undefined;
  const digits = ein.replace(/\D/g, "");
  return digits.length === 9 ? digits : undefined;
};

const pickSupportPhone = (
  businessPhone?: string | null,
  userPhone?: string | null,
  verified?: boolean
): string | undefined => {
  if (businessPhone) return businessPhone;
  if (verified && userPhone) return userPhone;
  return undefined;
};

export async function getProviderInfo(): Promise<ApiResponse<ProviderInfo>> {
  try {
    const clerkUserId = await enforceAuthProvider();

    const rows = await db
      .select({
        firstName: usersTable.firstname,
        lastName: usersTable.lastname,
        phone: usersTable.phone,
        email: usersTable.email,
        isPhoneVerified: usersTable.isPhoneVerified,
        profileImage: usersTable.profileImage,

        bio: providerProfilesTable.bio,
        businessType: providerProfilesTable.businessType,
        businessName: providerProfilesTable.businessName,
        businessPhone: providerProfilesTable.businessPhone,
        employerEin: providerProfilesTable.employerEin,

        addressLine1: addressesTable.addressLine1,
        addressLine2: addressesTable.addressLine2,
        city: addressesTable.city,
        state: addressesTable.state,
        postalCode: addressesTable.postalCode,
        country: addressesTable.country,
      })
      .from(usersTable)
      .leftJoin(
        providerProfilesTable,
        eq(usersTable.id, providerProfilesTable.userId)
      )
      .leftJoin(
        businessAddressesTable,
        and(
          eq(
            providerProfilesTable.id,
            businessAddressesTable.providerProfileId
          ),
          eq(businessAddressesTable.role, "work"),
          eq(businessAddressesTable.isPrimary, true)
        )
      )
      .leftJoin(
        addressesTable,
        eq(businessAddressesTable.addressId, addressesTable.id)
      )
      .where(eq(usersTable.clerkUserID, clerkUserId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return createErrorResponse({
        message: "Unable to retrieve provider information.",
      });
    }

    const address: StripeAddress | undefined = row.addressLine1
      ? {
          line1: row.addressLine1 ?? undefined,
          line2: row.addressLine2 ?? undefined,
          city: row.city ?? undefined,
          state: row.state ?? undefined,
          postal_code: row.postalCode ?? undefined,
          country: (row.country ?? "US") as "US",
        }
      : undefined;

    const hasBusinessData = Boolean(
      row.businessName || row.employerEin || row.businessType
    );
    const business_type: StripeBusinessType = hasBusinessData
      ? "company"
      : "individual";

    const company: StripeCompany | undefined =
      business_type === "company"
        ? {
            name: row.businessName ?? undefined,
            phone: row.businessPhone ?? undefined,
            address,
            structure:
              (row.businessType as StripeCompanyStructure | undefined) ??
              undefined,
            tax_id: normalizeEin(row.employerEin),
          }
        : undefined;

    const individual: StripeIndividual | undefined =
      business_type === "individual"
        ? {
            first_name: row.firstName ?? undefined,
            last_name: row.lastName ?? undefined,
            email: row.email ?? undefined,
            phone: row.isPhoneVerified ? (row.phone ?? undefined) : undefined,
            address: undefined,
          }
        : undefined;

    const supportPhone = pickSupportPhone(
      row.businessPhone,
      row.phone,
      row.isPhoneVerified
    );

    const computedName =
      (row.businessName
        ? row.businessName
        : `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim()) || undefined;
    const business_profile: StripeBusinessProfile = {
      name: computedName,
      product_description: row.bio ?? undefined,
      support_email: row.email ?? undefined,
      support_phone: supportPhone,
      support_address: address,
    };

    const stripeSeed: StripeAccountCreateSeed = {
      country: "US",
      email: row.email ?? undefined,
      business_type,
      business_profile,
      company,
      individual,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };

    const payload: ProviderInfo = {
      stripe: stripeSeed,
      source: {
        user: {
          firstName: row.firstName ?? null,
          lastName: row.lastName ?? null,
          email: row.email ?? null,
          phone: row.phone ?? null,
          isPhoneVerified: Boolean(row.isPhoneVerified),
          profileImage: row.profileImage ?? null,
        },
        provider: {
          bio: row.bio ?? null,
          businessType:
            (row.businessType as StripeCompanyStructure | "other" | null) ??
            null,
          businessName: row.businessName ?? null,
          businessPhone: row.businessPhone ?? null,
          employerEin: row.employerEin ?? null,
        },
        address,
      },
    };

    return createSuccessResponse(payload);
  } catch (error) {
    console.error("Error retrieving provider information:", error);
    return createErrorResponse({
      message:
        "Unable to retrieve provider information. Please try again later.",
    });
  }
}
