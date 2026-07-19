import axios from "axios";

export function success<T = unknown>(data: T) {
  return { success: true as const, data };
}

export function error(error: string) {
  return { success: false as const, error };
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
