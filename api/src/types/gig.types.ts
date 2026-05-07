import type { PaginationQuery } from '@/types/services/common.types';
import type { Order } from '@/types/order.types';
import type { Review } from '@/types/review.types';
import { Profile } from './profile.types';

export enum GigStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted',
}

export enum GigPackageTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export type GigUpdateType = 'edit' | 'status';

export interface GigImage {
  url: string;
  sort_order: number;
}

export interface GigPackage {
  id?: string;
  tier: GigPackageTier;
  title: string;
  description: string | null;
  price: number;
  delivery_days: number;
  revision_count: number;
  features: string[] | null;
}

export interface Gig {
  id: string;
  seller: string | Partial<Profile>;
  category: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  images: GigImage[];
  status: GigStatus;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  packages: GigPackage[];
  /** O2M: related reviews (via gh_reviews.gig → gh_gigs.id) */
  reviews?: Review[];
  /** O2M: related orders (via gh_orders.gig → gh_gigs.id) */
  orders?: Order[];
}

export interface GigQuery extends PaginationQuery {
  category?: string;
  seller_id?: string;
  min_rating?: number;
  tags?: string;
}
