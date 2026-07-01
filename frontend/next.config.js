// Where the storefront reaches the API from *inside* the network it runs in.
// Locally that is the same host:port the browser uses; under Docker Compose it
// is the `backend` service name (containers cannot reach each other via
// localhost). Only used for server-side proxying — never sent to the client.
//
// BUILD-TIME ONLY: Next evaluates rewrites() during `next build` and freezes the
// destinations into routes-manifest.json. Setting this at `docker run` has no
// effect — it must be passed as a build arg (see frontend/Dockerfile).
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  // Emit a self-contained server bundle (.next/standalone) so the runtime Docker
  // image can ship without node_modules or the source tree.
  output: 'standalone',

  // Pin the file-tracing root to this app. Next otherwise walks up looking for a
  // lockfile and mirrors the path from whatever root it infers, so a stray
  // package-lock.json in a parent directory (e.g. the user's home folder) would
  // bury the output at .next/standalone/<...>/frontend/server.js instead of
  // .next/standalone/server.js — which is exactly what the Dockerfile copies.
  outputFileTracingRoot: __dirname,

  images: {
    // Product imagery is served by the local Express backend (localhost:5000),
    // which resolves to a private IP. Next 16's image optimizer blocks private-IP
    // upstreams by default (SSRF protection), so allow it for local development.
    // In production these images live on a public CDN/Cloudinary and this is moot.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/images/**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
      // Containerised runs serve product imagery through the storefront origin
      // (see the /uploads + /images rewrites below), so allow it as a source.
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/images/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
    ],
  },

  // Proxy the API's static image routes through the storefront.
  //
  // The image optimizer runs server-side. In Docker it lives in the frontend
  // container, where `http://localhost:5000` is the container itself, not the
  // API — so an absolute backend URL in a product record would fail to optimise
  // and every product would fall back to the placeholder. Routing images through
  // our own origin means the optimizer fetches a host it can always reach, and
  // keeps them same-origin for the `img-src 'self'` CSP in src/middleware.js.
  // Locally BACKEND_INTERNAL_URL is just http://localhost:5000, so this is a
  // transparent pass-through in dev.
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: `${BACKEND_INTERNAL_URL}/uploads/:path*` },
      { source: '/images/:path*', destination: `${BACKEND_INTERNAL_URL}/images/:path*` },
    ];
  },

  // Batch 24 — Security Headers
  // The Edge middleware (src/middleware.js) handles the dynamic CSP nonce + full
  // header suite. These `headers()` entries are static fallbacks that apply when
  // the middleware is bypassed (e.g., direct static-file serves, CDN edge nodes
  // that don't run Edge middleware).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-XSS-Protection', value: '0' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), usb=(), payment=(self), fullscreen=(self)',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
