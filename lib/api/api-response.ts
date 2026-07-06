import { NextResponse } from "next/server";
import axios from "axios";

interface SuccessResponseOptions {
  data?: unknown;
  message?: string;
  statusCode?: number;
}

interface ErrorResponseOptions {
  error: string;
  data?: unknown;
  statusCode?: number;
}

/**
 * Success response utility
 * @example ok({ data: { id: "123" }, message: "Created successfully" })
 * @example ok({ data: result, statusCode: 201 })
 */
export function ok(options: SuccessResponseOptions) {
  const { data, message, statusCode = 200 } = options;
  const response: Record<string, unknown> = {
    success: true,
  };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Error response utility
 * @example fail({ error: "Invalid request" })
 * @example fail({ error: "Unauthorized", statusCode: 403 })
 * @example fail({ error: "Not found", data: { details: "..." }, statusCode: 404 })
 */
export function fail(options: ErrorResponseOptions) {
  const { error, data, statusCode = 400 } = options;
  const response: Record<string, unknown> = {
    success: false,
    error,
  };
  if (data !== undefined) response.data = data;
  return NextResponse.json(response, { status: statusCode });
}

export function success<T = unknown>(data: T) {
  return { success: true as const, data };
}

export function error(error: string) {
  return { success: false as const, error };
}

import { type ZodSchema } from "zod";

/**
 * Parse and validate request body using a Zod schema.
 * Returns the parsed data on success, or a `fail` response on validation error.
 *
 * @example
 * const body = await parseBody(request, loginSchema);
 * if (body instanceof NextResponse) return body;
 * // body is now typed as LoginInput
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue?.message ?? "Invalid input";
      return fail({ error: message });
    }

    return parsed.data;
  } catch {
    return fail({ error: "Invalid JSON body" });
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ?? error.message ?? "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
