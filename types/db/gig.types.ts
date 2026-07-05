import { SystemFields } from "../generic.types";
import { Category } from "./category.types";
import { Profile } from "./profile.types";

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

export interface Gig extends GigCore, SystemFields {}

export interface GigForm extends Omit<
  GigCore,
  "seller" | "category" | "slug" | "views"
> {
  seller: string | null;
  category: string | null;
}
