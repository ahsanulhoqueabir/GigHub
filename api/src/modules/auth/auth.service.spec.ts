/**
 * AuthService unit tests.
 *
 * External dependencies (directus, axios, firebase-admin) are factory-mocked
 * so that module-level initialisation code (axios.create, interceptors) does
 * not crash when Jest loads the module graph.
 */

// ── Factory mocks (hoisted before imports) ──────────────────────────────────

jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: { use: jest.fn() },
        request: { use: jest.fn() },
      },
    })),
  },
}));

// ── Real imports (after mock hoisting) ──────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import directusApi from '@/utils/directus.api';
import { UserRole } from '@/types/auth.types';
import { AvailabilityStatus } from '@/types/profile.types';
import type { Profile } from '@/types/profile.types';

// Typed helpers for the factory-mocked objects
const d = directusApi as jest.Mocked<typeof directusApi>;
const axiosPost = axios.post as jest.Mock;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile: Profile = {
  id: 'profile-uuid',
  firebase_uid: 'firebase-uid',
  display_name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  avatar: null,
  avatar_key: null,
  bio: null,
  skills: [],
  availability_status: AvailabilityStatus.AVAILABLE,
  is_verified: false,
  role: UserRole.STUDENT,
  total_earnings: 0,
  avg_rating: 0,
  total_reviews: 0,
  fcm_token: null,
  notification_prefs: {},
  username_updated_at: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: {
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            verifyIdToken: jest.fn(),
            generatePasswordResetLink: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const cfg: Record<string, string> = {
                'firebase.apiKey': 'fake-api-key',
                'jwt.secret': 'secret',
                'jwt.expiresIn': '15m',
                'jwt.refreshSecret': 'refresh-secret',
                'jwt.refreshExpiresIn': '7d',
              };
              return cfg[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      password: 'password123',
      display_name: 'New User',
      username: 'newuser',
    };

    it('should register a new user and return tokens', async () => {
      d.get.mockResolvedValueOnce({ data: { data: [] } } as any);
      firebaseService.createUser.mockResolvedValueOnce({ uid: 'new-uid' } as any);
      d.post.mockResolvedValueOnce({ data: { data: mockProfile } } as any);

      const tokens = await service.register(dto);

      expect(tokens.access_token).toBe('mock-token');
      expect(tokens.refresh_token).toBe('mock-token');
      expect(firebaseService.createUser).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('should throw ConflictException when username is already taken', async () => {
      d.get.mockResolvedValueOnce({ data: { data: [mockProfile] } } as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when Firebase email already exists', async () => {
      d.get.mockResolvedValueOnce({ data: { data: [] } } as any);
      firebaseService.createUser.mockRejectedValueOnce({ code: 'auth/email-already-exists' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should rollback Firebase user when Directus write fails', async () => {
      d.get.mockResolvedValueOnce({ data: { data: [] } } as any);
      firebaseService.createUser.mockResolvedValueOnce({ uid: 'new-uid' } as any);
      d.post.mockRejectedValueOnce(new Error('Directus error'));
      firebaseService.deleteUser.mockResolvedValueOnce(undefined);

      await expect(service.register(dto)).rejects.toThrow();
      expect(firebaseService.deleteUser).toHaveBeenCalledWith('new-uid');
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should login via password provider and return tokens', async () => {
      axiosPost.mockResolvedValueOnce({ data: { localId: 'firebase-uid' } });
      d.get.mockResolvedValueOnce({ data: { data: [mockProfile] } } as any);

      const tokens = await service.login({
        provider: 'password',
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(tokens.access_token).toBe('mock-token');
    });

    it('should login via google provider and return tokens', async () => {
      firebaseService.verifyIdToken.mockResolvedValueOnce({
        uid: 'firebase-uid',
        email: 'test@example.com',
      } as any);
      d.get.mockResolvedValueOnce({ data: { data: [mockProfile] } } as any);

      const tokens = await service.login({
        provider: 'google',
        firebase_id_token: 'id-token',
      });

      expect(tokens.access_token).toBe('mock-token');
      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith('id-token');
    });

    it('should throw BadRequestException for unknown provider', async () => {
      await expect(service.login({ provider: 'twitter' as any })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException when Google ID token is invalid', async () => {
      firebaseService.verifyIdToken.mockRejectedValueOnce(new Error('invalid token'));

      await expect(
        service.login({ provider: 'google', firebase_id_token: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refresh ───────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should issue new tokens when refresh token is valid', async () => {
      jwtService.verify.mockReturnValueOnce({ profile_id: 'profile-uuid' } as any);
      d.get.mockResolvedValueOnce({ data: { data: mockProfile } } as any);

      const tokens = await service.refresh('valid-refresh-token');

      expect(tokens.access_token).toBe('mock-token');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── forgotPassword ────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should call Firebase generatePasswordResetLink', async () => {
      firebaseService.generatePasswordResetLink.mockResolvedValueOnce('https://reset.link');

      await expect(service.forgotPassword('test@example.com')).resolves.not.toThrow();
      expect(firebaseService.generatePasswordResetLink).toHaveBeenCalledWith('test@example.com');
    });

    it('should not throw even when Firebase errors (anti-enumeration)', async () => {
      firebaseService.generatePasswordResetLink.mockRejectedValueOnce(new Error('not found'));

      await expect(service.forgotPassword('unknown@example.com')).resolves.not.toThrow();
    });
  });

  // ─── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should call Firebase resetPassword REST endpoint', async () => {
      axiosPost.mockResolvedValueOnce({ data: {} });

      await expect(
        service.resetPassword('valid-oob-code', 'newpassword123'),
      ).resolves.not.toThrow();
      expect(axiosPost).toHaveBeenCalledWith(expect.stringContaining('accounts:resetPassword'), {
        oobCode: 'valid-oob-code',
        newPassword: 'newpassword123',
      });
    });

    it('should throw BadRequestException when oob code is invalid', async () => {
      axiosPost.mockRejectedValueOnce(new Error('invalid oob code'));

      await expect(service.resetPassword('bad-oob', 'newpassword')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── JWT payload shape ─────────────────────────────────────────────────────

  describe('issueTokens — JWT payload shape', () => {
    it('should sign tokens with correct profile fields', async () => {
      d.get.mockResolvedValueOnce({ data: { data: [] } } as any);
      firebaseService.createUser.mockResolvedValueOnce({ uid: 'uid' } as any);
      d.post.mockResolvedValueOnce({ data: { data: mockProfile } } as any);

      await service.register({
        email: 'new@example.com',
        password: 'password123',
        display_name: 'New',
        username: 'newuser',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_id: mockProfile.id,
          username: mockProfile.username,
          is_verified: mockProfile.is_verified,
          role: mockProfile.role,
        }),
        expect.any(Object),
      );
    });
  });
});
