import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadService } from '@/modules/upload/upload.service';
import { AvailabilityStatus } from '@/types/profile.types';
import { UserRole } from '@/types/auth.types';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;
  let uploadService: jest.Mocked<UploadService>;

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
    username_updated_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const currentUser = {
    profile_id: 'profile-id',
    username: 'janedoe',
    is_verified: false,
    role: UserRole.STUDENT,
  };

  beforeEach(() => {
    profileService = {
      get: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      setAvatar: jest.fn(),
      setFcmToken: jest.fn(),
      setPrefs: jest.fn(),
      canRename: jest.fn(),
      isTaken: jest.fn(),
    } as any;

    uploadService = {
      base64: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    } as any;

    controller = new ProfileController(profileService, uploadService);
  });

  describe('getMe', () => {
    it('returns current user profile', async () => {
      profileService.get.mockResolvedValueOnce({ success: true, data: profile });

      const result = await controller.getMe(currentUser);

      expect(result).toEqual({ success: true, data: profile });
      expect(profileService.get).toHaveBeenCalledWith('profile-id');
    });

    it('throws NotFoundException when profile not found', async () => {
      profileService.get.mockResolvedValueOnce({ success: false, error: 'Not found' });

      await expect(controller.getMe(currentUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    describe('basic_info', () => {
      it('updates profile with basic info', async () => {
        profileService.isTaken.mockResolvedValueOnce(false);
        profileService.canRename.mockResolvedValueOnce(true);
        profileService.update.mockResolvedValueOnce({ success: true, data: profile });

        const dto = {
          type: 'basic_info' as const,
          display_name: 'Jane Smith',
          username: 'janesmith',
          bio: 'New bio',
          skills: ['typescript'],
          availability_status: AvailabilityStatus.BUSY,
        };

        const result = await controller.updateMe(currentUser, dto);

        expect(result.success).toBe(true);
        expect(profileService.update).toHaveBeenCalledWith('profile-id', {
          display_name: 'Jane Smith',
          username: 'janesmith',
          bio: 'New bio',
          skills: ['typescript'],
          availability_status: AvailabilityStatus.BUSY,
        });
      });

      it('throws ConflictException when username is taken', async () => {
        profileService.isTaken.mockResolvedValueOnce(true);

        const dto = { type: 'basic_info' as const, username: 'taken_username' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(ConflictException);
      });

      it('throws BadRequestException when username change cooldown not satisfied', async () => {
        profileService.isTaken.mockResolvedValueOnce(false);
        profileService.canRename.mockResolvedValueOnce(false);

        const dto = { type: 'basic_info' as const, username: 'newusername' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(
          'Username can only be changed once every 30 days',
        );
      });

      it('throws InternalServerErrorException when update fails', async () => {
        profileService.update.mockResolvedValueOnce({ success: false, error: 'Update failed' });

        const dto = { type: 'basic_info' as const, display_name: 'Jane Smith' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('avatar', () => {
      it('uploads avatar and updates profile', async () => {
        profileService.get.mockResolvedValueOnce({ success: true, data: profile });
        uploadService.base64.mockResolvedValueOnce({
          success: true,
          data: { url: 'https://example.com/new-avatar.jpg', key: 'avatars/new-key.jpg' },
        });
        profileService.setAvatar.mockResolvedValueOnce({ success: true, data: profile });

        const dto = { type: 'avatar' as const, avatar_base64: 'data:image/png;base64,abc123' };

        const result = await controller.updateMe(currentUser, dto);

        expect(result.success).toBe(true);
        expect(uploadService.base64).toHaveBeenCalledWith(dto.avatar_base64, 'avatars');
        expect(uploadService.remove).toHaveBeenCalledWith('avatars/profile-id.jpg');
        expect(profileService.setAvatar).toHaveBeenCalledWith(
          'profile-id',
          'https://example.com/new-avatar.jpg',
          'avatars/new-key.jpg',
        );
      });

      it('throws BadRequestException when avatar_base64 is missing', async () => {
        const dto = { type: 'avatar' as const };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(BadRequestException);
      });

      it('throws BadRequestException when upload fails with 400', async () => {
        profileService.get.mockResolvedValueOnce({ success: true, data: profile });
        uploadService.base64.mockResolvedValueOnce({
          success: false,
          status: 400,
          error: 'Invalid image',
        });

        const dto = { type: 'avatar' as const, avatar_base64: 'data:image/png;base64,bad' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(BadRequestException);
      });

      it('throws InternalServerErrorException when upload fails with 500', async () => {
        profileService.get.mockResolvedValueOnce({ success: true, data: profile });
        uploadService.base64.mockResolvedValueOnce({
          success: false,
          status: 500,
          error: 'Upload service error',
        });

        const dto = { type: 'avatar' as const, avatar_base64: 'data:image/png;base64,error' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });

      it('does not fail if deleting old avatar throws', async () => {
        profileService.get.mockResolvedValueOnce({ success: true, data: profile });
        uploadService.base64.mockResolvedValueOnce({
          success: true,
          data: { url: 'https://example.com/new-avatar.jpg', key: 'avatars/new-key.jpg' },
        });
        uploadService.remove.mockRejectedValueOnce(new Error('Delete failed'));
        profileService.setAvatar.mockResolvedValueOnce({ success: true, data: profile });

        const dto = { type: 'avatar' as const, avatar_base64: 'data:image/png;base64,abc123' };

        const result = await controller.updateMe(currentUser, dto);

        expect(result.success).toBe(true);
      });
    });

    describe('fcm_token', () => {
      it('updates FCM token', async () => {
        profileService.setFcmToken.mockResolvedValueOnce({ success: true, data: profile });

        const dto = { type: 'fcm_token' as const, fcm_token: 'new-token' };

        const result = await controller.updateMe(currentUser, dto);

        expect(result.success).toBe(true);
        expect(profileService.setFcmToken).toHaveBeenCalledWith('profile-id', 'new-token');
      });

      it('throws BadRequestException when fcm_token is missing', async () => {
        const dto = { type: 'fcm_token' as const };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(BadRequestException);
      });

      it('throws InternalServerErrorException when update fails', async () => {
        profileService.setFcmToken.mockResolvedValueOnce({ success: false, error: 'Update failed' });

        const dto = { type: 'fcm_token' as const, fcm_token: 'token' };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('notification_prefs', () => {
      it('updates notification preferences', async () => {
        profileService.setPrefs.mockResolvedValueOnce({ success: true, data: profile });

        const dto = {
          type: 'notification_prefs' as const,
          notification_prefs: { email: false, sms: true },
        };

        const result = await controller.updateMe(currentUser, dto);

        expect(result.success).toBe(true);
        expect(profileService.setPrefs).toHaveBeenCalledWith('profile-id', {
          email: false,
          sms: true,
        });
      });

      it('throws BadRequestException when notification_prefs is missing', async () => {
        const dto = { type: 'notification_prefs' as const };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(BadRequestException);
      });

      it('throws InternalServerErrorException when update fails', async () => {
        profileService.setPrefs.mockResolvedValueOnce({ success: false, error: 'Update failed' });

        const dto = {
          type: 'notification_prefs' as const,
          notification_prefs: { email: true },
        };

        await expect(controller.updateMe(currentUser, dto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('getProfile', () => {
    it('returns public profile for valid username', async () => {
      profileService.find.mockResolvedValueOnce({ success: true, data: profile });

      const result = await controller.getProfile('janedoe');

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('janedoe');
      expect(profileService.find).toHaveBeenCalledWith('janedoe');
    });

    it('returns profile with gigs when type=gigs', async () => {
      profileService.find.mockResolvedValueOnce({ success: true, data: profile });

      const result = (await controller.getProfile('janedoe', 'gigs')) as any;

      expect(result.data?.gigs).toEqual([]);
    });

    it('returns profile with reviews when type=reviews', async () => {
      profileService.find.mockResolvedValueOnce({ success: true, data: profile });

      const result = (await controller.getProfile('janedoe', 'reviews')) as any;

      expect(result.data?.reviews).toEqual([]);
    });

    it('returns profile with gigs and reviews when type=full', async () => {
      profileService.find.mockResolvedValueOnce({ success: true, data: profile });

      const result = (await controller.getProfile('janedoe', 'full')) as any;

      expect(result.data?.gigs).toEqual([]);
      expect(result.data?.reviews).toEqual([]);
    });

    it('throws NotFoundException when profile not found', async () => {
      profileService.find.mockResolvedValueOnce({ success: false });

      await expect(controller.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('defaults to profile type when type not specified', async () => {
      profileService.find.mockResolvedValueOnce({ success: true, data: profile });

      const result = await controller.getProfile('janedoe');

      expect(result.data?.username).toBe('janedoe');
    });
  });
});
