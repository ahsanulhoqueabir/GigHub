import { SetMetadata } from '@nestjs/common';

export interface AuthOptions {
  roles?: string[];
  verified?: boolean;
}

export const AUTH_OPTIONS_KEY = 'auth_options';

/**
 * Custom decorator to specify authentication and authorization requirements.
 * Accepts a single object with optional `roles` and `verified` fields.
 *
 * Example:
 * \@Auth({ roles: ['admin', 'moderator'], verified: true })
 */
export const Auth = (options: AuthOptions = {}) =>
  SetMetadata(AUTH_OPTIONS_KEY, options);
