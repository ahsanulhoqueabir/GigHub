import type { Profile, UserRole } from "../db/profile.types";

export interface JwtPayload {
  profile: string;
  email: string;
  role: UserRole;
}

export interface LoginParams {
  emailOrUsername: string;
  password: string;
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  student_id: string;
  department: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
  student_id: string | null;
  department: string | null;
  avatar: string | null;
}

export interface LoginResponseData {
  user: Partial<Profile>;
  token: string;
}

export interface SignUpResponseData {
  user: Partial<Profile>;
  token: string;
}
