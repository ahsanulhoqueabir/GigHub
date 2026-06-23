import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { jwtConfig } from '../../config/env.config';
import { DatabaseService } from '../../database/database.service';
import { AUTH_OPTIONS_KEY, AuthOptions } from '../decorators/auth.decorator';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface UserAuthFields {
  id: string;
  role: string;
  active: boolean;
  verified: boolean;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: DatabaseService,
    private readonly reflector: Reflector,
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

      // Verify user exists and is active, fetching id, role, active, and verified
      const response = await this.db.client
        .from('profile')
        .select('id, role, active, verified')
        .eq('id', payload.id)
        .single();

      const user = response.data;
      const error = response.error;

      if (error || !user) {
        throw new UnauthorizedException('User profile not found');
      }

      if (!user.active) {
        throw new UnauthorizedException(
          'Your account has been deactivated. Please contact support.',
        );
      }

      // Retrieve authentication options from handler or class level
      const options = this.reflector.getAllAndOverride<AuthOptions>(
        AUTH_OPTIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (options) {
        // If verified is explicitly set to true, verify the user is verified
        if (options.verified === true && !user.verified) {
          throw new ForbiddenException(
            'Your account must be verified to access this resource.',
          );
        }

        // If roles are specified, check that user has one of the allowed roles
        if (options.roles && options.roles.length > 0) {
          const hasRole = options.roles.includes(user.role);
          if (!hasRole) {
            throw new ForbiddenException(
              'You do not have the required permissions to access this resource.',
            );
          }
        }
      }

      // Assign the payload and database attributes to the request user object
      request['user'] = {
        ...payload,
        id: user.id,
        role: user.role,
        active: user.active,
        verified: user.verified,
      };
    } catch (e) {
      if (
        e instanceof UnauthorizedException ||
        e instanceof ForbiddenException
      ) {
        throw e;
      }
      const errorMessage =
        e instanceof Error ? e.message : 'Invalid or expired access token';
      throw new UnauthorizedException(errorMessage);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
