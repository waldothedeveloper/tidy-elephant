import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/user-schema";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const userData = evt.data;

      // Extract data from webhook payload
      const primaryEmail = userData.email_addresses?.[0];
      const isEmailVerified = primaryEmail?.verification?.status === "verified";

      // Validate required email field
      if (!primaryEmail?.email_address) {
        console.error("No email address found in Clerk webhook payload");
        return new Response("Email address required", { status: 400 });
      }

      const newUser = {
        clerkUserID: userData.id,
        email: primaryEmail.email_address,
        firstname: userData.first_name || "",
        lastname: userData.last_name || "",
        phone: null, // Clerk doesn't provide phone on signup, will be added during onboarding
        profileImage: userData.image_url || null,
        roles: ["client" as const],
        isEmailVerified,
        agreedToTerms: true, // User completed Clerk signup flow
        agreedToTermsAt: new Date(userData.created_at),
        privacyPolicyAccepted: true, // User completed Clerk signup flow
        createdAt: new Date(userData.created_at),
      };

      await db.insert(usersTable).values(newUser);
      return new Response("User created successfully", { status: 200 });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
