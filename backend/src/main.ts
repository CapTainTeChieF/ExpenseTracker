import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('REPLACE_') || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set a strong JWT_SECRET (32+ characters) in backend/.env');
  }
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(proxyHops) && proxyHops >= 1 && proxyHops <= 2) app.getHttpAdapter().getInstance().set('trust proxy', proxyHops);
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true });
  // Cookie-session CSRF mitigation: production mutations require a trusted Origin.
  // Same-origin Vercel proxy is recommended; do not enable a wildcard CORS origin.
  app.use((req: { method: string; headers: {origin?: string}}, res: {status: (n: number) => {json: (data: object)=>void}}, next: () => void) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const expected = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
      if ((req.headers.origin && req.headers.origin !== expected) ||
          (process.env.NODE_ENV === 'production' && req.headers.origin !== expected)) {
        return res.status(403).json({ message: 'Origin not allowed' });
      }
    }
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // Keep the interactive API explorer off in production by default.
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Personal Expense Tracker API')
      .setDescription('Versioned personal finance APIs. Data is always scoped to the authenticated user. External OAuth / SSO is not implemented in v1.0-rc.')
      .setVersion('1.0.0-rc')
      .addCookieAuth('expense_session')
      .addTag('Authentication')
      .addTag('Transactions')
      .addTag('Categories')
      .addTag('Analytics')
      .addTag('Health')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs/openapi.json' });
  }
  await app.listen(Number(process.env.PORT || 4000), '0.0.0.0');
  console.log(`API started at http://localhost:${process.env.PORT || 4000}/api/v1/health`);
}
bootstrap();
