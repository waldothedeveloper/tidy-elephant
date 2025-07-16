import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, { error: "The first name should be at least 2 characters long" })
    .max(50, { error: "The first name should not exceed 50 characters" }),
  lastName: z
    .string()
    .min(2, { error: "The last name should be at least 2 characters long" })
    .max(70, { error: "The last name should not exceed 70 characters" }),
  about: z
    .string()
    .min(160, {
      error: "The about section should be at least 160 characters long",
    })
    .max(1000, {
      error: "The about section should not exceed 1000 characters",
    }),
  photo: z.url({
    error: "Please upload a photo so customers can recognize you",
  }),
});
