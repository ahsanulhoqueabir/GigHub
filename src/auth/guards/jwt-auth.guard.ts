import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConfig } from '../../config/env.config';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConfig.secret,
      });

      // Verify user exists and is active
      const { data: user, error } = await this.db.client
        .from('profile')
        .select('active')
        .eq('id', payload.id)
        .single();

      if (error || !user) {
        throw new UnauthorizedException('User profile not found');
      }

      if (!user.active) {
        throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
      }

      // Assign the payload to the request object so it can be accessed in route handlers
      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException(e.message || 'Invalid or expired access token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
