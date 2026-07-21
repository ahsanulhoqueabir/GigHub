/**
 * Auth Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 */

import { z } from "zod";
import {
  nameField,
  emailField,
  passwordField,
  passwordRequiredField,
  requiredString,
} from "./shared.schema";

// ─── Sign Up ───────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: nameField,

  email: emailField,

  password: passwordField,

  student_id: requiredString("Student ID"),

  department: requiredString("Department"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

// ─── Login ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  emailOrUsername: requiredString("Email or username"),

  password: passwordRequiredField,
});

export type LoginInput = z.infer<typeof loginSchema>;
