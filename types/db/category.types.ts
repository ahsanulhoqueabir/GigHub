import { SystemFields } from "../generic.types";

export interface CategoryCore {
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  parent: string | Category | null;
  ordering: number;
}

export interface Category extends CategoryCore, SystemFields {}

export type CategoryMinimal = Pick<Category, "id" | "name" | "slug">;

export interface CategoryTree extends Category {
  subCategories: CategoryTree[];
}

export interface CategoryForm extends Omit<CategoryCore, "parent"> {
  parent: string | null;
}

export function DefaultCategoryForm() {
  return {
    name: "",
    description: null,
    slug: "",
    image: null,
    parent: null,
    ordering: 0,
  };
}
