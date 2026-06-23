export interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  parent_id: string | null;
  ordering: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryTree extends CategoryRecord {
  subCategories: CategoryTree[];
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
}
