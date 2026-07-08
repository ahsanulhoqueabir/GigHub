/**
 * Own-Profile Validation Schemas (Zod)
 *
 * Used for the authenticated user updating their own profile
 * and changing their password. These schemas deliberately exclude
 * sensitive fields (role, status, verified, etc.) so the user
 * cannot escalate privileges.
 */

import {
  nameField,
  nullableOptionalString,
  passwordField,
} from "@/lib/validations/shared.schema";
import { z } from "zod";

// ─── Update Own Profile ────────────────────────────────────────────────────

export const updateOwnProfileSchema = z.object({
  name: nameField.optional(),
  username: z.string().trim().min(1, "Username is required").optional(),
  phone: nullableOptionalString,
  bio: nullableOptionalString,
  avatar: nullableOptionalString,
  cover: nullableOptionalString,
  skills: z.array(z.string()).optional(),
  website: nullableOptionalString,
  portfolio: nullableOptionalString,
  google: nullableOptionalString,
  socials: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
});

export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;

// ─── Change Password ───────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
