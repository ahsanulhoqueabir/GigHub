import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { createSuccessResponse } from '../common/utils/response.util';

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: RequestUser) {
    const result = await this.profileService.getProfile(user.id);
    return createSuccessResponse(result, 'Profile retrieved successfully');
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    // Controller level sanitization: role, active, and verified must not be updated by the user themselves
    const sanitizedDto = { ...dto } as Record<string, any>;
    delete sanitizedDto.role;
    delete sanitizedDto.active;
    delete sanitizedDto.verified;

    const result = await this.profileService.updateProfile(
      user.id,
      sanitizedDto as UpdateProfileDto,
    );
    return createSuccessResponse(result, 'Profile updated successfully');
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.profileService.changePassword(user.id, dto);
    return createSuccessResponse(result, 'Password changed successfully');
  }
}
