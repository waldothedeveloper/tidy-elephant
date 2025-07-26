"use server";

import { EmailTemplate } from "@/app/_custom_components/email-template";
import { Resend } from "resend";
import { z } from "zod";

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    "Resend API key is not set in environment variables. Please check that your .env file is configured correctly."
  );
}
const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string({
    error: "Please enter a valid email.",
  }),
});

export async function subscribeToWaitlist(
  prevState: { success: boolean; message: string },
  formData: FormData
) {
  const email = formData.get("email") as string;

  const validatedFields = schema.safeParse({
    email,
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.message || "Invalid email address");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Ease & Arrange <hello@easeandarrange.com>",
      to: [email],
      subject: "Welcome to Ease & Arrange - You're on the waitlist!",
      react: EmailTemplate(),
    });

    if (error) {
      throw new Error(
        error.message || "Something went wrong. Failed to send email"
      );
    }

    return {
      success: true,
      message: `Subscription successful! Check your email for confirmation. ${data}`,
    };
  } catch (error) {
    throw new Error(
      "Failed to subscribe to waitlist" +
        (error instanceof Error ? `: ${error.message}` : "")
    );
  }
}
