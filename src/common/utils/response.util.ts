export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details: any;
  status: number;
}

/**
 * Creates a standardized success response.
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number; [key: string]: any }
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {}),
  };
}

/**
 * Creates a standardized error response.
 */
export function createErrorResponse(
  error: string,
  details: any,
  status: number = 400
): ErrorResponse {
  return {
    success: false,
    error,
    details,
    status,
  };
}
