import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';
  const corsOrigin = process.env.CORS_ORIGIN;
  const enableSwagger = (process.env.ENABLE_SWAGGER ?? (isProduction ? 'false' : 'true')) === 'true';

  if (isProduction && !corsOrigin?.trim()) {
    throw new Error('CORS_ORIGIN is required in production');
  }

  app.enableCors({
    origin: corsOrigin
      ? corsOrigin
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : false,
    credentials: true,
  });
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CashFlow API')
      .setDescription('API documentation for the CashFlow MVP backend.')
      .setVersion('0.1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'JWT-auth',
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  const port = process.env.PORT ?? '3000';
  await app.listen(Number(port));
}

void bootstrap();
