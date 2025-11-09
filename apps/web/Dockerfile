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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Copy source codes and build the project
COPY --from=prepare /app/out/full/ .

ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM
ENV NODE_ENV=production

RUN turbo build --filter=boilerplate-template-web

# -------------------
# Runner stage
# -------------------
FROM base AS runner
# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs
# Copy package files and install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/web/package.json ./apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.ts ./apps/web/
# Envs
ENV NODE_ENV=production
ENV PORT=${PORT}
ENV HOSTNAME=0.0.0.0

EXPOSE ${PORT}

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
