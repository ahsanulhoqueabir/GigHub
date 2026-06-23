import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { DatabaseService } from '../database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ProfileRecord } from '../types';

@Injectable()
export class ProfileService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Retrieves profile of a user by their ID.
   * Excludes sensitive fields like password and google uid.
   */
  async getProfile(
    userId: string,
  ): Promise<Omit<ProfileRecord, 'password' | 'google'>> {
    const response = await this.db.client
      .from('profile')
      .select('*')
      .eq('id', userId)
      .single();

    const user = response.data as ProfileRecord | null;
    const error = response.error;

    if (error || !user) {
      throw new NotFoundException('User profile not found');
    }

    const profileData = { ...user };
    delete profileData.password;
    delete profileData.google;

    return profileData;
  }

  /**
   * Updates a user's profile information.
   * Checks for unique constraints like username.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<ProfileRecord, 'password' | 'google'>> {
    // Sanitize any extra properties at service level
    const updateData: Partial<UpdateProfileDto> = { ...dto };

    if (updateData.username) {
      const response = await this.db.client
        .from('profile')
        .select('id')
        .eq('username', updateData.username)
        .neq('id', userId);

      const data = response.data;
      const error = response.error;

      if (error) {
        throw new BadRequestException('Failed to validate username uniqueness');
      }

      if (data && data.length > 0) {
        throw new BadRequestException('Username is already taken');
      }
    }

    const response = await this.db.client
      .from('profile')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    const updatedUser = response.data as ProfileRecord | null;
    const updateError = response.error;

    if (updateError || !updatedUser) {
      throw new BadRequestException(
        `Failed to update profile: ${updateError ? updateError.message : 'Unknown error'}`,
      );
    }

    const profileData = { ...updatedUser };
    delete profileData.password;
    delete profileData.google;

    return profileData;
  }

  /**
   * Changes the logged-in user's password after verifying the old password.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const response = await this.db.client
      .from('profile')
      .select('password')
      .eq('id', userId)
      .single();

    const user = response.data as { password?: string } | null;
    const error = response.error;

    if (error || !user) {
      throw new NotFoundException('User profile not found');
    }

    if (user.password) {
      const isPasswordValid = await argon2.verify(
        user.password,
        dto.currentPassword,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect current password');
      }
    } else {
      throw new BadRequestException(
        'Local authentication password is not set for this account (social login).',
      );
    }

    const hashedNewPassword = await argon2.hash(dto.newPassword);

    const updateResponse = await this.db.client
      .from('profile')
      .update({ password: hashedNewPassword })
      .eq('id', userId);

    if (updateResponse.error) {
      throw new BadRequestException(
        `Failed to update password: ${updateResponse.error.message}`,
      );
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Admin-only method to update role, active status, verified status, or password of any user.
   */
  async adminUpdateUser(
    targetUserId: string,
    dto: AdminUpdateUserDto,
  ): Promise<Omit<ProfileRecord, 'password' | 'google'>> {
    const updateData: Record<string, any> = {};

    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }
    if (dto.active !== undefined) {
      updateData.active = dto.active;
    }
    if (dto.verified !== undefined) {
      updateData.verified = dto.verified;
    }
    if (dto.password !== undefined) {
      updateData.password = await argon2.hash(dto.password);
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const response = await this.db.client
      .from('profile')
      .update(updateData)
      .eq('id', targetUserId)
      .select('*')
      .single();

    const updatedUser = response.data as ProfileRecord | null;
    const updateError = response.error;

    if (updateError || !updatedUser) {
      throw new BadRequestException(
        `Failed to update user profile: ${updateError ? updateError.message : 'Unknown error'}`,
      );
    }

    const profileData = { ...updatedUser };
    delete profileData.password;
    delete profileData.google;

    return profileData;
  }

  /**
   * Admin-only method to update the password of a user.
   */
  async adminChangePassword(
    targetUserId: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const hashedPassword = await argon2.hash(newPassword);

    const updateResponse = await this.db.client
      .from('profile')
      .update({ password: hashedPassword })
      .eq('id', targetUserId);

    if (updateResponse.error) {
      throw new BadRequestException(
        `Failed to change user password: ${updateResponse.error.message}`,
      );
    }

    return { message: 'User password changed successfully by admin' };
  }
}
