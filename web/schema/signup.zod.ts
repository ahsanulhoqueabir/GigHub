import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  username: z
    .string()
    .trim()
    .max(30, "Username must be 30 characters or less")
    .optional(),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z
    .custom<File | null>(
      (val) => val === null || val instanceof File,
      "Invalid file",
    )
    .optional(),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or less")
    .optional(),
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .max(15, "Maximum 15 skills")
    .optional(),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
