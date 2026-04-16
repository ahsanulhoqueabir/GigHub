export interface JwtPayload {
  profile_id: string;
  username: string;
  is_verified: boolean;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export type AuthProvider = 'password' | 'google';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}
