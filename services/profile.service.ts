import { error, success } from "@/lib/api/api-response";
import { hashPassword, verifyPassword } from "@/lib/api/password";
import { stripPassword, type SafeProfile } from "@/lib/api/strip-password";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { paginationParams } from "@/lib/pagination";
import type { UpdateProfileInput } from "@/lib/validations/profile.schema";
import type { Profile, ProfileForm } from "@/types/db/profile.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

export class ProfileService {
  private static collection = "profile";

  /**
   * Creates a new profile directly (no Supabase Auth dependency).
   * Password is hashed via argon2 before storing.
   */
  static async create(
    params: ProfileForm,
  ): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      const hashedPassword = await hashPassword(params.password);

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          name: params.name,
          username: params.username,
          password: hashedPassword,
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

  // ─── Admin: List all profiles (paginated) ────────────────────────────────

  /**
   * Get a paginated list of all profiles (admin only).
   * Always strips passwords from the returned data.
   * Supports filtering by role, status, and search query.
   */
  static async list(
    params: PaginationOptions & {
      role?: string;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: SafeProfile[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        role,
        status,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
      } = params;

      let query = supabase
        .from(this.collection)
        .select("*, department:department(id, name, acronym)", {
          count: "exact",
          head: false,
        })
        .neq("status", "DELETED");

      // Optional role filter
      if (role) {
        query = query.eq("role", role);
      }

      // Optional status filter
      if (status) {
        query = query.eq("status", status);
      }

      // Optional search (by name, email, or username)
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`,
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      const items = ((data ?? []) as Profile[]).map(stripPassword);

      return success({
        items,
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  // ─── Admin: Update a profile ─────────────────────────────────────────────

  /**
   * Update a profile's details (admin only).
   * If a new password is provided, it is hashed via argon2 before storing.
   * Returns the updated profile with password stripped.
   */
  static async update(
    id: string,
    params: UpdateProfileInput,
  ): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { password, ...rest } = params;

      const updateData: Record<string, unknown> = {
        ...rest,
        updated_at: new Date().toISOString(),
      };

      // Hash password if provided
      if (password) {
        updateData.password = await hashPassword(password);
      }

      // If department is explicitly set to null, unset it
      if (params.department === null) {
        updateData.department = null;
      }

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .neq("status", "DELETED")
        .select("*, department:department(id, name, acronym)")
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

  // ─── Admin: Delete (soft-delete) a profile ───────────────────────────────

  /**
   * Soft-delete a profile by setting its status to DELETED (admin only).
   */
  static async delete(
    id: string,
  ): Promise<ServiceResult<{ deleted_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update({
          status: "DELETED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("status", "DELETED")
        .select("id")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Profile not found");
      }

      return success({ deleted_id: data.id });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  // ─── Check username availability ─────────────────────────────────────────

  /**
   * Check if a username is available (not taken by another active profile).
   * Excludes the given `excludeId` so the user can keep their own username.
   */
  static async checkUsername(
    username: string,
    excludeId?: string,
  ): Promise<ServiceResult<{ available: boolean }>> {
    try {
      const supabase = getSupabaseServerClient();

      let query = supabase
        .from(this.collection)
        .select("id", { count: "exact", head: true })
        .eq("username", username)
        .neq("status", "DELETED");

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { count, error: sbError } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({ available: (count ?? 0) === 0 });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  // ─── Get own profile (authenticated user) ────────────────────────────────

  /**
   * Fetch the authenticated user's own full profile (password excluded).
   * Returns the profile with the department relation expanded.
   */
  static async getOwnProfile(
    userId: string,
  ): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*, department:department(id, name, acronym)")
        .eq("id", userId)
        .neq("status", "DELETED")
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

  // ─── Update own profile ──────────────────────────────────────────────────

  /**
   * Update the authenticated user's own profile.
   * Sensitive fields (role, status, verified, fcm_token) are STRIPPED
   * from the payload so the user cannot escalate privileges.
   * If a new password is provided, it is hashed via argon2 before storing.
   */
  static async updateOwn(
    userId: string,
    params: Record<string, unknown>,
  ): Promise<ServiceResult<SafeProfile>> {
    try {
      const supabase = getSupabaseServerClient();

      // ── Payload sanitizer ──────────────────────────────────────────────
      // Strip fields the user must never be allowed to change themselves.
      const FORBIDDEN_FIELDS = [
        "role",
        "status",
        "verified",
        "fcm_token",
        "password",
        "email",
        "student_id",
        "department",
      ] as const;

      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(params)) {
        if (
          FORBIDDEN_FIELDS.includes(key as (typeof FORBIDDEN_FIELDS)[number])
        ) {
          continue; // skip forbidden fields
        }
        sanitized[key] = value;
      }

      // ── Update timestamp ───────────────────────────────────────────────
      sanitized.updated_at = new Date().toISOString();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update(sanitized)
        .eq("id", userId)
        .neq("status", "DELETED")
        .select("*, department:department(id, name, acronym)")
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

  // ─── Change own password ─────────────────────────────────────────────────

  /**
   * Change the authenticated user's password.
   * Requires the current password for verification.
   */
  static async changePassword(
    userId: string,
    params: { currentPassword: string; newPassword: string },
  ): Promise<ServiceResult<{ message: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // Fetch current (hashed) password
      const { data, error: fetchError } = await supabase
        .from(this.collection)
        .select("password")
        .eq("id", userId)
        .neq("status", "DELETED")
        .single();

      if (fetchError || !data) {
        return error("Profile not found");
      }

      // Verify current password
      const isValid = await verifyPassword(
        data.password,
        params.currentPassword,
      );
      if (!isValid) {
        return error("Current password is incorrect");
      }

      // Hash and update new password
      const hashed = await hashPassword(params.newPassword);

      const { error: updateError } = await supabase
        .from(this.collection)
        .update({
          password: hashed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        return error(updateError.message);
      }

      return success({ message: "Password changed successfully" });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
