import { PublicProfile } from './profile.types';
import { PublicCategory } from './category.types';

export interface GigRecord {
  id: string;
  seller: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  images: any;
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  views: number;
  packages: any;
  faq: any;
  created_at: string;
  updated_at: string;
}

export interface PopulatedGigRecord extends Omit<
  GigRecord,
  'seller' | 'category'
> {
  seller: PublicProfile;
  category: PublicCategory;
}
