export type ProfileAvailabilityStatus = "available" | "busy" | "offline";
export type ProfileRole = "student" | "admin";

export interface Profile {
  id: string;
  user: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  skills: string[];
  availability_status: ProfileAvailabilityStatus;
  is_verified: boolean;
  role: ProfileRole;
  total_earnings: number;
  avg_rating: number;
  total_reviews: number;
  fcm_token: string | null;
  notification_prefs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
