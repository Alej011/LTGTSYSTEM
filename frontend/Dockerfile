FROM node:24-slim AS base
ENV COREPACK_HOME=/opt/corepack CI=true NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && mkdir -p "$COREPACK_HOME" /app && chown node:node "$COREPACK_HOME" /app
WORKDIR /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN corepack install

# Desarrollo: docker-compose.yml monta ./frontend sobre /app
FROM base AS dev
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

FROM dev AS build
RUN pnpm build

# Producción: servidor standalone de Next.js, sin node_modules completos
FROM node:24-slim AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
USER node
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
