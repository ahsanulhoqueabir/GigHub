import { SystemFields } from "../generic.types";
import { Category } from "./category.types";
import { Profile } from "./profile.types";

// ─── Core ──────────────────────────────────────────────────────────────────

export interface GigCore {
  seller: string | Partial<Profile>;
  category: string | Partial<Category>;
  title: string;
  slug: string;
  description: string;
  images?: string[];
  tags?: string[];
  views: number;
  packages: GigPackage[];
  faq?: FAQ[];
}

export interface GigPackage {
  title: string;
  tier: GIGPackageTier;
  description: string;
  price?: number;
  delivery_days?: number;
  revisions?: number;
  features?: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export type GIGPackageTier = "BASIC" | "STANDARD" | "PREMIUM";

// ─── Entity ────────────────────────────────────────────────────────────────

export interface Gig extends GigCore, SystemFields {}

export interface GigForm extends Omit<
  GigCore,
  "seller" | "category" | "slug" | "views"
> {
  seller: string | null;
  category: string | null;
}

// ─── UI / View helpers ─────────────────────────────────────────────────────

/** Minimal seller info — subset of Profile fields used in lists */
export type GigSellerInfo = Pick<
  Profile,
  "id" | "name" | "username" | "avatar" | "verified"
>;

/** Extended seller info for detail pages */
export interface GigSellerDetail extends GigSellerInfo {
  created_at: string;
  department?: string;
}

/** Minimal category info — subset of Category fields */
export type GigCategoryInfo = Pick<Category, "id" | "name" | "slug">;

/** Package summary for list items — subset of GigPackage */
export type GigPackageSummary = Pick<GigPackage, "tier" | "price" | "title">;

/** Package detail for order page — subset of GigPackage */
export type GigPackageOrderInfo = Pick<
  GigPackage,
  "tier" | "title" | "price" | "delivery_days"
>;

/** List item shape — fields from GigCore + resolved relations */
export interface GigListItem extends Pick<
  GigCore,
  "title" | "slug" | "description" | "images" | "tags" | "views"
> {
  id: string;
  packages: GigPackageSummary[];
  seller: GigSellerInfo;
  category?: GigCategoryInfo;
}

/** Detail shape (full gig with seller detail) */
export interface GigDetail extends Pick<
  Gig,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "images"
  | "tags"
  | "views"
  | "status"
  | "created_at"
  | "updated_at"
> {
  packages: GigPackage[];
  faq?: FAQ[];
  seller: GigSellerDetail;
  category?: GigCategoryInfo;
  reviews?: unknown[];
}

/** Minimal info for the order page */
export interface GigOrderDetail extends Pick<Gig, "id" | "title" | "slug"> {
  packages: GigPackageOrderInfo[];
  seller: Pick<GigSellerInfo, "id" | "name" | "username" | "avatar">;
}

/** Filters used in gig listing */
export interface GigListFilters {
  search?: string;
  category?: string;
  seller?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Params for creating a gig order */
export interface CreateGigOrderParams {
  gig: string;
  package: GIGPackageTier;
  description?: string;
  note?: string;
}
