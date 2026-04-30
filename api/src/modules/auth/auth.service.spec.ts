import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import directusApi from '@/utils/directus.api';
import { UserRole } from '@/types/auth.types';

jest.mock('axios');
jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

describe('AuthService', () => {
  let service: AuthService;
  let firebase: {
    createUser: jest.Mock;
    deleteUser: jest.Mock;
    verifyIdToken: jest.Mock;
    generatePasswordResetLink: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  const profile = {
    id: 'profile-id',
    firebase_uid: 'firebase-uid',
    display_name: 'Jane Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    avatar: null,
    avatar_key: null,
    bio: null,
    skills: [],
    availability_status: 'available',
    is_verified: false,
    role: UserRole.STUDENT,
    total_earnings: 0,
    avg_rating: 0,
    total_reviews: 0,
    fcm_token: null,
    notification_prefs: {},
    username_updated_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    firebase = {
      createUser: jest.fn(),
      deleteUser: jest.fn().mockResolvedValue(undefined),
      verifyIdToken: jest.fn(),
      generatePasswordResetLink: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.secret': 'access-secret',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.expiresIn': '15m',
          'jwt.refreshExpiresIn': '7d',
          'firebase.apiKey': 'firebase-api-key',
        };

        return values[key];
      }),
    };

    service = new AuthService(
      firebase as unknown as FirebaseService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    mockedDirectusApi.get.mockReset();
    mockedDirectusApi.post.mockReset();
    mockedAxios.post.mockReset();
    jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
  });

  it('registers a new user and issues tokens', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });
    firebase.createUser.mockResolvedValueOnce({ uid: 'firebase-uid' } as never);
    mockedDirectusApi.post.mockResolvedValueOnce({ data: { data: profile } });

    const result = await service.register({
      email: 'jane@example.com',
      password: 'password123',
      display_name: 'Jane Doe',
      username: 'janedoe',
    });

    expect(firebase.createUser).toHaveBeenCalledWith('jane@example.com', 'password123');
    expect(mockedDirectusApi.post).toHaveBeenCalledWith(
      '/items/gh_profiles',
      expect.objectContaining({
        firebase_uid: 'firebase-uid',
        email: 'jane@example.com',
        username: 'janedoe',
      }),
    );
    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: '15m',
    });
  });

  it('rolls back firebase user when Directus profile creation fails', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });
    firebase.createUser.mockResolvedValueOnce({ uid: 'firebase-uid' } as never);
    mockedDirectusApi.post.mockRejectedValueOnce(new Error('Directus failure'));

    const result = service.register({
      email: 'jane@example.com',
      password: 'password123',
      display_name: 'Jane Doe',
      username: 'janedoe',
    });

    await expect(result).rejects.toThrow('Failed to complete registration');
    expect(firebase.deleteUser).toHaveBeenCalledWith('firebase-uid');
  });

  it('logs in with password credentials', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { localId: 'firebase-uid' } });
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [profile] } });

    const result = await service.login({
      provider: 'password',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toBe('refresh-token');
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('logs in with google firebase token', async () => {
    firebase.verifyIdToken.mockResolvedValueOnce({
      uid: 'firebase-uid',
      email: 'jane@example.com',
    } as never);
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [profile] } });

    const result = await service.login({
      provider: 'google',
      firebase_id_token: 'firebase-token',
    });

    expect(firebase.verifyIdToken).toHaveBeenCalledWith('firebase-token');
    expect(result.access_token).toBe('access-token');
  });

  it('refreshes tokens for a valid refresh token', async () => {
    jwtService.verify.mockReturnValueOnce({
      profile_id: 'profile-id',
      username: 'janedoe',
      is_verified: false,
      role: UserRole.STUDENT,
    } as never);
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: profile } });

    const result = await service.refresh('refresh-token');

    expect(jwtService.verify).toHaveBeenCalledWith('refresh-token', { secret: 'refresh-secret' });
    expect(result.refresh_token).toBe('refresh-token');
  });

  it('returns a logout success payload', async () => {
    await expect(service.logout()).resolves.toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('triggers forgot password for an existing email', async () => {
    firebase.generatePasswordResetLink.mockResolvedValueOnce('reset-link');

    await expect(service.forgotPassword('jane@example.com')).resolves.toBeUndefined();
    expect(firebase.generatePasswordResetLink).toHaveBeenCalledWith('jane@example.com');
  });

  it('silently ignores forgot password failures to prevent email enumeration', async () => {
    firebase.generatePasswordResetLink.mockRejectedValueOnce(new Error('User not found'));

    await expect(service.forgotPassword('unknown@example.com')).resolves.toBeUndefined();
    expect(firebase.generatePasswordResetLink).toHaveBeenCalled();
  });

  it('resets password with a valid reset code', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await expect(service.resetPassword('valid-code', 'newpassword123')).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=firebase-api-key',
      { oobCode: 'valid-code', newPassword: 'newpassword123' },
    );
  });

  it('throws BadRequestException for invalid reset code', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Invalid code'));

    await expect(service.resetPassword('invalid-code', 'newpassword123')).rejects.toThrow(
      'Invalid or expired reset code',
    );
  });

  it('throws ConflictException when username is already taken', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [profile] } });

    await expect(
      service.register({
        email: 'new@example.com',
        password: 'password123',
        display_name: 'John Doe',
        username: 'janedoe',
      }),
    ).rejects.toThrow('Username already taken');
  });

  it('throws ConflictException when email is already registered', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });
    firebase.createUser.mockRejectedValueOnce({ code: 'auth/email-already-exists' } as never);

    await expect(
      service.register({
        email: 'jane@example.com',
        password: 'password123',
        display_name: 'Jane Doe',
        username: 'jane_new',
      }),
    ).rejects.toThrow('Email already registered');
  });

  it('throws UnauthorizedException when refresh token is invalid', async () => {
    jwtService.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(service.refresh('invalid-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });

  it('auto-creates profile for social login first-time user', async () => {
    firebase.verifyIdToken.mockResolvedValueOnce({
      uid: 'new-google-uid',
      email: 'newuser@gmail.com',
    } as never);
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });
    mockedDirectusApi.post.mockResolvedValueOnce({
      data: { data: { ...profile, username: 'user_abc123' } },
    });

    const result = await service.login({
      provider: 'google',
      firebase_id_token: 'google-token',
    });

    expect(mockedDirectusApi.post).toHaveBeenCalledWith(
      '/items/gh_profiles',
      expect.objectContaining({
        firebase_uid: 'new-google-uid',
        email: 'newuser@gmail.com',
      }),
    );
    expect(result.access_token).toBe('access-token');
  });

  it('throws BadRequestException for unsupported auth provider', async () => {
    await expect(
      service.login({
        provider: 'unsupported' as never,
      }),
    ).rejects.toThrow('INVALID_PROVIDER');
  });
});
