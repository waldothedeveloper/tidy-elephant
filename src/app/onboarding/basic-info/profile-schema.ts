import { object, string, optional } from "valibot";

// Create a schema for the basic profile form
export const userProfileSchema = object({
  firstName: string("First name is required"),
  lastName: string("Last name is required"), 
  photo: optional(string(), ""),
  about: optional(string(), "")
});

// Export type for TypeScript
export type UserProfileSchema = typeof userProfileSchema;
