import { UserRole } from './auth.types';

export interface Profile {
  id: string;
  firebase_uid: string;
  display_name: string;
  username: string;
  email: string;
  avatar: string | null;
  avatar_key: string | null;
  bio: string | null;
  skills: string[];
  availability_status: AvailabilityStatus;
  is_verified: boolean;
  role: UserRole;
  total_earnings: number;
  avg_rating: number;
  total_reviews: number;
  fcm_token: string | null;
  notification_prefs: Record<string, boolean>;
  username_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicProfile = Pick<
  Profile,
  | 'id'
  | 'display_name'
  | 'username'
  | 'avatar'
  | 'bio'
  | 'skills'
  | 'availability_status'
  | 'is_verified'
  | 'avg_rating'
  | 'total_reviews'
  | 'created_at'
>;

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export type ProfileUpdateType = 'basic_info' | 'avatar' | 'fcm_token' | 'notification_prefs';

export type ProfileViewType = 'profile' | 'gigs' | 'reviews' | 'full';
