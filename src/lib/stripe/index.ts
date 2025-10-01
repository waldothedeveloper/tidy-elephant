import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
  apiVersion: "2025-08-27.basil",
});

export const deleteStripeAccount = async (id: string) => {
  if (!id) throw new Error("Please provide a valid stripe account id");
  return await stripe.accounts.del(id);
};
