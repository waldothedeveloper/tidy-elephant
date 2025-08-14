import { enforceAuthProvider } from "@/lib/dal/clerk";
import { stripe } from "@/lib/stripe/index";

export async function POST(request: Request) {
  try {
    await enforceAuthProvider();

    const { account } = await request.json();

    if (!account) {
      return Response.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const accountSession = await stripe.accountSessions.create({
      account,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return Response.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account session:",
      error
    );
    return Response.json(
      {
        error:
          "Something went wrong while attempting to create a Stripe account session",
      },
      { status: 500 }
    );
  }
}