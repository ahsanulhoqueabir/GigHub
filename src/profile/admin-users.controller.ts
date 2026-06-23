import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Auth } from '../auth/decorators/auth.decorator';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { createSuccessResponse } from '../common/utils/response.util';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@Auth({ roles: ['admin'] })
export class AdminUsersController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const result = await this.profileService.adminUpdateUser(id, dto);
    return createSuccessResponse(result, 'User updated successfully by admin');
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async adminChangePassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    const result = await this.profileService.adminChangePassword(id, password);
    return createSuccessResponse(
      result,
      'User password changed successfully by admin',
    );
  }
}
