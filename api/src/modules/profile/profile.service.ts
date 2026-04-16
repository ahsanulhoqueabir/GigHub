import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { successResponse, errorResponse } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { Profile, PublicProfile } from '@/types/profile.types';

@Injectable()
export class ProfileService {
  private static readonly COLLECTION = 'gh_profiles';

  static async getProfileById(id: string): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.get<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to fetch profile', error);
    }
  }

  static async getPublicProfileByUsername(
    username: string,
  ): Promise<ServiceResponse<PublicProfile>> {
    try {
      const { data } = await directusApi.get<{ data: Profile[] }>(
        `/items/${ProfileService.COLLECTION}`,
        {
          params: {
            filter: { username: { _eq: username } },
            fields: [
              'id',
              'display_name',
              'username',
              'avatar',
              'bio',
              'skills',
              'availability_status',
              'is_verified',
              'avg_rating',
              'total_reviews',
              'created_at',
            ].join(','),
            limit: 1,
          },
        },
      );

      if (!data.data[0]) {
        return errorResponse('Profile not found', undefined, 404);
      }

      return successResponse(data.data[0] as PublicProfile);
    } catch (error) {
      return errorResponse('Failed to fetch profile', error);
    }
  }

  static async updateBasicInfo(
    id: string,
    dto: Partial<
      Pick<Profile, 'display_name' | 'username' | 'bio' | 'skills' | 'availability_status'>
    >,
  ): Promise<ServiceResponse<Profile>> {
    try {
      const payload: Record<string, unknown> = { ...dto };
      if (dto.username) {
        payload['username_updated_at'] = new Date().toISOString();
      }
      const { data } = await directusApi.patch<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
        payload,
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to update profile', error);
    }
  }

  static async updateAvatar(
    id: string,
    avatarUrl: string,
    avatarKey: string,
  ): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.patch<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
        { avatar: avatarUrl, avatar_key: avatarKey },
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to update avatar', error);
    }
  }

  static async updateFcmToken(id: string, fcmToken: string): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.patch<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
        { fcm_token: fcmToken },
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to update FCM token', error);
    }
  }

  static async updateNotificationPrefs(
    id: string,
    prefs: Record<string, boolean>,
  ): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.patch<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
        { notification_prefs: prefs },
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to update notification preferences', error);
    }
  }

  static async canChangeUsername(id: string): Promise<boolean> {
    try {
      const { data } = await directusApi.get<{ data: Profile }>(
        `/items/${ProfileService.COLLECTION}/${id}`,
        { params: { fields: 'username_updated_at' } },
      );
      const lastChanged = data.data?.username_updated_at;
      if (!lastChanged) return true;

      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      return Date.now() - new Date(lastChanged).getTime() >= THIRTY_DAYS_MS;
    } catch {
      return true; // Fail open: allow change if check fails
    }
  }

  static async isUsernameTaken(username: string, excludeId?: string): Promise<boolean> {
    try {
      const filter: Record<string, unknown> = { username: { _eq: username } };
      if (excludeId) {
        filter['id'] = { _neq: excludeId };
      }
      const { data } = await directusApi.get<{ data: Profile[] }>(
        `/items/${ProfileService.COLLECTION}`,
        { params: { filter, fields: 'id', limit: 1 } },
      );
      return data.data.length > 0;
    } catch {
      return false;
    }
  }
}
