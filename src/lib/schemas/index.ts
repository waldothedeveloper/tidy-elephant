// Export all schemas for easy importing
export * from "./phone-verification-schemas";

// For backward compatibility, provide the old schema names
export { e164USPhoneNumberSchema as userProfilePhoneVerificationSchema } from "./phone-verification-schemas";