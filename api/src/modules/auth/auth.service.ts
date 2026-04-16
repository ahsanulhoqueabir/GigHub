import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from './firebase.service';
import directusApi from '@/utils/directus.api';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import type { AuthTokens, JwtPayload } from '@/types/auth.types';
import type { Profile } from '@/types/profile.types';
import { UserRole } from '@/types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly collection = 'gh_profiles';

  constructor(
    private readonly firebase: FirebaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // 1. Check username uniqueness
    const existing = await this.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    // 2. Create Firebase user
    let firebaseUser;
    try {
      firebaseUser = await this.firebase.createUser(dto.email, dto.password);
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr?.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException('Failed to create account');
    }

    // 3. Create gh_profiles record in Directus
    let profile: Profile;
    try {
      const { data } = await directusApi.post<{ data: Profile }>(`/items/${this.collection}`, {
        id: uuidv4(),
        firebase_uid: firebaseUser.uid,
        email: dto.email,
        display_name: dto.display_name,
        username: dto.username,
        role: UserRole.STUDENT,
        availability_status: 'available',
        skills: [],
        notification_prefs: {},
      });
      profile = data.data;
    } catch (err) {
      // Rollback Firebase user if Directus write fails
      await this.firebase.deleteUser(firebaseUser.uid).catch(() => {});
      this.logger.error('Failed to create profile in Directus after Firebase signup', err);
      throw new InternalServerErrorException('Failed to complete registration');
    }

    return this.issueTokens(profile);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    let firebaseUid: string;
    let email: string | undefined;

    if (dto.provider === 'password') {
      // Authenticate via Firebase Auth REST API
      const result = await this.authWithPassword(dto.email!, dto.password!);
      firebaseUid = result.localId;
      email = dto.email;
    } else if (dto.provider === 'google') {
      // Verify Firebase ID token via Admin SDK
      const decoded = await this.firebase.verifyIdToken(dto.firebase_id_token!).catch(() => {
        throw new UnauthorizedException('Invalid Firebase ID token');
      });
      firebaseUid = decoded.uid;
      email = decoded.email;
    } else {
      throw new BadRequestException('INVALID_PROVIDER');
    }

    // Find or create profile
    const profile = await this.findOrCreate(firebaseUid, email);

    return this.issueTokens(profile);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const profile = await this.findById(payload.profile_id);
    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    return this.issueTokens(profile);
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.firebase.generatePasswordResetLink(email);
    } catch {
      // Silently ignore to prevent email enumeration
    }
  }

  async resetPassword(oobCode: string, newPassword: string): Promise<void> {
    const apiKey = this.config.get<string>('firebase.apiKey');
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;

    try {
      await axios.post(url, { oobCode, newPassword });
    } catch {
      throw new BadRequestException('Invalid or expired reset code');
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private async authWithPassword(email: string, password: string): Promise<{ localId: string }> {
    const apiKey = this.config.get<string>('firebase.apiKey');
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    try {
      const { data } = await axios.post<{ localId: string }>(url, {
        email,
        password,
        returnSecureToken: true,
      });
      return data;
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  private async findOrCreate(firebaseUid: string, email?: string): Promise<Profile> {
    // Try to find existing profile
    const existing = await this.findByUid(firebaseUid);
    if (existing) return existing;

    // Auto-create profile for social login first-time users
    const username = `user_${uuidv4().split('-')[0]}`;
    const { data } = await directusApi.post<{ data: Profile }>(`/items/${this.collection}`, {
      id: uuidv4(),
      firebase_uid: firebaseUid,
      email: email ?? '',
      display_name: email?.split('@')[0] ?? 'New User',
      username,
      role: UserRole.STUDENT,
      availability_status: 'available',
      skills: [],
      notification_prefs: {},
    });
    return data.data;
  }

  private async query<T>(params: Record<string, unknown>): Promise<T | null> {
    try {
      const { data } = await directusApi.get<{ data: T[] }>(`/items/${this.collection}`, {
        params: { ...params, limit: 1 },
      });
      return (data.data[0] as T) ?? null;
    } catch {
      return null;
    }
  }

  private async findByUid(uid: string): Promise<Profile | null> {
    return this.query<Profile>({ filter: { firebase_uid: { _eq: uid } } });
  }

  private async findByUsername(username: string): Promise<Profile | null> {
    return this.query<Profile>({ filter: { username: { _eq: username } } });
  }

  private async findById(id: string): Promise<Profile | null> {
    try {
      const { data } = await directusApi.get<{ data: Profile }>(`/items/${this.collection}/${id}`);
      return data.data ?? null;
    } catch {
      return null;
    }
  }

  private issueTokens(profile: Profile): AuthTokens {
    const payload: JwtPayload = {
      profile_id: profile.id,
      username: profile.username,
      is_verified: profile.is_verified,
      role: profile.role,
    };

    const expiresIn = this.config.get<string>('jwt.expiresIn') ?? '15m';
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: refreshExpiresIn,
    });

    return { access_token, refresh_token, expires_in: expiresIn };
  }
}
