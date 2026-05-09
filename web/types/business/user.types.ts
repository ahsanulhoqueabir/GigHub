export interface JwtPayload {
  profile: string;
  email: string;
  role: string;
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
  avatar?: File | null;
  bio?: string;
  skills?: string[];
}

export interface SignUpStep1Data {
  name: string;
  email: string;
  password: string;
  username?: string;
}

export interface SignUpStep2Data {
  avatar?: File | null;
}

export interface SignUpStep3Data {
  bio?: string;
  skills?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  skills?: string[];
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  skills?: string[];
}

export interface LoginResponseData {
  user: Profile;
  token: string;
}

export interface SignUpResponseData {
  user: Profile;
  token: string;
}
