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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { JwtPayload } from '@/types/auth.types';
import type { ProfileViewType } from '@/types/profile.types';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    const result = await ProfileService.getProfileById(user.profile_id);
    if (!result.success) throw new NotFoundException('Profile not found');
    return result;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    switch (dto.type) {
      case 'basic_info': {
        if (dto.username) {
          const taken = await ProfileService.isUsernameTaken(dto.username, user.profile_id);
          if (taken) throw new ConflictException('Username already taken');
        }

        const result = await ProfileService.updateBasicInfo(user.profile_id, {
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
        // Decode and upload via UploadService is handled at the service layer
        // Here we expect the controller to call UploadService; for now return placeholder
        // Full integration is done in Phase 1.6.6
        throw new BadRequestException(
          'Avatar upload requires multipart; use POST /upload/image then PATCH /profiles/me with type: avatar',
        );
      }

      case 'fcm_token': {
        if (!dto.fcm_token) throw new BadRequestException('fcm_token is required');
        const result = await ProfileService.updateFcmToken(user.profile_id, dto.fcm_token);
        if (!result.success) throw new InternalServerErrorException(result.error);
        return result;
      }

      case 'notification_prefs': {
        if (!dto.notification_prefs) {
          throw new BadRequestException('notification_prefs is required');
        }
        const result = await ProfileService.updateNotificationPrefs(
          user.profile_id,
          dto.notification_prefs,
        );
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
    const result = await ProfileService.getPublicProfileByUsername(username);
    if (!result.success || !result.data) throw new NotFoundException('Profile not found');
    return result;
  }
}
