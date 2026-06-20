# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# SECRETS POLICY: no credentials or API keys are baked into any image layer.
#   - No secret ARG/ENV is declared here (only NODE_ENV/PORT, which are not secret).
#   - .dockerignore excludes .env / .env.* / keys / certs from the build context.
#   - The app reads ALL config from runtime environment variables, injected by
#     docker-compose (env_file: .env, or `environment:` from your shell / a
#     secrets manager). See docker-compose.yml and .env.example.
#   - Do NOT introduce NEXT_PUBLIC_* secrets: those would be inlined into the
#     client bundle at build time. None are used in this project.
# -----------------------------------------------------------------------------

# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build needs NO secrets: prisma generate only reads the schema, and the app has
# no NEXT_PUBLIC_* values, so nothing sensitive is embedded in the output.
RUN npx prisma generate
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init && rm -rf /var/lib/apt/lists/*

# non-root user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone output
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma needs schema + engine + CLI to run migrate deploy on start
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/.bin ./node_modules/.bin
COPY --from=build /app/prisma ./prisma

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
