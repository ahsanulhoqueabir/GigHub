import { SystemFields } from "../generic.types";
import { Profile } from "./profile.types";
import { Category } from "./category.types";

export interface JobCore {
  owner: string | Partial<Profile>;
  category: string | Partial<Category>;
  title: string;
  slug: string;
  description: string;
  type: JobType;
  views: number;
  attachments?: string[];
  budget?: string;
  deadline?: string;
  location?: string;
  required_skills?: string[];
  tags?: string[];
}

export type JobType =
  | "PARTTIME"
  | "FULLTIME"
  | "CONTRACT"
  | "TUTION"
  | "VOLUNTEER"
  | "OTHER";

export interface Job extends JobCore, SystemFields {}

export interface JobForm extends Omit<
  JobCore,
  "owner" | "category" | "slug" | "views"
> {
  owner: string | null;
  category: string | null;
}
