# LUMIÈRE — Luxury Fashion E-Commerce

A minimalist luxury clothing store. Next.js frontend + Express/MongoDB backend.


## Structure

```
store/
├── backend/       Express + MongoDB REST API
├── frontend/      Next.js (App Router) + Tailwind storefront
├── clothes/       Product imagery — seeded into backend/uploads, served at /images
├── new images/    Site imagery — seeded into backend/uploads/site
└── .github/       CI/CD pipelines
```

## Run it with Docker (recommended)

One command brings up MongoDB, the API, and the storefront on a private network,
so the stack behaves identically on any machine with Docker.

```bash
cp .env.docker.example .env       # then fill in JWT_SECRET and CSRF_SECRET
docker compose up --build         # storefront -> http://localhost:3000
docker compose --profile seed run --rm seed   # load the catalog (first run only)
```

Generate the two required secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Service    | Image                  | Port  | Notes                                        |
| ---------- | ---------------------- | ----- | -------------------------------------------- |
| `mongo`    | `mongo:7.0`            | —     | Not published; data in the `mongo-data` volume |
| `backend`  | `lumiere-backend:local`| 5000  | API at `/api`, health at `/api/health`        |
| `frontend` | `lumiere-frontend:local`| 3000 | Next.js standalone output                     |
| `seed`     | reuses backend image   | —     | One-shot, `--profile seed`                    |

Useful commands:

```bash
docker compose logs -f backend        # tail the API
docker compose ps                     # health status of each service
docker compose down                   # stop (volumes survive)
docker compose down --volumes         # stop and wipe the database + uploads
```

### How the containers talk to each other

Two details are easy to get wrong, so they are worth stating outright:

- **The browser and the server need different API hosts.** Pages are dynamic
  server components, so they fetch the API from *inside* the frontend container,
  where `localhost:5000` is that container itself. The server side therefore uses
  `INTERNAL_API_URL=http://backend:5000/api`, while the browser keeps
  `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (baked into the client bundle
  at build time — it is a build arg, not a runtime variable).
- **Product images are proxied through the storefront.** `next/image` optimises
  server-side and hits the same container-localhost problem. `next.config.js`
  rewrites `/uploads/*` and `/images/*` to the API over the internal network, and
  the API stamps image URLs with `API_PUBLIC_URL` (the storefront origin). Locally
  the rewrite is a transparent pass-through to `localhost:5000`.

Uploads live in the `uploads` volume so admin-uploaded and seeded imagery survive
a rebuild.

## Run it on the host

### Backend
```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev               # http://localhost:5000
npm run seed              # load the catalog
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

Requires a MongoDB instance at `mongodb://127.0.0.1:27017/lumiere`.

## CI/CD

Four GitHub Actions pipelines run on every push and pull request to `main` and
`develop`, and on a weekly schedule so newly-disclosed CVEs surface in code that
hasn't changed.

| Workflow | What it does |
| --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | Parse-checks every API source file, boots the API against a live MongoDB service and requires `/api/health`, lints and builds the storefront, then builds both images and smoke-tests the whole Compose stack end to end. |
| [`security.yml`](.github/workflows/security.yml) | `npm audit` (fails on high/critical), Semgrep SAST (OWASP Top Ten, Node, React, secrets), TruffleHog secret scan over full history, Trivy filesystem scan, Hadolint on both Dockerfiles, and Trivy image scans. Results upload as SARIF to the Security tab. |
| [`codeql.yml`](.github/workflows/codeql.yml) | CodeQL with `security-extended` — taint tracking for injection, SSRF, prototype pollution, and weak crypto. |
| [`docker-publish.yml`](.github/workflows/docker-publish.yml) | On `main` and version tags: builds each image, gates it behind a Trivy high/critical scan, generates an SPDX SBOM, pushes to GHCR, and attests build provenance. The scanned image is the pushed image — it is never rebuilt in between. |

[Dependabot](.github/dependabot.yml) opens weekly grouped updates for npm
(backend + frontend), GitHub Actions, and Docker base images.

## Security

The API ships defence in depth: HMAC double-submit CSRF, tiered rate limiting,
NoSQL-operator stripping, prototype-pollution guards, HTML sanitisation, a strict
CSP with per-request nonces and Trusted Types, TOTP MFA, step-up re-authentication,
field-level envelope encryption for PII with key rotation, breach-password checks,
credential-stuffing detection, and a structured audit trail.

Server-side price recomputation means a tampered client cart cannot change what a
customer is charged.
