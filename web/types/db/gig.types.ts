import type { Category } from "@/types/db/category.types";
import type { Profile } from "@/types/db/profile.types";

export type GigStatus = "draft" | "active" | "paused" | "deleted";

export interface GigPackage {
  tier: "basic" | "standard" | "premium";
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  revision_count: number;
  features: string[];
}

export interface GigImage {
  url: string;
  sort_order: number;
}

export interface Gig {
  id: string;
  seller: string | Partial<Profile>;
  category: string | Partial<Category>;
  title: string;
  slug: string;
  description: string;
  packages: GigPackage[];
  images: GigImage[];
  tags: string[];
  status: GigStatus;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}
