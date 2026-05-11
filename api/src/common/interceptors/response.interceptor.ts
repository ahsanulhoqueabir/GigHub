import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: unknown;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the service already returned a ServiceResponse shape, pass through
        if (data !== null && typeof data === 'object' && 'success' in (data as object)) {
          return data as unknown as ApiResponse<T>;
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
