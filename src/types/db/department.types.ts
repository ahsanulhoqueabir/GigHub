import { SystemFields } from "../generic.types";

export interface DepartmentCore {
  name: string;
  acronym: string | null;
  description: string | null;
  code: string;
  image: string | null;
  id_pattern: string | null;
}

export interface Department extends DepartmentCore, SystemFields {}
