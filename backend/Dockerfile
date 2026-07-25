# syntax=docker/dockerfile:1
#
# LUMIÈRE API — Express + MongoDB
#

FROM node:22-alpine AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner
ENV NODE_ENV=production \
    PORT=5000

RUN apk add --no-cache tini

WORKDIR /app/backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/package.json ./package.json
COPY backend/src ./src

# Seed/static assets (paths relative to the repo-root build context).
COPY clothes /app/clothes
COPY ["new images", "/app/new images"]

# uploads/ is a mounted volume at runtime; create it so a first boot without a
# volume still works, and hand ownership to the unprivileged user.
RUN mkdir -p uploads/products uploads/site && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
