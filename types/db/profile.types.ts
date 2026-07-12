import { SystemFields } from "../generic.types";
import { Department } from "./department.types";

export interface ProfileCore {
  name: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  skills?: string[];
  website?: string;
  portfolio?: string;
  google?: string;
  socials?: Socials;
  verified: boolean;
  fcm_token?: string;
  department?: string | Partial<Department> | null;
  student_id?: string;
}

export type UserRole = "USER" | "ADMIN";

export interface Socials {
  github?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Profile extends ProfileCore, SystemFields {}

export interface ProfileForm extends Omit<
  ProfileCore,
  "department" | "verified" | "fcm_token" | "role"
> {
  department?: string | null;
}
