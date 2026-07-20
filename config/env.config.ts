/**
 * Client-safe environment configuration.
 * Only public (EXPO_PUBLIC_*) values belong here — never secrets.
 */
export const sb = {
  url:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://aqmywrpfxlzassgnmmpn.supabase.co",
  publish:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISH_KEY ||
    "sb_publishable_-YISkb3XE6n77ea1Cooedw_YqOA3Euf",
};
