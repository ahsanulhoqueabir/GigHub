import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/env.config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;
  private readonly logger = new Logger(DatabaseService.name);

  onModuleInit() {
    this.logger.log('Initializing Supabase client...');

    let url = supabaseConfig.url;
    let secretKey = supabaseConfig.secretKey;

    // Check if running outside docker and attempt to auto-detect local Supabase credentials
    const isDocker = fs.existsSync('/.dockerenv');
    if (!isDocker) {
      this.logger.log(
        'Running outside Docker container. Detecting local Supabase settings...',
      );
      const supabaseEnvPath = path.resolve(
        process.cwd(),
        'infrastructure/supabase/.env',
      );
      if (fs.existsSync(supabaseEnvPath)) {
        try {
          const envRaw = fs.readFileSync(supabaseEnvPath, 'utf8');
          const parsed = dotenv.parse(envRaw);
          url = 'http://localhost:8000';
          secretKey =
            parsed.SUPABASE_SECRET_KEY || parsed.SERVICE_ROLE_KEY || secretKey;
          this.logger.log(
            'Using auto-detected local Supabase client configuration.',
          );
        } catch (e) {
          this.logger.warn(
            `Failed to parse local Supabase .env file: ${e.message}`,
          );
        }
      }
    }

    if (!url || !secretKey) {
      this.logger.error(
        'Supabase URL or Secret Key is missing! Client cannot be initialized properly.',
      );
    }

    this.supabaseClient = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }
}
