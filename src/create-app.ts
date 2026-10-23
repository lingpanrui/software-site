import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 创建并初始化 Nest 应用（不监听端口，供本地 main 与 Vercel Serverless 复用）。
 * serveFrontend=false 时跳过前端静态托管（Vercel 由静态托管负责）。
 */
export async function createApp(options: { serveFrontend?: boolean } = {}): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  if (options.serveFrontend !== false) {
    const clientDist = path.resolve(__dirname, 'client');
    if (fs.existsSync(clientDist)) {
      app.useStaticAssets(clientDist, {
        prefix: '/',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      });
      const express = app.getHttpAdapter().getInstance();
      express.get(/^\/(?!api|uploads).*/, (_req: unknown, res: { sendFile: (p: string) => void }) => {
        res.sendFile(path.join(clientDist, 'index.html'));
      });
    }
  }

  return app;
}
