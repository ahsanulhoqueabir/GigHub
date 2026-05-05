import type { PaginationQuery } from '@/types/services/common.types';

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
  id: string;
  gig: string;
  tier: GigPackageTier;
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  revision_count: number;
  features: string[];
}

export interface Gig {
  id: string;
  seller: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  images: GigImage[];
  price_from?: number;
  delivery_days_min?: number;
  status: GigStatus;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface GigDetail extends Gig {
  packages: GigPackage[];
}

export interface GigQuery extends PaginationQuery {
  category?: string;
  seller_id?: string;
  min_rating?: number;
  tags?: string;
  min_price?: number;
  max_price?: number;
  max_delivery?: number;
}
