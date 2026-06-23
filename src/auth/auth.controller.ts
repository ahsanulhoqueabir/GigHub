import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleSignupDto } from './dto/google-signup.dto';
import { createSuccessResponse } from '../common/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignupDto) {
    const result = await this.authService.signUp(dto);
    return createSuccessResponse(result, 'User signup successful');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return createSuccessResponse(result, 'User login successful');
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: GoogleAuthDto) {
    const result = await this.authService.googleAuth(dto);
    return createSuccessResponse(result, 'Google authentication successful');
  }

  @Post('google/signup')
  @HttpCode(HttpStatus.CREATED)
  async googleSignUp(@Body() dto: GoogleSignupDto) {
    const result = await this.authService.googleSignUp(dto);
    return createSuccessResponse(result, 'Google signup successful');
  }
}
