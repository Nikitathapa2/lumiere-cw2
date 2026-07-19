import crypto from 'crypto';
import { env } from '../config/env.js';

const CSP_REPORT_PATH = '/api/csp-report';

function buildCsp(nonce, reportTo) {
  const directives = [
    "default-src 'self'",

    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,

    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    "font-src 'self' https://fonts.gstatic.com data:",

    "img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://picsum.photos https://res.cloudinary.com https://i.pinimg.com",

    `connect-src 'self' ${env.clientUrl} ${env.isProd ? '' : 'http://localhost:5000 ws://localhost:3000 ws://localhost:3001 ws://localhost:3100'}`.trim(),

    "frame-src https://js.stripe.com https://hooks.stripe.com",

    "object-src 'none'",

    "base-uri 'self'",

    "frame-ancestors 'none'",

    "require-trusted-types-for 'script'",
    "trusted-types lumiere-policy",

    `report-uri ${CSP_REPORT_PATH}`,
    `report-to csp-endpoint`,
  ];

  if (env.isProd) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

export function securityHeaders(req, res, next) {
  const nonce = crypto.randomBytes(16).toString('base64url');
  res.locals.nonce = nonce;

  if (env.isProd) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  const csp = buildCsp(nonce, CSP_REPORT_PATH);
  res.set('Content-Security-Policy', csp);

  res.set(
    'Reporting-Endpoints',
    `csp-endpoint="${CSP_REPORT_PATH}"`
  );

  res.set('X-Content-Type-Options', 'nosniff');

  res.set('X-Frame-Options', 'DENY');

  res.set('Referrer-Policy', 'no-referrer');

  res.set('Cross-Origin-Opener-Policy', 'same-origin');

  res.set('Cross-Origin-Resource-Policy', 'same-site');

  res.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), usb=(), payment=(self), fullscreen=(self)'
  );

  res.set('X-XSS-Protection', '0');

  next();
}
