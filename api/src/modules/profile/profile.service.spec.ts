import { ProfileService } from './profile.service';
import directusApi from '@/utils/directus.api';
import { AvailabilityStatus } from '@/types/profile.types';
import { UserRole } from '@/types/auth.types';

jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

describe('ProfileService', () => {
  let service: ProfileService;

  const profile = {
    id: 'profile-id',
    firebase_uid: 'firebase-uid',
    display_name: 'Jane Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar.jpg',
    avatar_key: 'avatars/profile-id.jpg',
    bio: 'I love working on cool projects',
    skills: ['typescript', 'nestjs'],
    availability_status: AvailabilityStatus.AVAILABLE,
    is_verified: false,
    role: UserRole.STUDENT,
    total_earnings: 0,
    avg_rating: 0,
    total_reviews: 0,
    fcm_token: 'fcm-token-123',
    notification_prefs: { email: true, sms: false },
    username_updated_at: '2025-12-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    service = new ProfileService();
    mockedDirectusApi.get.mockReset();
    mockedDirectusApi.patch.mockReset();
  });

  describe('get', () => {
    it('returns profile when found', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: profile } });

      const result = await service.get('profile-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(profile);
      expect(mockedDirectusApi.get).toHaveBeenCalledWith('/items/gh_profiles/profile-id');
    });

    it('returns error when profile fetch fails', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.get('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch profile');
    });
  });

  describe('find', () => {
    it('returns public profile for valid username', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({
        data: { data: [profile] },
      });

      const result = await service.find('janedoe');

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('janedoe');
      expect(mockedDirectusApi.get).toHaveBeenCalledWith(
        '/items/gh_profiles',
        expect.objectContaining({
          params: expect.objectContaining({
            filter: { username: { _eq: 'janedoe' } },
          }),
        }),
      );
    });

    it('returns 404 when profile not found', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await service.find('nonexistent');

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toContain('Profile not found');
    });

    it('returns error on query failure', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Query error'));

      const result = await service.find('janedoe');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch profile');
    });
  });

  describe('update', () => {
    it('updates basic info and sets username_updated_at', async () => {
      const updateDto = {
        display_name: 'Jane Smith',
        username: 'janesmith',
        bio: 'New bio',
        skills: ['typescript', 'react'],
        availability_status: AvailabilityStatus.BUSY,
      };

      mockedDirectusApi.patch.mockResolvedValueOnce({
        data: { data: { ...profile, ...updateDto } },
      });

      const result = await service.update('profile-id', updateDto);

      expect(result.success).toBe(true);
      expect(mockedDirectusApi.patch).toHaveBeenCalledWith(
        '/items/gh_profiles/profile-id',
        expect.objectContaining({
          display_name: 'Jane Smith',
          username_updated_at: expect.any(String),
        }),
      );
    });

    it('updates without username_updated_at when username not changed', async () => {
      const updateDto = {
        display_name: 'Jane Smith',
        bio: 'New bio',
      };

      mockedDirectusApi.patch.mockResolvedValueOnce({
        data: { data: { ...profile, ...updateDto } },
      });

      const result = await service.update('profile-id', updateDto);

      expect(result.success).toBe(true);
      expect(mockedDirectusApi.patch).toHaveBeenCalledWith(
        '/items/gh_profiles/profile-id',
        expect.not.objectContaining({
          username_updated_at: expect.anything(),
        }),
      );
    });

    it('returns error on update failure', async () => {
      mockedDirectusApi.patch.mockRejectedValueOnce(new Error('Patch error'));

      const result = await service.update('profile-id', { display_name: 'Jane Smith' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update profile');
    });
  });

  describe('setAvatar', () => {
    it('updates avatar and avatar_key', async () => {
      mockedDirectusApi.patch.mockResolvedValueOnce({
        data: {
          data: {
            ...profile,
            avatar: 'https://example.com/new-avatar.jpg',
            avatar_key: 'avatars/new-key.jpg',
          },
        },
      });

      const result = await service.setAvatar(
        'profile-id',
        'https://example.com/new-avatar.jpg',
        'avatars/new-key.jpg',
      );

      expect(result.success).toBe(true);
      expect(mockedDirectusApi.patch).toHaveBeenCalledWith('/items/gh_profiles/profile-id', {
        avatar: 'https://example.com/new-avatar.jpg',
        avatar_key: 'avatars/new-key.jpg',
      });
    });

    it('returns error on avatar update failure', async () => {
      mockedDirectusApi.patch.mockRejectedValueOnce(new Error('Upload error'));

      const result = await service.setAvatar('profile-id', 'https://example.com/avatar.jpg', 'key');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update avatar');
    });
  });

  describe('setFcmToken', () => {
    it('updates FCM token', async () => {
      mockedDirectusApi.patch.mockResolvedValueOnce({
        data: { data: { ...profile, fcm_token: 'new-fcm-token' } },
      });

      const result = await service.setFcmToken('profile-id', 'new-fcm-token');

      expect(result.success).toBe(true);
      expect(mockedDirectusApi.patch).toHaveBeenCalledWith('/items/gh_profiles/profile-id', {
        fcm_token: 'new-fcm-token',
      });
    });

    it('returns error on FCM token update failure', async () => {
      mockedDirectusApi.patch.mockRejectedValueOnce(new Error('Update error'));

      const result = await service.setFcmToken('profile-id', 'token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update FCM token');
    });
  });

  describe('setPrefs', () => {
    it('updates notification preferences', async () => {
      const prefs = { email: false, sms: true };
      mockedDirectusApi.patch.mockResolvedValueOnce({
        data: { data: { ...profile, notification_prefs: prefs } },
      });

      const result = await service.setPrefs('profile-id', prefs);

      expect(result.success).toBe(true);
      expect(mockedDirectusApi.patch).toHaveBeenCalledWith('/items/gh_profiles/profile-id', {
        notification_prefs: prefs,
      });
    });

    it('returns error on prefs update failure', async () => {
      mockedDirectusApi.patch.mockRejectedValueOnce(new Error('Update error'));

      const result = await service.setPrefs('profile-id', { email: false });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update notification preferences');
    });
  });

  describe('canRename', () => {
    it('returns true if username was never changed', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({
        data: { data: { ...profile, username_updated_at: null } },
      });

      const result = await service.canRename('profile-id');

      expect(result).toBe(true);
    });

    it('returns true if 30 days have passed since last username change', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      mockedDirectusApi.get.mockResolvedValueOnce({
        data: { data: { ...profile, username_updated_at: thirtyDaysAgo } },
      });

      const result = await service.canRename('profile-id');

      expect(result).toBe(true);
    });

    it('returns false if less than 30 days have passed', async () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      mockedDirectusApi.get.mockResolvedValueOnce({
        data: { data: { ...profile, username_updated_at: tenDaysAgo } },
      });

      const result = await service.canRename('profile-id');

      expect(result).toBe(false);
    });

    it('returns true on query failure (fail-open)', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Query error'));

      const result = await service.canRename('profile-id');

      expect(result).toBe(true);
    });
  });

  describe('isTaken', () => {
    it('returns true when username is taken', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({
        data: { data: [{ id: 'other-profile-id' }] },
      });

      const result = await service.isTaken('janedoe');

      expect(result).toBe(true);
      expect(mockedDirectusApi.get).toHaveBeenCalledWith(
        '/items/gh_profiles',
        expect.objectContaining({
          params: expect.objectContaining({
            filter: { username: { _eq: 'janedoe' } },
          }),
        }),
      );
    });

    it('returns false when username is available', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await service.isTaken('available_username');

      expect(result).toBe(false);
    });

    it('excludes own profile when checking with excludeId', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });

      await service.isTaken('janedoe', 'profile-id');

      expect(mockedDirectusApi.get).toHaveBeenCalledWith(
        '/items/gh_profiles',
        expect.objectContaining({
          params: expect.objectContaining({
            filter: expect.objectContaining({
              id: { _neq: 'profile-id' },
            }),
          }),
        }),
      );
    });

    it('returns false on query failure (fail-open)', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Query error'));

      const result = await service.isTaken('janedoe');

      expect(result).toBe(false);
    });
  });
});
