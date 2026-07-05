/**
 * Job Proposal Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 *
 * - `job` is extracted from the route/request context, not from the body.
 * - `applicant` is extracted from the JWT token, not from the request body.
 * - Update only allows changing `description` and `attachments`.
 */

import { z } from "zod";
import { descriptionField } from "./gig.schema";
import { attachmentsField } from "./job.schema";

// ─── Reusable Field Schemas ───────────────────────────────────────

// ─── Create Job Proposal ─────────────────────────────────────────

export const createJobProposalSchema = z
  .object({
    job: z.string().uuid("Invalid job ID"),
    description: descriptionField,
    attachments: attachmentsField,
  })
  .strict();

export type CreateJobProposalInput = z.infer<typeof createJobProposalSchema>;

// ─── Update Job Proposal (only description & attachments) ─────────

export const updateJobProposalSchema = z
  .object({
    description: descriptionField.optional(),
    attachments: attachmentsField,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (description or attachments) must be provided",
  });

export type UpdateJobProposalInput = z.infer<typeof updateJobProposalSchema>;
