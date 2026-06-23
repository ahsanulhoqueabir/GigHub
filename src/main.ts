import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { serverConfig } from './config/env.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable security headers
  app.use(helmet());

  // Enable response compression
  app.use(compression());

  // Use global ValidationPipe for body validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Use global exception filter for consistent error response format
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = serverConfig.port || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
