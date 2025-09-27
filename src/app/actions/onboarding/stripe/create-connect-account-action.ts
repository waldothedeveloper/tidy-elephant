"use server";

import * as v from "valibot";

import { enforceAuthProvider } from "@/lib/dal/clerk";
import { stripe } from "@/lib/stripe/index";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";
import type Stripe from "stripe";

// Minimal validation schemas to ensure we only forward expected fields
const addressSchema = v.object({
  line1: v.optional(v.string()),
  line2: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postal_code: v.optional(v.string()),
  country: v.optional(v.literal("US")),
});

const businessProfileSchema = v.object({
  name: v.optional(v.string()),
  product_description: v.optional(v.string()),
  support_email: v.optional(v.string()),
  support_phone: v.optional(v.string()),
  support_address: v.optional(addressSchema),
});

const companySchema = v.object({
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(addressSchema),
  structure: v.optional(
    v.picklist([
      "sole_proprietorship",
      "private_partnership",
      "single_member_llc",
      "multi_member_llc",
      "private_corporation",
    ])
  ),
  tax_id: v.optional(v.string()),
});

const individualSchema = v.object({
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(addressSchema),
});

const stripeSeedSchema = v.object({
  country: v.literal("US"),
  email: v.optional(v.string()),
  business_type: v.picklist(["company", "individual"]),
  business_profile: businessProfileSchema,
  company: v.optional(companySchema),
  individual: v.optional(individualSchema),
});

type StripeSeed = v.InferInput<typeof stripeSeedSchema>;

export async function createStripeConnectAccount(
  seed: StripeSeed
): Promise<ApiResponse<{ accountId: string }>> {
  // 1. Authenticate provider
  try {
    await enforceAuthProvider();
  } catch {
    return createErrorResponse({
      message: "Authentication required. Please sign in and try again.",
    });
  }

  // 2. Validate input
  const validation = v.safeParse(stripeSeedSchema, seed);
  console.log("validation: ", validation);
  if (!validation.success) {
    return createErrorResponse({
      message: "Invalid account information provided.",
    });
  }

  const data = validation.output;

  // 3. Build Stripe create params (sanitize null/undefined)
  const params: Stripe.AccountCreateParams = {
    country: "US",
    email: data.email,
    business_type: data.business_type,
    business_profile: {
      name: data.business_profile.name,
      product_description: data.business_profile.product_description,
      support_email: data.business_profile.support_email,
      support_phone: data.business_profile.support_phone,
      support_address: data.business_profile.support_address,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    controller: {
      stripe_dashboard: { type: "express" },
      fees: { payer: "application" },
      losses: { payments: "application" },
    },
  };

  if (data.business_type === "company" && data.company) {
    params.company = {
      name: data.company.name,
      phone: data.company.phone,
      address: data.company.address as Stripe.AddressParam | undefined,
      // Omit structure to avoid country-specific invalid values (Connect will collect it)
      tax_id: data.company.tax_id,
    };
  }

  if (data.business_type === "individual" && data.individual) {
    params.individual = {
      first_name: data.individual.first_name,
      last_name: data.individual.last_name,
      email: data.individual.email,
      phone: data.individual.phone,
      address: data.individual.address as Stripe.AddressParam | undefined,
    };
  }

  // 4. Create account with Stripe
  try {
    const account = await stripe.accounts.create(params);
    console.log("account Stripe error: ", account);
    return createSuccessResponse({ accountId: account.id });
  } catch (err) {
    console.error("Stripe account creation error:", err);
    return createErrorResponse({
      message: "Unable to create payment account. Please try again later.",
    });
  }
}
