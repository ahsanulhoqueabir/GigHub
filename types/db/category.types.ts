import type { CategoryMinimal as BaseCategoryMinimal } from "@gig-hub/types";

export {
  DefaultCategoryForm,
  type Category,
  type CategoryCore,
  type CategoryForm,
  type CategoryTree,
} from "@gig-hub/types";

export type CategoryMinimal = BaseCategoryMinimal & { image?: string | null };
