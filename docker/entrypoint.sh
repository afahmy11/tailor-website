#!/bin/sh
set -e

# Secrets are provided at RUNTIME as environment variables (never baked into the
# image). Fail fast with a clear message if a required one is missing, so we
# never silently fall back to a baked-in default.
: "${DATABASE_URL:?[entrypoint] DATABASE_URL must be set at runtime (env var)}"
: "${AUTH_SECRET:?[entrypoint] AUTH_SECRET must be set at runtime (env var)}"
: "${FIELD_ENCRYPTION_KEY:?[entrypoint] FIELD_ENCRYPTION_KEY must be set at runtime (env var)}"

echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  node prisma/seed.mjs || echo "[entrypoint] Seed skipped/failed (continuing)."
fi

echo "[entrypoint] Starting server..."
exec "$@"
