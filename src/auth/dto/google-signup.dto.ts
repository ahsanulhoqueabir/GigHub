import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleSignupDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsString()
  student_id: string;

  @IsOptional()
  @IsString()
  username?: string;
}
