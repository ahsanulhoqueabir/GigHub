import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { SignJWT } from "jose";
import { sb } from "@/config/env.config";

/**
 * GET /api/chat/token
 * Generates and returns a Supabase-compatible JWT token for Realtime connections.
 * The token is signed using the SUPABASE_SECRET_KEY (which acts as the JWT verification secret).
 */
export const GET = withAuth({
  handler: async ({ user }) => {
    try {
      const supabaseSecret = sb.secret;
      if (!supabaseSecret) {
        return fail({ error: "Supabase secret key is not configured", statusCode: 500 });
      }

      const encoder = new TextEncoder();
      const secret = encoder.encode(supabaseSecret);

      // Construct a JWT that conforms to Supabase expectations:
      // - "sub": the user's profile UUID (this is what auth.uid() resolves to in RLS policies)
      // - "role": "authenticated"
      // - "aud": "authenticated"
      const token = await new SignJWT({
        sub: user.profile,
        role: "authenticated",
        aud: "authenticated",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") // Token expires in 1 hour
        .sign(secret);

      return ok({ data: { token } });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
