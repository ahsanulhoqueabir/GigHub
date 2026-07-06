import { useSyncExternalStore } from "react";

/**
 * Returns `true` after the component has mounted on the client (hydrated),
 * and `false` during SSR / pre-hydration.
 *
 * Use this to avoid rendering client-only content (like charts, dynamic data)
 * on the server, preventing hydration mismatches.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
