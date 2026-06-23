export interface ProfileRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  skills?: string[];
  website?: string;
  portfolio?: string;
  experience?: string;
  education?: string;
  active: boolean;
  google?: string;
  socials?: any;
  verified: boolean;
  role: string;
  fcm_token?: string;
  department?: string;
  student_id?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  verified: boolean;
  bio?: string | null;
}
