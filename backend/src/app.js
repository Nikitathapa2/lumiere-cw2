import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import path from 'path';
import { UPLOADS_DIR, ensureUploadDirs } from './config/paths.js';
import apiRoutes from './routes/index.js';
import { stripeWebhookHandler } from './controllers/checkoutController.js';
import { notFound, errorHandler } from './middleware/error.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { prototypePollutionGuard } from './middleware/prototypePollutionGuard.js';
import { mongoSanitize } from './middleware/mongoSanitize.js';
import { xssSanitize } from './middleware/xssSanitize.js';
import { requireCsrf } from './middleware/csrf.js';
import { cspReport } from './controllers/cspReportController.js';

const CSRF_EXEMPT = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/mfa/verify',
  '/api/webhooks/stripe',
  '/api/csp-report',
]);

export function createApp() {
  const app = express();
  const corsOrigins = [env.clientUrl, 'http://192.168.83.1:3000'];

  app.use(
    helmet({
      contentSecurityPolicy: false,
      hsts: false,
    })
  );
  app.use(securityHeaders);
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    stripeWebhookHandler
  );

  app.post(
    '/api/csp-report',
    rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }),
    express.json({ type: ['application/csp-report', 'application/reports+json', 'application/json'], limit: '64kb' }),
    cspReport
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Input-hardening chain (order matters) ──
  // 1) Prototype pollution 
  // 2) NoSQL injection
  // 3) Stored/reflected XSS 
  app.use(prototypePollutionGuard);
  app.use(mongoSanitize);
  app.use(xssSanitize);

  // CSRF — enforce signed double-submit token on state-changing /api requests,
  // except the login-bootstrap and server-to-server endpoints listed above.
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') && !CSRF_EXEMPT.has(req.path)) {
      return requireCsrf(req, res, next);
    }
    next();
  });

  if (!env.isProd) {
    app.use(morgan('dev'));
  }

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Routes
  app.get('/', (req, res) => res.json({ name: 'LUMIÈRE API', version: '0.1.0' }));
  app.use('/api', apiRoutes);

  ensureUploadDirs();
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: env.isProd ? '7d' : 0,
    })
  );

  const clothesDir = path.resolve(process.cwd(), '..', 'clothes');
  app.use('/images', express.static(clothesDir));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
