/**
 * Client-safe environment configuration.
 * Only public (EXPO_PUBLIC_*) values belong here — never secrets.
 */
export const sb = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  publish: process.env.EXPO_PUBLIC_SUPABASE_PUBLISH_KEY!,
};
