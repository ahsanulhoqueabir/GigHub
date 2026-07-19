import type { Profile } from "@/types/db/profile.types";

/**
 * Safe profile shape — identical to Profile but without `password`.
 */
export type SafeProfile = Omit<Profile, "password">;
