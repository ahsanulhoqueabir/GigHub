"use client";

import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { useCallback, useEffect, useRef, useState } from "react";

type UsernameStatus =
  | { type: "idle" }
  | { type: "checking" }
  | { type: "available" }
  | { type: "taken"; message: string }
  | { type: "error"; message: string };

interface UseUsernameCheckOptions {
  /** Current username of the profile — checking is skipped when value matches this */
  currentUsername?: string;
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;
}

/**
 * Hook to check username availability with debounce.
 *
 * Usage:
 * ```ts
 * const { status, check } = useUsernameCheck({ currentUsername: profile.username });
 *
 * // In your form's username field onChange:
 * check(event.target.value);
 * ```
 */
export function useUsernameCheck(options: UseUsernameCheckOptions = {}) {
  const { currentUsername, debounceMs = 500 } = options;
  const [status, setStatus] = useState<UsernameStatus>({ type: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<string>("");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const check = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Clear previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Skip if empty or same as current
      if (!trimmed || trimmed === currentUsername) {
        setStatus({ type: "idle" });
        return;
      }

      // Username format validation (basic)
      if (trimmed.length < 3) {
        setStatus({ type: "idle" });
        return;
      }

      latestRef.current = trimmed;
      setStatus({ type: "checking" });

      timerRef.current = setTimeout(async () => {
        const valueToCheck = latestRef.current;

        try {
          const { data } = await api_client.get("/auth/check-username", {
            params: { username: valueToCheck },
          });

          // Only update if this is still the latest request
          if (latestRef.current !== valueToCheck) return;

          if (data?.data?.available) {
            setStatus({ type: "available" });
          } else {
            setStatus({
              type: "taken",
              message: "This username is already taken",
            });
          }
        } catch (err) {
          if (latestRef.current !== valueToCheck) return;
          setStatus({ type: "error", message: getErrorMessage(err) });
        }
      }, debounceMs);
    },
    [currentUsername, debounceMs],
  );

  /** Reset status to idle */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus({ type: "idle" });
  }, []);

  return { status, check, reset };
}

export type { UsernameStatus };
