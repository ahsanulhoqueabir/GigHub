import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Display name is required"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or less")
    .optional(),
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .max(20, "Maximum 20 skills")
    .optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New passwords do not match",
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
