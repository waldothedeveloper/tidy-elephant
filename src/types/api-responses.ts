type ErrorDetails = {
  code?: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: ErrorDetails;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const createSuccessResponse = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (error: ErrorDetails): ApiError => ({
  success: false,
  error,
});