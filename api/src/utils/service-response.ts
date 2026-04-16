import { AxiosError } from 'axios';
import type { ServiceResponse, PaginatedServiceResponse, ServicePagination } from '@/types/services/common.types';

export function successResponse<T>(data: T, message?: string): ServiceResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(
  message: string,
  err?: unknown,
  status = 500,
): ServiceResponse<never> {
  let details: unknown = undefined;

  if (err instanceof AxiosError) {
    details = err.response?.data ?? err.message;
    status = err.response?.status ?? status;
  } else if (err instanceof Error) {
    details = err.message;
  } else {
    details = err;
  }

  return { success: false, error: message, details, status };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: ServicePagination,
  message?: string,
): PaginatedServiceResponse<T> {
  return { success: true, data, pagination, message };
}
