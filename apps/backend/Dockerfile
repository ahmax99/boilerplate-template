# -------------------
# Base image
# -------------------
FROM node:20-alpine AS base
# Set environment variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Update packages, install compatibility libraries for glibc, enable pnpm package manager and activate it
RUN apk update && apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

# -------------------
# Prepare stage
# -------------------
FROM base AS prepare
# Install turbo CLI globally
RUN pnpm install -g turbo@^2.6.0
# Copy monorepo into image
COPY . .
# Bust cache for prune step
ARG CACHEBUST=1
# Prune to target workspace
RUN turbo prune boilerplate-template-backend --docker

# -------------------
# Builder stage
# -------------------
FROM prepare AS builder
# Copy lockfile, package.json and install dependencies
COPY --from=prepare /app/out/json/ .
# Install dependencies (use --no-frozen-lockfile due to turbo prune lockfile inconsistency)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
# Copy source code and build
COPY --from=prepare /app/out/full/ .

ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM

RUN turbo build --filter=boilerplate-template-backend

# -------------------
# Runner stage
# -------------------
FROM base AS runner
# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/package.json
# Copy workspace packages (contract, database, typescript-config)
COPY --from=builder --chown=nestjs:nodejs /app/packages/contract/dist ./packages/contract/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/contract/package.json ./packages/contract/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/generated ./packages/database/generated
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/typescript-config ./packages/typescript-config
# Copy root package.json and lockfile for production dependencies
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
# Install dependencies as root, then switch to nestjs user (ignore scripts to skip husky)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile --ignore-scripts && \
    chown -R nestjs:nodejs /app
USER nestjs
# Envs
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

EXPOSE 4000

WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"]