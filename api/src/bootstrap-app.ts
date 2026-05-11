import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Express } from 'express';
import { AppModule } from './app.module';

/**
 * Creates and configures the NestJS application.
 *
 * Accepts an optional Express instance so it can be used both for:
 *   - Local development  → pass nothing (Nest creates its own HTTP server, calls app.listen())
 *   - Vercel serverless   → pass a shared Express app (Nest decorates it, no app.listen() needed)
 */
export async function createApp(expressApp?: Express) {
  const app = expressApp
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
    : await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // ── Security ──────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ── Global validation pipe ────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // When used with an external Express instance (Vercel), we must explicitly
  // call init() to apply all NestJS middleware, controllers, pipes, etc.
  // onto the Express app. Without this, routes won't be registered.
  if (expressApp) {
    await app.init();
  }

  return { app, config };
}
