import { Profile, UserRole } from "@/types/db/profile.types";

export interface JwtPayload {
  profile: string;
  email: string;
  role: UserRole;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
}

export interface LoginResponseData {
  user: Partial<Profile>;
  token: string;
}

export interface SignUpResponseData {
  user: Partial<Profile>;
  token: string;
}
