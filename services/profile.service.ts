import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { stripPassword, type SafeProfile } from "@/lib/api/strip-password";
import type { Profile, ProfileForm } from "@/types/db/profile.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ProfileService {
  private static collection = "profile";

  /**
   * Creates a new profile directly (no Supabase Auth dependency).
   */
  static async create(
    params: ProfileForm,
  ): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          name: params.name,
          username: params.username,
          password: params.password,
          email: params.email,
          role: "USER",
          student_id: params.student_id,
          department: params.department,
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(stripPassword(data as Profile));
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch a single profile by its primary key.
   * Used by the `auth/me` endpoint to return the authenticated user's data.
   */
  static async getById(id: string): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*, department:department(id, name, acronym)")
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Profile not found");
      }

      return success(stripPassword(data as Profile));
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch a profile by email (for login).
   * NOTE: This returns the full profile INCLUDING password for auth verification.
   * The caller must not expose the password field to the client.
   */
  static async getByEmail(email: string): Promise<ServiceResult<Profile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("email", email)
        .neq("status", "DELETED")
        .single();

      if (sbError) {
        return error("Invalid email/username or password");
      }

      if (!data) {
        return error("Invalid email/username or password");
      }

      return success(data as Profile);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch a profile by username (for login).
   */
  static async getByUsername(
    username: string,
  ): Promise<ServiceResult<Profile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("username", username)
        .neq("status", "DELETED")
        .single();

      if (sbError) {
        return error("Invalid email/username or password");
      }

      if (!data) {
        return error("Invalid email/username or password");
      }

      return success(data as Profile);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
