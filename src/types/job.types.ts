import { PublicProfile } from './profile.types';
import { PublicCategory } from './category.types';

export interface JobRecord {
  id: string;
  owner: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  attachments: any;
  type: 'parttime' | 'fulltime' | 'contract' | 'tution' | 'volunteer' | 'other';
  budget: '<$100' | '$100-500' | '$500-1000' | '$1000+';
  deadline: string;
  location: string;
  required_skills: string[];
  tags: string[];
  status: 'draft' | 'active' | 'closed';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface PopulatedJobRecord extends Omit<
  JobRecord,
  'owner' | 'category'
> {
  owner: PublicProfile;
  category: PublicCategory;
}
