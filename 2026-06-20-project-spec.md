# Atelier Abaya — Enhanced Project Spec (2026-06-20)

This is the original brief plus the agreed security & design enhancements.
Paste into Settings → project instructions if you want it in the project config.

## Original requirements
Production-ready, fully self-hostable custom abaya tailoring website. Runs entirely via
Docker on your own machine (no Vercel/serverless/managed cloud). Next.js App Router + TS in
`output: 'standalone'`, Tailwind, Postgres via Prisma, Zod validation, multi-stage Dockerfile,
docker-compose (app + db + optional proxy), `.env` config, auto-migrate on start, Makefile,
seed script, healthchecks. Refined modest-luxury design, full RTL Arabic/English, guided
measurement module, secure tokenized checkout, admin dashboard, emails, SEO.

## Security enhancements (added)
1. **Payment webhook = source of truth.** Verify gateway webhook signatures server-side; mark
   orders paid only from the verified webhook, never the client redirect.
2. **Idempotency keys** on order/payment endpoints to prevent double submits/charges.
3. **Email-enumeration-safe magic links** — uniform response/timing, single-use, short expiry.
4. **Admin 2FA + isolation** — TOTP for admin; lock `/admin` at the proxy (IP allowlist/basic auth).
5. **Least-privilege Postgres role** — app connects as a non-superuser scoped to its schema.
6. **Encrypted backups** — scheduled `pg_dump` (a volume is not a backup); document restore.
7. **Bot protection** on contact/order forms (self-hostable: Cloudflare Turnstile / hCaptcha).
8. **Supply-chain scanning** in build/CI — `npm audit` + Trivy image scan.
9. **CSP nonces** (no `unsafe-inline`) + **PII redaction** in logs.
10. **GDPR data export** (not just deletion) + consent logged with timestamp + policy version.
11. **PII encryption at rest** — measurements + addresses encrypted (AES-256-GCM).

## Design enhancements (added)
1. **Self-hosted Arabic typeface** (Cormorant/Inter lack Arabic) — e.g. Tajawal / Noto Kufi.
2. **Mirror SVG measurement diagrams in RTL**; localize numerals/units.
3. **Honor `prefers-reduced-motion`.**
4. **Size recommendation from measurements** (sanity check vs size guide).
5. **Printable/PDF measurement sheet** for customer + tailor.
6. **Save & resume order via email link.**
7. **Per-option lead times & availability** + estimated tailoring/delivery timeline.
8. **Prefill WhatsApp deep link** with order reference.

## Status of enhancements in this build
Implemented now: AES-256-GCM PII encryption, CSP nonces + full security headers, in-app rate
limiting, audit + consent logging, enumeration-safe magic link, server-side admin role checks,
pluggable payment interface with webhook-verification hook, GDPR export/delete, Arabic font +
RTL + reduced-motion, size recommendation, per-fabric lead time, WhatsApp prefill.
Flagged for before-production: payment provider choice + keys, TOTP 2FA, proxy IP allowlist for
admin, pg_dump backup cron, bot-protection widget, Trivy in CI. (Tracked in CLAUDE.md.)
