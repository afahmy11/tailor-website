# Atelier Abaya — Project Memory & Progress

> Self-hostable custom abaya tailoring website. Next.js (standalone) + Postgres + Prisma,
> fully containerized via Docker Compose. Runs locally with `docker compose up`.

Last updated: 2026-06-20

## How to run (your Mac, Docker Desktop)
```bash
cp .env.example .env          # then edit secrets (see below)
openssl rand -base64 32       # AUTH_SECRET
openssl rand -base64 32       # FIELD_ENCRYPTION_KEY
make up                       # build + start app, db, mailpit
make seed                     # load sample styles/fabrics (first run)
# App:     http://localhost:3000
# Mailpit: http://localhost:8025  (magic-link login emails land here in dev)
make up-proxy                 # optional: HTTPS via Caddy at https://localhost:8443
make down                     # stop
```
Admin: log in with an email listed in `ADMIN_EMAILS`, then visit `/admin`.

## Tech decisions (memory)
- **Stack:** Next.js 15 App Router, TS, `output: 'standalone'` (long-running Node server, NOT serverless). Tailwind. Prisma + Postgres 16. Zod everywhere.
- **Auth:** Auth.js v5 (NextAuth) magic-link email via SMTP (Mailpit in dev). No passwords → no password hashing needed. Admin gated by `ADMIN_EMAILS` + DB role.
- **Fonts:** `next/font` self-hosts at build time (Cormorant = serif headings, Inter = sans body, Noto Kufi Arabic = Arabic). No runtime Google CDN dependency. Arabic typeface added because Cormorant/Inter lack Arabic coverage.
- **i18n/RTL:** next-intl, EN + AR, `dir` switches via `[locale]` segment.
- **Payments:** PLUGGABLE. `PAYMENT_PROVIDER=manual` by default (no gateway, order = AWAITING_PAYMENT). Stripe adapter stubbed behind a common interface — drop in keys later, or swap for Paymob/PayTabs/Tap. **Decision deferred by user (2026-06-20).**
- **PII:** measurements + shipping address encrypted at rest (AES-256-GCM via `FIELD_ENCRYPTION_KEY`) before storing.
- **Money:** stored as integer minor units (fils/cents).

## Security enhancements applied (beyond original brief)
- AES-256-GCM field encryption for measurements & addresses.
- CSP with per-request nonce (no `unsafe-inline`), plus X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS (proxy).
- In-app rate limiting on auth / order / contact endpoints (token bucket).
- Audit log for auth + order events; consent log with policy version + timestamp.
- Email-enumeration resistant magic-link (uniform response).
- Admin role server-checked on every admin route + action.
- Least-privilege intent: app DB user is not the Postgres superuser in compose.
- Webhook = source of truth for "paid" (Stripe signature verified) — wired in the payment interface.
- GDPR: account data export + deletion endpoints; privacy page + consent capture.
- Secrets never baked into images: no secret ARG/ENV, .dockerignore excludes .env/.env.*/keys, no NEXT_PUBLIC_* secrets; runtime env injection only; entrypoint fails fast if DATABASE_URL/AUTH_SECRET/FIELD_ENCRYPTION_KEY are missing.

## Design enhancements applied
- Self-hosted Arabic typeface + mirrored RTL layout & SVG measurement diagrams.
- `prefers-reduced-motion` respected.
- Measurement → recommended standard size sanity check.
- Per-fabric lead time + stock surfaced in the order flow.
- WhatsApp deep link prefilled with order reference.

## Progress log
- [x] 2026-06-20  Phase 1: scaffold, Docker, compose (app/db/caddy/mailpit), Prisma schema, seed, configs, docs.
- [x] 2026-06-20  Phase 2: design system, self-hosted fonts (Fontsource), i18n/RTL, Auth.js magic-link, CSP-nonce security middleware, Zod, libs.
- [x] 2026-06-20  Phase 3: all pages, guided measurement wizard + SVG figure, admin dashboard, pluggable payment + webhook, GDPR export/delete, emails, SEO/sitemap.
- [x] 2026-06-20  Phase 4: validation + baseline Prisma migration.

## Validation done (in the build sandbox)
- All 49 TS/TSX files compile via esbuild with tsconfig path aliases (syntax, JSX, every local/@ import resolves).
- All JSON (messages, configs) parse.
- Baseline migration `prisma/migrations/20260620000000_init` parses against the real Postgres grammar (libpg_query).
- Aligned page/layout `params` to Next 15 async style (Promise-based params/searchParams).
- NOTE: a full `next build` / `prisma generate` could NOT run in the build sandbox because Google Fonts
  and Prisma's engine host (binaries.prisma.sh) are network-blocked there. Both work normally in your
  Docker build (open network). So the first real end-to-end compile happens on `docker compose up`.
  Fonts are bundled via Fontsource (npm), so no runtime font CDN dependency.

## Notes / TODO for later
- Choose payment provider, add keys to `.env`, set `PAYMENT_PROVIDER=stripe`.
- Replace placeholder SVG style images + measurement diagrams in `/public`.
- Add `pg_dump` backup cron + bot protection (Turnstile/hCaptcha) before production.
- For real HTTPS in prod, point Caddy at a domain for automatic Let's Encrypt TLS.
