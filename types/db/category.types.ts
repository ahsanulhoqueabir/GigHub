import { SystemFields } from "../generic.types";

export interface CategoryCore {
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  parent: string | null;
  ordering: number;
}

export interface Category extends CategoryCore, SystemFields {}

export interface CategoryTree extends Category {
  subCategories: CategoryTree[];
}

export interface CategoryForm extends Omit<CategoryCore, "parent"> {
  parent: string | null;
}
