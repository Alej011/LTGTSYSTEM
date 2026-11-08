FROM node:24-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
ENV COREPACK_HOME=/opt/corepack CI=true
RUN corepack enable && mkdir -p "$COREPACK_HOME" /app && chown node:node "$COREPACK_HOME" /app
WORKDIR /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN corepack install

# Desarrollo: docker-compose.yml monta ./backend sobre /app
FROM base AS dev
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
EXPOSE 4000
CMD ["sh", "-c", "pnpm prisma:generate && pnpm prisma:deploy && pnpm start:dev"]

FROM dev AS build
RUN pnpm prisma:generate \
  && pnpm build \
  && pnpm build:seed \
  && pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-seed ./dist-seed
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["sh", "-c", "pnpm prisma:deploy && node dist/main.js"]
