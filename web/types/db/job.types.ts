import type { Category } from "@/types/db/category.types";
import type { Profile } from "@/types/db/profile.types";

export type JobType = "paid" | "free" | "internship" | "volunteer" | "tuition";
export type JobBudgetType = "fixed" | "hourly" | "negotiable";
export type JobStatus = "open" | "in_progress" | "closed" | "cancelled";

export interface Job {
  id: string;
  poster: string | Partial<Profile>;
  category: string | Partial<Category>;
  title: string;
  slug: string;
  description: string;
  job_type: JobType;
  budget_type: JobBudgetType;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  required_skills: string[];
  attachments: string[];
  status: JobStatus;
  total_proposals: number;
  created_at: string;
  updated_at: string;
}
