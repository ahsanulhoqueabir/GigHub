import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ServiceResponse } from '@/types/services/common.types';

/**
 * Throws the appropriate NestJS HTTP exception based on `result.status`.
 * If `result.success` is true, does nothing.
 *
 * Usage:
 *   const result = await someService.method();
 *   throwOnError(result);
 *   return result; // result.data is now safely accessible
 */
export function throwOnError<T>(
  result: ServiceResponse<T>,
): asserts result is ServiceResponse<T> & { success: true; data: T } {
  if (result.success) return;

  switch (result.status) {
    case 400:
      throw new BadRequestException(result);
    case 403:
      throw new ForbiddenException(result);
    case 404:
      throw new NotFoundException(result);
    default:
      throw new InternalServerErrorException(result);
  }
}
