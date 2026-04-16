import directusApi from '@/utils/directus.api';
import { ProfileService } from './profile.service';
import { AvailabilityStatus } from '@/types/profile.types';
import { UserRole } from '@/types/auth.types';
import type { Profile } from '@/types/profile.types';

jest.mock('@/utils/directus.api');

const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

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

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getProfileById ────────────────────────────────────────────────────────

  describe('getProfileById', () => {
    it('should return profile on success', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: mockProfile } });

      const result = await ProfileService.getProfileById('profile-uuid');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('profile-uuid');
    });

    it('should return error response on failure', async () => {
      mockedDirectusApi.get = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await ProfileService.getProfileById('profile-uuid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch profile');
    });
  });

  // ─── getPublicProfileByUsername ────────────────────────────────────────────

  describe('getPublicProfileByUsername', () => {
    it('should return public profile when found', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [mockProfile] } });

      const result = await ProfileService.getPublicProfileByUsername('testuser');

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('testuser');
    });

    it('should return 404 error when profile not found', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [] } });

      const result = await ProfileService.getPublicProfileByUsername('nonexistent');

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  // ─── updateBasicInfo ───────────────────────────────────────────────────────

  describe('updateBasicInfo', () => {
    it('should update profile and return updated data', async () => {
      const updated = { ...mockProfile, display_name: 'Updated Name' };
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: updated } });

      const result = await ProfileService.updateBasicInfo('profile-uuid', {
        display_name: 'Updated Name',
      });

      expect(result.success).toBe(true);
      expect(result.data?.display_name).toBe('Updated Name');
    });

    it('should set username_updated_at when username is changed', async () => {
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: mockProfile } });

      await ProfileService.updateBasicInfo('profile-uuid', { username: 'newusername' });

      const patchCall = (mockedDirectusApi.patch as jest.Mock).mock.calls[0];
      expect(patchCall[1]).toHaveProperty('username_updated_at');
    });

    it('should NOT set username_updated_at when username is not changed', async () => {
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: mockProfile } });

      await ProfileService.updateBasicInfo('profile-uuid', { display_name: 'New Name' });

      const patchCall = (mockedDirectusApi.patch as jest.Mock).mock.calls[0];
      expect(patchCall[1]).not.toHaveProperty('username_updated_at');
    });
  });

  // ─── updateAvatar ──────────────────────────────────────────────────────────

  describe('updateAvatar', () => {
    it('should update avatar url and key', async () => {
      const updated = {
        ...mockProfile,
        avatar: 'https://cdn.example.com/avatars/test.png',
        avatar_key: 'avatars/test.png',
      };
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: updated } });

      const result = await ProfileService.updateAvatar(
        'profile-uuid',
        'https://cdn.example.com/avatars/test.png',
        'avatars/test.png',
      );

      expect(result.success).toBe(true);
      expect(result.data?.avatar).toBe('https://cdn.example.com/avatars/test.png');
      expect(result.data?.avatar_key).toBe('avatars/test.png');
    });
  });

  // ─── isUsernameTaken ───────────────────────────────────────────────────────

  describe('isUsernameTaken', () => {
    it('should return true when username exists', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [mockProfile] } });

      const taken = await ProfileService.isUsernameTaken('testuser');

      expect(taken).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [] } });

      const taken = await ProfileService.isUsernameTaken('freeusername');

      expect(taken).toBe(false);
    });

    it('should return false (fail-safe) when Directus throws', async () => {
      mockedDirectusApi.get = jest.fn().mockRejectedValueOnce(new Error('Network'));

      const taken = await ProfileService.isUsernameTaken('anyname');

      expect(taken).toBe(false);
    });
  });

  // ─── canChangeUsername ─────────────────────────────────────────────────────

  describe('canChangeUsername', () => {
    it('should return true when username_updated_at is null', async () => {
      mockedDirectusApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { data: { username_updated_at: null } } });

      const can = await ProfileService.canChangeUsername('profile-uuid');

      expect(can).toBe(true);
    });

    it('should return true when last change was > 30 days ago', async () => {
      const longAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      mockedDirectusApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { data: { username_updated_at: longAgo } } });

      const can = await ProfileService.canChangeUsername('profile-uuid');

      expect(can).toBe(true);
    });

    it('should return false when last change was < 30 days ago', async () => {
      const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      mockedDirectusApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { data: { username_updated_at: recent } } });

      const can = await ProfileService.canChangeUsername('profile-uuid');

      expect(can).toBe(false);
    });

    it('should return true (fail-open) when Directus throws', async () => {
      mockedDirectusApi.get = jest.fn().mockRejectedValueOnce(new Error('Network'));

      const can = await ProfileService.canChangeUsername('profile-uuid');

      expect(can).toBe(true);
    });
  });

  // ─── updateFcmToken ────────────────────────────────────────────────────────

  describe('updateFcmToken', () => {
    it('should update fcm token successfully', async () => {
      const updated = { ...mockProfile, fcm_token: 'new-fcm-token' };
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: updated } });

      const result = await ProfileService.updateFcmToken('profile-uuid', 'new-fcm-token');

      expect(result.success).toBe(true);
      expect(result.data?.fcm_token).toBe('new-fcm-token');
    });
  });

  // ─── updateNotificationPrefs ───────────────────────────────────────────────

  describe('updateNotificationPrefs', () => {
    it('should update notification preferences', async () => {
      const prefs = { new_order: true, message: false };
      const updated = { ...mockProfile, notification_prefs: prefs };
      mockedDirectusApi.patch = jest.fn().mockResolvedValueOnce({ data: { data: updated } });

      const result = await ProfileService.updateNotificationPrefs('profile-uuid', prefs);

      expect(result.success).toBe(true);
      expect(result.data?.notification_prefs).toEqual(prefs);
    });
  });
});
