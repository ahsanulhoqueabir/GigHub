/**
 * Shared Validation Field Definitions (Zod)
 *
 * Common field schemas reused across all validation schemas
 * to maintain DRY principal.
 */

import { z } from "zod";

// ─── String Fields ─────────────────────────────────────────────────────────

/** Required trimmed string with a minimum length of 1 */
export const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

/** Required trimmed string capped at 100 characters */
export const shortString = (fieldName: string) =>
  requiredString(fieldName).max(
    100,
    `${fieldName} must be at most 100 characters`,
  );

/** Optional string that can be null */
export const nullableOptionalString = z.string().trim().nullable().optional();

// ─── Name ──────────────────────────────────────────────────────────────────

export const nameField = shortString("Name");

export const nameFieldOptional = nameField.optional();

// ─── Slug ──────────────────────────────────────────────────────────────────

export const slugField = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(100, "Slug must be at most 100 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );

export const slugFieldOptional = slugField.optional();

// ─── Email ─────────────────────────────────────────────────────────────────

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Invalid email address");

// ─── Password ──────────────────────────────────────────────────────────────

/** Password with 6-128 character validation (for signup) */
export const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be at most 128 characters");

/** Password that only requires non-empty (for login) */
export const passwordRequiredField = z.string().min(1, "Password is required");

// ─── Number Fields ─────────────────────────────────────────────────────────

/** Non-negative integer field with a default of 0 */
export const orderingField = z
  .number()
  .int("Ordering must be an integer")
  .min(0, "Ordering must be 0 or greater")
  .default(0);

export const orderingFieldOptional = z
  .number()
  .int("Ordering must be an integer")
  .min(0, "Ordering must be 0 or greater")
  .optional();
