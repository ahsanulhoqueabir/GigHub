import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminUpdateUserDto {
  @IsEnum(['student', 'admin', 'moderator'], { message: 'Invalid role' })
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}
