# syntax=docker/dockerfile:1

# ---- build: generate Prisma client + compile TypeScript ----
FROM node:22-slim AS build
# openssl is required by the Prisma CLI (schema-engine)
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src
RUN npm run build

# ---- migrate: one-off job image that applies Prisma migrations (needs the dev-only prisma CLI) ----
#   docker run --rm -e DATABASE_URL=... <image-built-with---target-migrate>
FROM build AS migrate
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- deps: production node_modules only ----
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- runtime (default target: must stay the last stage) ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    TZ=Asia/Kolkata
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# AWS RDS CA bundle, used when DB_SSL=true
ADD --chmod=444 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/certs/rds-global-bundle.pem
RUN mkdir -p logs && chown -R node:node /app/logs
USER node
# Internal only: never publish this port. It hosts the Bull Board dashboard (/ui/queue-dashboard),
# which has no authentication. Reach it through an SSM port-forward.
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/v1/ping').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/src/server.js"]
