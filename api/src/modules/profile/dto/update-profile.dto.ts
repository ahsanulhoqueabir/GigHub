import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
  IsEnum,
  IsBase64,
  IsObject,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AvailabilityStatus, ProfileUpdateType } from '@/types/profile.types';

export class UpdateProfileDto {
  @IsIn(['basic_info', 'avatar', 'fcm_token', 'notification_prefs'])
  type!: ProfileUpdateType;

  // basic_info fields
  @ValidateIf((o: UpdateProfileDto) => o.type === 'basic_info')
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  display_name?: string;

  @ValidateIf((o: UpdateProfileDto) => o.type === 'basic_info')
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username may only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  username?: string;

  @ValidateIf((o: UpdateProfileDto) => o.type === 'basic_info')
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ValidateIf((o: UpdateProfileDto) => o.type === 'basic_info')
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ValidateIf((o: UpdateProfileDto) => o.type === 'basic_info')
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability_status?: AvailabilityStatus;

  // avatar field — accepts Base64 data URI
  @ValidateIf((o: UpdateProfileDto) => o.type === 'avatar')
  @IsString()
  avatar_base64?: string;

  // fcm_token field
  @ValidateIf((o: UpdateProfileDto) => o.type === 'fcm_token')
  @IsString()
  fcm_token?: string;

  // notification_prefs field
  @ValidateIf((o: UpdateProfileDto) => o.type === 'notification_prefs')
  @IsObject()
  notification_prefs?: Record<string, boolean>;
}
