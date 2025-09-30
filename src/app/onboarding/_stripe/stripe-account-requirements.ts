import type Stripe from "stripe";

type StripeAccountRequirementStatus = {
  currentlyDue: string[];
  eventuallyDue: string[];
  hasOutstandingRequirements: boolean;
};

export const getStripeAccountRequirementStatus = (
  account: Stripe.Account
): StripeAccountRequirementStatus => {
  const requirements = account.requirements ?? null;
  const currentlyDue = requirements?.currently_due ?? [];
  const eventuallyDue = requirements?.eventually_due ?? [];

  const hasOutstandingRequirements =
    currentlyDue.length > 0 || eventuallyDue.length > 0;

  return {
    currentlyDue,
    eventuallyDue,
    hasOutstandingRequirements,
  };
};
