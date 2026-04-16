import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UploadService } from '@/modules/upload/upload.service';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { JwtPayload } from '@/types/auth.types';
import type { ProfileViewType } from '@/types/profile.types';

@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    const result = await this.profileService.get(user.profile_id);
    if (!result.success) throw new NotFoundException('Profile not found');
    return result;
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    switch (dto.type) {
      case 'basic_info': {
        if (dto.username) {
          const taken = await this.profileService.isTaken(dto.username, user.profile_id);
          if (taken) throw new ConflictException('Username already taken');

          // Enforce 30-day username change limit
          const canChange = await this.profileService.canRename(user.profile_id);
          if (!canChange) {
            throw new BadRequestException('Username can only be changed once every 30 days');
          }
        }

        const result = await this.profileService.update(user.profile_id, {
          display_name: dto.display_name,
          username: dto.username,
          bio: dto.bio,
          skills: dto.skills,
          availability_status: dto.availability_status,
        });

        if (!result.success) throw new InternalServerErrorException(result.error);
        return result;
      }

      case 'avatar': {
        if (!dto.avatar_base64) {
          throw new BadRequestException('avatar_base64 is required for type avatar');
        }

        // Get current avatar to delete old one
        const current = await this.profileService.get(user.profile_id);
        const oldAvatarKey = current.data?.avatar_key ?? null;

        // Upload new avatar to R2
        const upload = await this.uploadService.base64(dto.avatar_base64, 'avatars');
        if (!upload.success) {
          if (upload.status === 400) throw new BadRequestException(upload.error);
          throw new InternalServerErrorException(upload.error);
        }

        // Delete old avatar if exists
        if (oldAvatarKey) {
          await this.uploadService.remove(oldAvatarKey).catch(() => {});
        }

        // Update profile with new avatar URL and key
        const result = await this.profileService.setAvatar(
          user.profile_id,
          upload.data!.url,
          upload.data!.key,
        );
        if (!result.success) throw new InternalServerErrorException(result.error);
        return result;
      }

      case 'fcm_token': {
        if (!dto.fcm_token) throw new BadRequestException('fcm_token is required');
        const result = await this.profileService.setFcmToken(user.profile_id, dto.fcm_token);
        if (!result.success) throw new InternalServerErrorException(result.error);
        return result;
      }

      case 'notification_prefs': {
        if (!dto.notification_prefs) {
          throw new BadRequestException('notification_prefs is required');
        }
        const result = await this.profileService.setPrefs(user.profile_id, dto.notification_prefs);
        if (!result.success) throw new InternalServerErrorException(result.error);
        return result;
      }

      default:
        throw new BadRequestException('Invalid update type');
    }
  }

  @Public()
  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @Query('type') type: ProfileViewType = 'profile',
  ) {
    const profileResult = await this.profileService.find(username);
    if (!profileResult.success || !profileResult.data) {
      throw new NotFoundException('Profile not found');
    }

    if (type === 'profile') {
      return profileResult;
    }

    // gigs, reviews, full — stub responses until Phase 2 collections are created
    const base = profileResult.data;
    if (type === 'gigs') {
      return { success: true, data: { ...base, gigs: [] } };
    }
    if (type === 'reviews') {
      return { success: true, data: { ...base, reviews: [] } };
    }
    if (type === 'full') {
      return { success: true, data: { ...base, gigs: [], reviews: [] } };
    }

    return profileResult;
  }
}
