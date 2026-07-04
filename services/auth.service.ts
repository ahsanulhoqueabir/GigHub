import { success, error } from "@/lib/api/api-response";
import { signJwt } from "@/lib/jwt.helper";
import { hashPassword, verifyPassword } from "@/lib/api/password";
import { stripPassword } from "@/lib/api/strip-password";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { generateUsername } from "@/lib/payload/auth-payload";
import { ProfileService } from "@/services/profile.service";
import type {
  JwtPayload,
  LoginParams,
  SignUpParams,
} from "@/types/business/user.types";
import type { Profile } from "@/types/db/profile.types";

const MAX_USERNAME_RETRIES = 3;

export class AuthService {
  /**
   * Register a new user with profile and wallet.
   * Returns a JWT token and user profile data on success.
   */
  static async signup(params: SignUpParams) {
    try {
      const { name, email, password, student_id, department } = params;

      // Hash the password
      const hashedPassword = await hashPassword(password);

      const supabase = getSupabaseServerClient();

      // Try creating profile + wallet with retry on username collision
      let lastError: string | null = null;
      let profile: Profile | null = null;

      for (let attempt = 0; attempt < MAX_USERNAME_RETRIES; attempt++) {
        const username = generateUsername(name);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = await (supabase as any).rpc(
          "create_profile_with_wallet",
          {
            p_name: name,
            p_username: username,
            p_password: hashedPassword,
            p_email: email,
            p_student_id: student_id,
            p_department: department,
          },
        );

        if (rpcError) {
          // Check if it's a unique violation on username
          if (
            rpcError.code === "23505" &&
            rpcError.message?.includes("username")
          ) {
            lastError = "Username already taken, retrying…";
            continue;
          }
          return error(rpcError.message);
        }

        // rpc returns JSON
        profile = data as unknown as Profile;
        break;
      }

      if (!profile) {
        return error(
          lastError ?? "Failed to create account after multiple attempts",
        );
      }

      // Strip password before returning
      const safeProfile = stripPassword(profile);

      // Sign JWT token
      const jwtPayload: JwtPayload = {
        profile: safeProfile.id,
        email: safeProfile.email,
        role: safeProfile.role,
      };

      const token = await signJwt(jwtPayload);

      return success({
        user: safeProfile,
        token,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Authenticate a user with email/username and password.
   * Returns a JWT token and user profile data on success.
   */
  static async login(params: LoginParams) {
    try {
      const { emailOrUsername, password } = params;

      // Try to find user by email first, then by username
      const isEmail = emailOrUsername.includes("@");
      const profileResult = isEmail
        ? await ProfileService.getByEmail(emailOrUsername)
        : await ProfileService.getByUsername(emailOrUsername);

      if (!profileResult.success) {
        return error("Invalid email/username or password");
      }

      const profile = profileResult.data;

      // Verify password using argon2
      const isValid = await verifyPassword(profile.password, password);
      if (!isValid) {
        return error("Invalid email/username or password");
      }

      // Strip password before returning
      const safeProfile = stripPassword(profile);

      // Sign JWT token
      const jwtPayload: JwtPayload = {
        profile: safeProfile.id,
        email: safeProfile.email,
        role: safeProfile.role,
      };

      const token = await signJwt(jwtPayload);

      return success({
        token,
        user: safeProfile,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
