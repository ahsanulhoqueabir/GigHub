import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { ok, fail } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { Profile, PublicProfile } from '@/types/profile.types';

@Injectable()
export class ProfileService {
  private readonly collection = 'gh_profiles';

  private fields(): string {
    return [
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
    ].join(',');
  }

  private async patch(
    id: string,
    payload: Record<string, unknown>,
    errMsg: string,
  ): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.patch<{ data: Profile }>(
        `/items/${this.collection}/${id}`,
        payload,
      );
      return ok(data.data);
    } catch (error) {
      return fail(errMsg, error);
    }
  }

  async get(id: string): Promise<ServiceResponse<Profile>> {
    try {
      const { data } = await directusApi.get<{ data: Profile }>(`/items/${this.collection}/${id}`);
      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch profile', error);
    }
  }

  async find(username: string): Promise<ServiceResponse<PublicProfile>> {
    try {
      const { data } = await directusApi.get<{ data: Profile[] }>(`/items/${this.collection}`, {
        params: {
          filter: { username: { _eq: username } },
          fields: this.fields(),
          limit: 1,
        },
      });

      if (!data.data[0]) {
        return fail('Profile not found', undefined, 404);
      }

      return ok(data.data[0] as PublicProfile);
    } catch (error) {
      return fail('Failed to fetch profile', error);
    }
  }

  async update(
    id: string,
    dto: Partial<
      Pick<Profile, 'display_name' | 'username' | 'bio' | 'skills' | 'availability_status'>
    >,
  ): Promise<ServiceResponse<Profile>> {
    return this.patch(id, { ...dto }, 'Failed to update profile');
  }

  async setAvatar(id: string, avatarUrl: string): Promise<ServiceResponse<Profile>> {
    return this.patch(id, { avatar: avatarUrl }, 'Failed to update avatar');
  }

  async setFcmToken(id: string, fcmToken: string): Promise<ServiceResponse<Profile>> {
    return this.patch(id, { fcm_token: fcmToken }, 'Failed to update FCM token');
  }

  async setPrefs(id: string, prefs: Record<string, boolean>): Promise<ServiceResponse<Profile>> {
    return this.patch(
      id,
      { notification_prefs: prefs },
      'Failed to update notification preferences',
    );
  }

  async canRename(id: string): Promise<boolean> {
    return true;
  }

  async isTaken(username: string, excludeId?: string): Promise<boolean> {
    try {
      const filter: Record<string, unknown> = { username: { _eq: username } };
      if (excludeId) {
        filter['id'] = { _neq: excludeId };
      }
      const { data } = await directusApi.get<{ data: Profile[] }>(`/items/${this.collection}`, {
        params: { filter, fields: 'id', limit: 1 },
      });
      return data.data.length > 0;
    } catch {
      return false;
    }
  }
}
