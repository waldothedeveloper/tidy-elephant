// API Response Types for DAL functions and Server Actions

// Base response types
export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// Extended error response with retry information
export interface ErrorResponseWithRetry extends ErrorResponse {
  retryAfter: number; // Seconds to wait before retrying
}

// Verification-specific response types
export interface VerificationSuccessResponse extends SuccessResponse {
  verified: true;
}

export interface VerificationErrorResponse extends ErrorResponse {
  verified: false;
}

// Extended verification error response with retry information
export interface VerificationErrorResponseWithRetry extends VerificationErrorResponse {
  retryAfter: number; // Seconds to wait before retrying
}

// Generic result type that can return data or error
export type ApiResult<T> = T | ErrorResponse;

// Generic result type with retry information
export type ApiResultWithRetry<T> = T | ErrorResponse | ErrorResponseWithRetry;

// Verification result type
export type VerificationResult = VerificationSuccessResponse | VerificationErrorResponse;

// Verification result with retry capability
export type VerificationResultWithRetry = VerificationSuccessResponse | VerificationErrorResponse | VerificationErrorResponseWithRetry;

// Phone lookup result type (has different success structure)
export type PhoneLoadupResult = 
  | { success: true; message: string }
  | { success: false; message: string };

// Generic operation result type
export type OperationResult = SuccessResponse | ErrorResponse;

// Operation result with retry capability
export type OperationResultWithRetry = SuccessResponse | ErrorResponse | ErrorResponseWithRetry;

// Utility type for functions that might return data or an error
export type DataOrError<T> = T | ErrorResponse;

// Type guards for checking response types
export function isSuccessResponse(response: OperationResult): response is SuccessResponse {
  return response.success === true;
}

export function isErrorResponse(response: OperationResult): response is ErrorResponse {
  return response.success === false;
}

export function isErrorResponseWithRetry(response: OperationResultWithRetry): response is ErrorResponseWithRetry {
  return response.success === false && 'retryAfter' in response;
}

export function isVerificationSuccess(response: VerificationResult): response is VerificationSuccessResponse {
  return response.success === true && response.verified === true;
}

export function isVerificationError(response: VerificationResult): response is VerificationErrorResponse {
  return response.success === false && response.verified === false;
}

export function isVerificationErrorWithRetry(response: VerificationResultWithRetry): response is VerificationErrorResponseWithRetry {
  return response.success === false && response.verified === false && 'retryAfter' in response;
}

// Helper function to create success response
export function createSuccessResponse(message: string): SuccessResponse {
  return { success: true, message };
}

// Helper function to create error response
export function createErrorResponse(error: string): ErrorResponse {
  return { success: false, error };
}

// Helper function to create error response with retry
export function createErrorResponseWithRetry(error: string, retryAfter: number): ErrorResponseWithRetry {
  return { success: false, error, retryAfter };
}

// Helper function to create verification success response
export function createVerificationSuccessResponse(message: string): VerificationSuccessResponse {
  return { success: true, message, verified: true };
}

// Helper function to create verification error response
export function createVerificationErrorResponse(error: string): VerificationErrorResponse {
  return { success: false, error, verified: false };
}

// Helper function to create verification error response with retry
export function createVerificationErrorResponseWithRetry(error: string, retryAfter: number): VerificationErrorResponseWithRetry {
  return { success: false, error, verified: false, retryAfter };
}