# syntax=docker/dockerfile:1
#
# LUMIÈRE storefront — Next.js (App Router)
#
# Build context is frontend/ (the app is self-contained):
#   docker build -f frontend/Dockerfile ./frontend
#
# Uses Next's `output: 'standalone'` (see next.config.js) so the runtime image
# ships only the traced dependency set instead of the full node_modules tree.

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# have to be present here — setting them only at `docker run` is too late.
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Same story for BACKEND_INTERNAL_URL: next.config.js runs `rewrites()` during
# the build and bakes the resolved destination into routes-manifest.json, so the
# /uploads and /images proxy targets are fixed at build time. Passing this only
# at runtime silently leaves the rewrite pointing at localhost:5000, which inside
# the container is the frontend itself (ECONNREFUSED on every product image).
ARG BACKEND_INTERNAL_URL=http://localhost:5000

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}

RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache tini

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
