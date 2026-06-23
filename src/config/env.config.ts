import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure .env variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const serverConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
};

export const dbConfig = {
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/postgres',
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucket: process.env.R2_BUCKET || '',
  publicUrl: process.env.R2_PUBLIC_URL || '',
};

export const firebaseConfig = {
  projectId: process.env.FCM_PROJECT_ID || '',
  clientEmail: process.env.FCM_CLIENT_EMAIL || '',
  privateKey: process.env.FCM_PRIVATE_KEY
    ? process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
};

export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'http://localhost:8000',
  secretKey: process.env.SUPABASE_SECRET_KEY || '',
};
