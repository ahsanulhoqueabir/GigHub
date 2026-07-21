/**
 * Profile Validation Schemas (Zod)
 *
 * Shared between frontend and backend for admin profile management.
 */

import { z } from "zod";
import {
  emailField,
  nameField,
  nullableOptionalString,
  passwordField,
  requiredString,
} from "./shared.schema";

// ─── Update Profile (admin) ────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: nameField.optional(),
  email: emailField.optional(),
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
  department: nullableOptionalString,
  student_id: nullableOptionalString,
  status: z
    .enum(["DRAFT", "PENDING", "ACTIVE", "DELETED", "SUSPENDED", "ON_HOLD"])
    .optional(),
  verified: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  username: requiredString("Username").optional(),
  password: passwordField.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Create User (admin) ───────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  username: requiredString("Username"),
  password: passwordField,
  student_id: requiredString("Student ID"),
  department: requiredString("Department").optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
