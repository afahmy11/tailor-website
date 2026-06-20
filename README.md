# Atelier Abaya

A production-ready, fully self-hostable website for a custom abaya tailoring business.
Next.js (App Router, standalone) + PostgreSQL + Prisma, fully containerized. Runs entirely
on your own machine with Docker — no serverless, no managed cloud.

## Features
- Elegant modest-luxury design, mobile-first, **full RTL Arabic/English** toggle.
- Self-hosted fonts (Cormorant + Inter + Noto Kufi Arabic) — no runtime CDN.
- **Guided measurement wizard** with SVG diagrams, cm/inch toggle, live Zod validation,
  outlier warnings, size recommendation, save/reuse profiles, and a standard-size fallback.
- Customize & order flow → secure account → admin dashboard with measurement sheets.
- Security: CSP nonces + hardening headers, encrypted PII at rest, audit + consent logging,
  rate limiting, enumeration-safe magic-link auth, pluggable PCI-friendly payments.
- Order status emails via SMTP (Mailpit in dev). SEO meta, sitemap, robots.

## Prerequisites
- Docker Desktop (running).

## Quick start
```bash
cp .env.example .env

# generate two secrets and paste them into .env
openssl rand -base64 32   # -> AUTH_SECRET
openssl rand -base64 32   # -> FIELD_ENCRYPTION_KEY

# set ADMIN_EMAILS in .env to the email you'll sign in with

make up        # build + start app + db + mailpit
make seed      # load sample styles & fabrics (first run only)
```
Then open:
- App: http://localhost:3000  (redirects to /en)
- Mailpit (dev inbox): http://localhost:8025  ← your magic-link sign-in emails arrive here

### Sign in / admin
1. Go to `/en/login`, enter the email you set in `ADMIN_EMAILS`.
2. Open Mailpit, click the sign-in link.
3. Visit `/en/admin` to view orders and update statuses.

### Optional: HTTPS + HSTS locally (Caddy)
```bash
make up-proxy           # adds the Caddy proxy + mailpit
# https://localhost:443  (self-signed; your browser will warn once)
```

## Commands (Makefile)
| Command | Description |
|---|---|
| `make up` | build & start app + db + mailpit |
| `make up-proxy` | start with Caddy HTTPS proxy |
| `make down` | stop everything |
| `make logs` | tail app logs |
| `make migrate` | run `prisma migrate deploy` in the app container |
| `make seed` | seed sample data |
| `make psql` | psql shell into the db |
| `make shell` | shell into the app container |
| `make reset` | **destroy** db volume and restart |

## How it runs
- Multi-stage `Dockerfile` (deps → build → minimal `node:20-slim` runtime, non-root user)
  using Next.js standalone output.
- `docker-compose.yml`: `app`, `db` (Postgres 16 + named volume), optional `proxy` (Caddy)
  and `mailpit`. Healthchecks gate startup (`depends_on: condition: service_healthy`).
- `docker/entrypoint.sh` runs `prisma migrate deploy` before starting the server.
- All config via `.env` (see `.env.example`). No secrets are baked into images.

## Migrations
The first `make up` runs `prisma migrate deploy` automatically. To create a new migration
during development: `npx prisma migrate dev --name <change>` (with a local DATABASE_URL).
A baseline migration is included under `prisma/migrations`.

## Payments (decide later)
`PAYMENT_PROVIDER=manual` by default — orders are created as **Awaiting payment** with no
gateway. The gateway is pluggable (`src/lib/payment`): set `PAYMENT_PROVIDER=stripe` and
implement `createCheckout` / `verifyWebhook` (or drop in Paymob/PayTabs/Tap). Card data never
touches this server — use the provider's hosted, tokenized checkout. The webhook
(`/api/payment/webhook`) is the source of truth for "paid".

## Secrets & credentials (never in the image)
No credentials or API keys are baked into the Docker images. All config is read from
**runtime environment variables**:
- The `Dockerfile` declares no secret `ARG`/`ENV`; `.dockerignore` excludes `.env`, `.env.*`,
  and key/cert files from the build context.
- No `NEXT_PUBLIC_*` values are used, so nothing sensitive is inlined into the client bundle.
- `docker-compose.yml` injects secrets at runtime via `env_file: .env`. To use a secrets
  manager instead of a file, export the vars on the host and pass them through the
  `environment:` block (commented examples are in the compose file).
- The container entrypoint **fails fast** if `DATABASE_URL`, `AUTH_SECRET`, or
  `FIELD_ENCRYPTION_KEY` are missing at runtime — so it never falls back to a baked default.
- `.env` is git-ignored; only `.env.example` (placeholders) is committed.

## Before production (tracked in CLAUDE.md)
Choose a payment provider + keys; add admin TOTP 2FA; restrict `/admin` at the proxy
(IP allowlist); add a `pg_dump` backup cron; add a bot-protection widget (Turnstile/hCaptcha);
add Trivy/`npm audit` to CI; point Caddy at a real domain for Let's Encrypt TLS.

## Replaceable placeholders
Style images in `public/images/` and the SVG measurement figure
(`src/components/MeasurementFigure.tsx`) are placeholders you can swap for real artwork.
