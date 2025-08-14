import { enforceAuthProvider } from "@/lib/dal/clerk";
import { stripe } from "@/lib/stripe/index";

export async function POST() {
  try {
    await enforceAuthProvider();

    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
    });

    return Response.json({ account: account.id });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error
    );
    return Response.json(
      {
        error:
          "Something went wrong while attempting to create a Stripe connected account",
      },
      { status: 500 }
    );
  }
}
