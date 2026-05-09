export const sb = {
  publicKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  secretKey: process.env.SUPABASE_SECRET_KEY,
};

export const jt = {
  secretKey: process.env.JWT_SECRET_KEY,
  expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "15d",
};
