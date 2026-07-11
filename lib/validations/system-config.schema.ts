/**
 * System Config Validation Schemas (Zod)
 */

import { nullableOptionalString } from "@/lib/validations/shared.schema";
import { z } from "zod";

// ─── Update System Config ──────────────────────────────────────────────────

export const updateSystemConfigSchema = z.object({
  maintenance_mode: z.boolean().optional(),
  registration_enabled: z.boolean().optional(),
  platform_fee_percent: z
    .number()
    .min(0, "Platform fee must be 0 or greater")
    .max(100, "Platform fee cannot exceed 100")
    .optional(),
  max_gig_images: z
    .number()
    .int("Must be an integer")
    .min(1, "Minimum 1 image")
    .optional(),
  max_portfolio_images: z
    .number()
    .int("Must be an integer")
    .min(1, "Minimum 1 image")
    .optional(),
  max_upload_size_mb: z
    .number()
    .int("Must be an integer")
    .min(1, "Minimum 1 MB")
    .optional(),
  support_email: nullableOptionalString,
  support_phone: nullableOptionalString,
});

export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
