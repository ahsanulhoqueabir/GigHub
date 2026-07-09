import { SystemFields } from "../generic.types";
import { Category } from "./category.types";
import { Profile } from "./profile.types";

// ─── Core ──────────────────────────────────────────────────────────────────

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

// ─── Entity ────────────────────────────────────────────────────────────────

export interface Job extends JobCore, SystemFields {}

export interface JobRes extends Job {
  owner: Profile;
  category: Category;
}

// ─── Form ──────────────────────────────────────────────────────────────────

export interface JobForm extends Omit<
  JobCore,
  "owner" | "category" | "slug" | "views"
> {
  owner: string | null;
  category: string | null;
}

// ─── UI / View helpers (reused by stores & components) ────────────────────

/** Minimal owner info — subset of Profile fields used in lists */
export type JobOwnerInfo = Pick<
  Profile,
  "id" | "name" | "username" | "avatar" | "verified"
>;

/** Extended owner info for detail pages */
export interface JobOwnerDetail extends JobOwnerInfo {
  created_at: string;
  department?: string;
}

/** Minimal category info — subset of Category fields */
export type JobCategoryInfo = Pick<Category, "id" | "name" | "slug">;

/** List item shape — fields from JobCore + resolved relations */
export interface JobListItem extends Pick<
  JobCore,
  | "title"
  | "slug"
  | "description"
  | "type"
  | "budget"
  | "deadline"
  | "location"
  | "required_skills"
  | "tags"
  | "views"
> {
  id: string;
  owner: JobOwnerInfo;
  category?: JobCategoryInfo;
}

/** Detail shape — full job with resolved relations */
export interface JobDetail extends Pick<
  Job,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "type"
  | "budget"
  | "deadline"
  | "location"
  | "required_skills"
  | "attachments"
  | "tags"
  | "views"
  | "status"
  | "created_at"
  | "updated_at"
> {
  owner: JobOwnerDetail;
  category?: JobCategoryInfo;
}

/** Minimal info for the apply page */
export interface JobApplyDetail extends Pick<
  Job,
  "id" | "title" | "slug" | "budget" | "type" | "location" | "required_skills"
> {
  owner: Pick<JobOwnerInfo, "id" | "name" | "username">;
}

/** Filters used in job listing */
export interface JobListFilters {
  search?: string;
  category?: string;
  owner?: string;
  type?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Params for creating a new job */
export interface CreateJobParams extends Pick<
  Job,
  | "title"
  | "description"
  | "type"
  | "budget"
  | "deadline"
  | "location"
  | "required_skills"
  | "attachments"
  | "tags"
  | "status"
> {
  category: string;
}
