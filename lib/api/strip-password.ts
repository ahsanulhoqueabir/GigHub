import type { Profile } from "@/types/db/profile.types";

/**
 * Safe profile shape — identical to Profile but without `password`.
 */
export type SafeProfile = Omit<Profile, "password">;

/**
 * Strip the `password` field from a Profile object.
 * Returns a new object without the password property.
 */
export function stripPassword(profile: Profile): SafeProfile {
  const { password: _, ...safe } = profile;
  return safe;
}
