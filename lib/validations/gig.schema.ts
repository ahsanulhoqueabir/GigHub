/**
 * Gig Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 *
 * Packages must have exactly 3 tiers: BASIC, STANDARD, PREMIUM — no duplicates allowed.
 * Slug is auto-generated server-side from the title using `slugify()`.
 * Seller is extracted from the JWT token, not from the request body.
 */

import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────────

const GIG_PACKAGE_TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

// ─── Reusable Field Schemas ───────────────────────────────────────

export const categoryField = z.string().uuid("Invalid category ID");

export const titleField = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be at most 200 characters");

export const descriptionField = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(5000, "Description must be at most 5000 characters");

export const imagesField = z
  .array(z.string().url("Each image must be a valid URL"))
  .max(10, "Maximum 10 images allowed")
  .optional();

export const tagsField = z
  .array(z.string().trim().min(1).max(50))
  .max(20, "Maximum 20 tags allowed")
  .optional();

// ─── Gig Package Schema ───────────────────────────────────────────

export const gigPackageSchema = z.object({
  title: z.string().trim().min(1, "Package title is required").max(100),
  tier: z.enum(GIG_PACKAGE_TIERS, {
    error: "Tier must be BASIC, STANDARD, or PREMIUM",
  }),
  description: z
    .string()
    .trim()
    .min(1, "Package description is required")
    .max(500),
  price: z.number().nonnegative("Price must be 0 or greater").optional(),
  delivery_days: z
    .number()
    .int("Delivery days must be an integer")
    .min(1, "Delivery days must be at least 1")
    .optional(),
  revisions: z
    .number()
    .int("Revisions must be an integer")
    .min(0, "Revisions must be 0 or greater")
    .optional(),
  features: z
    .array(z.string().trim().min(1))
    .max(20, "Maximum 20 features per package")
    .optional(),
});

const packagesField = z
  .array(gigPackageSchema)
  .length(3, "Exactly 3 packages (BASIC, STANDARD, PREMIUM) are required")
  .refine(
    (packages) => {
      const tiers = packages.map((p) => p.tier);
      return new Set(tiers).size === 3;
    },
    {
      message: "Each package tier must be unique (BASIC, STANDARD, PREMIUM)",
    },
  );
// ─── FAQ Schema ───────────────────────────────────────────────────

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(500),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
});

export const faqField = z
  .array(faqSchema)
  .max(20, "Maximum 20 FAQ items allowed")
  .optional();

// ─── Status ───────────────────────────────────────────────────────

export const statusField = z.enum(["active", "draft"], {
  error: "Status must be 'active' or 'draft'",
});

// ─── Create Gig ───────────────────────────────────────────────────

export const createGigSchema = z
  .object({
    category: categoryField,
    title: titleField,
    description: descriptionField,
    images: imagesField,
    tags: tagsField,
    packages: packagesField,
    faq: faqField,
    status: statusField.optional().default("active"),
  })
  .strict();

export type CreateGigInput = z.infer<typeof createGigSchema>;

// ─── Update Gig (all fields optional) ─────────────────────────────

export const updateGigSchema = z
  .object({
    category: categoryField.optional(),
    title: titleField.optional(),
    description: descriptionField.optional(),
    images: imagesField,
    tags: tagsField,
    packages: packagesField.optional(),
    faq: faqField,
    status: statusField.optional(),
  })
  .strict();

export type UpdateGigInput = z.infer<typeof updateGigSchema>;
