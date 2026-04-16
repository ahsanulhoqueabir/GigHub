import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { AuthProvider } from '@/types/auth.types';

const ALLOWED_PROVIDERS: AuthProvider[] = ['password', 'google'];

export class LoginDto {
  @IsIn(ALLOWED_PROVIDERS, { message: 'provider must be one of: password, google' })
  provider!: AuthProvider;

  @ValidateIf((o: LoginDto) => o.provider === 'password')
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email?: string;

  @ValidateIf((o: LoginDto) => o.provider === 'password')
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password?: string;

  @ValidateIf((o: LoginDto) => o.provider !== 'password')
  @IsString()
  @IsNotEmpty()
  firebase_id_token?: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  display_name!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username may only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  username!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  oob_code!: string;

  @IsString()
  @MinLength(8)
  new_password!: string;
}
