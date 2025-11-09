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
# Prune to target workspace
RUN turbo prune boilerplate-template-web --docker

# -------------------
# Builder stage
# -------------------
FROM prepare AS builder
# Copy lockfile, package.json and install dependencies
COPY --from=prepare /app/out/json/ .
# Install dependencies (use --no-frozen-lockfile due to turbo prune lockfile inconsistency)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --no-frozen-lockfile
# Copy source codes and build the project
COPY --from=prepare /app/out/full/ .

ARG TURBO_TOKEN
ARG TURBO_TEAM
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_URL
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_NODE_ENV=production

RUN turbo build --filter=boilerplate-template-web

# -------------------
# Runner stage
# -------------------
FROM base AS runner
# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# Copy workspace packages
COPY --from=builder /app/packages/contract ./packages/contract
COPY --from=builder /app/packages/tailwind-config ./packages/tailwind-config
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/packages/typescript-config ./packages/typescript-config
# Copy package files and install dependencies (including TypeScript for next.config.ts)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/web/package.json ./apps/web/
# Install as root, then switch to nextjs user (ignore scripts to skip husky)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --no-frozen-lockfile \
    --ignore-scripts \
    --filter=boilerplate-template-web
RUN chown -R nextjs:nodejs /app
USER nextjs
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.ts ./apps/web/
# Envs
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
