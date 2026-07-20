import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_URL.replace(/\/api$/, '');
const CSP_REPORT_URL = `${API_ORIGIN}/api/csp-report`;
const IS_PROD = process.env.NODE_ENV === 'production';

function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildCsp(nonce) {
  const directives = [
    "default-src 'self'",

    // 'unsafe-eval' is required by the Next.js/React dev build (HMR, error
    // overlay, callstack reconstruction). It is added in development only —
    // production keeps the strict nonce + strict-dynamic policy.
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:${IS_PROD ? '' : " 'unsafe-eval'"}`,

    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    "font-src 'self' https://fonts.gstatic.com data:",

    "img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://picsum.photos https://res.cloudinary.com https://i.pinimg.com",

    `connect-src 'self' ${API_ORIGIN}${!IS_PROD ? ' ws://localhost:3000 ws://localhost:3001 ws://localhost:3100' : ''}`,

    "frame-src https://js.stripe.com https://hooks.stripe.com",

    "object-src 'none'",

    "base-uri 'self'",

    "frame-ancestors 'none'",

    `report-uri ${CSP_REPORT_URL}`,
    `report-to csp-endpoint`,
  ];

  if (IS_PROD) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

export function middleware(request) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);

  response.headers.set('Reporting-Endpoints', `csp-endpoint="${CSP_REPORT_URL}"`);

  if (IS_PROD) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');

  response.headers.set('X-Frame-Options', 'DENY');

  response.headers.set('Referrer-Policy', 'no-referrer');

  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), usb=(), payment=(self), fullscreen=(self)'
  );

  response.headers.set('X-XSS-Protection', '0');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
