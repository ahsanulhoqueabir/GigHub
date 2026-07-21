/**
 * Job Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 *
 * Slug is auto-generated server-side from the title using `slugify()`.
 * Owner is extracted from the JWT token, not from the request body.
 */

import { z } from "zod";
import {
  categoryField,
  descriptionField,
  tagsField,
  titleField,
} from "./gig.schema";

// ─── Constants ──────────────────────────────────────────────────────

const JOB_TYPES = [
  "PARTTIME",
  "FULLTIME",
  "CONTRACT",
  "TUTION",
  "VOLUNTEER",
  "OTHER",
] as const;

// ─── Reusable Field Schemas ───────────────────────────────────────

export const attachmentsField = z
  .array(z.string().url("Each attachment must be a valid URL"))
  .max(10, "Maximum 10 attachments allowed")
  .optional();

export const requiredSkillsField = z
  .array(z.string().trim().min(1).max(100))
  .max(30, "Maximum 30 skills allowed")
  .optional();

export const deadlineField = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Deadline must be a valid date",
  })
  .optional();

// ─── Create Job ───────────────────────────────────────────────────

export const createJobSchema = z
  .object({
    category: categoryField,
    title: titleField,
    description: descriptionField,
    type: z.enum(JOB_TYPES, {
      message:
        "Job type must be PARTTIME, FULLTIME, CONTRACT, TUTION, VOLUNTEER, or OTHER",
    }),
    budget: z.string().trim().min(1, "Budget is required").max(100),
    deadline: deadlineField,
    location: z.string().trim().max(200).optional(),
    required_skills: requiredSkillsField,
    attachments: attachmentsField,
    tags: tagsField,
  })
  .strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;

// ─── Update Job (all fields optional) ─────────────────────────────

export const updateJobSchema = z
  .object({
    category: categoryField.optional(),
    title: titleField.optional(),
    description: descriptionField.optional(),
    type: z.enum(JOB_TYPES).optional(),
    budget: z.string().trim().min(1).max(100).optional(),
    deadline: deadlineField,
    location: z.string().trim().max(200).optional(),
    required_skills: requiredSkillsField,
    attachments: attachmentsField,
    tags: tagsField,
  })
  .strict();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;
