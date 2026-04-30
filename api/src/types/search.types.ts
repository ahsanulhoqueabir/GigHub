export type SearchCollection = 'gigs' | 'jobs' | 'profiles' | 'tuition';

export interface SearchQuery {
  q?: string;
  collection?: SearchCollection;
  page?: number;
  limit?: number;
  skills?: string;
  category?: string;
}
