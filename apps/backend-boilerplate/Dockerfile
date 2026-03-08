ARG NODE_VERSION=24
# -------------------
# Bun base
# -------------------
FROM public.ecr.aws/lambda/nodejs:${NODE_VERSION} AS bun-base

# Install unzip (required by Bun installer) and Bun runtime, clean up in same layer
RUN dnf install -y unzip && \
    curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.11" && \
    dnf clean all && \
    rm -rf /var/cache/dnf/*
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /app

# -------------------
# Build base
# -------------------
FROM bun-base AS build-base

# Install Node.js 24.x (required by Turbo and Prisma 24.0+)
RUN curl -fsSL "https://rpm.nodesource.com/setup_${NODE_VERSION}.x" | bash - && \
    dnf install -y nodejs && \
    dnf clean all && \
    rm -rf /var/cache/dnf/*

# -------------------
# Prepare stage
# -------------------
FROM build-base AS prepare
# Copy entire monorepo
COPY . .
# Prune to target workspace (creates /app/out/json and /app/out/full)
RUN bunx --bun turbo prune backend-boilerplate --docker

# -------------------
# Builder stage
# -------------------
FROM build-base AS builder

# Accept DATABASE_URL as build argument for Prisma generation
ARG DATABASE_URL

# Copy pruned lockfile and package.json files
COPY --from=prepare /app/out/json/ .
# Install dependencies from pruned workspace
RUN bun install
# Copy source code
COPY --from=prepare /app/out/full/ .
# Build the project
RUN bunx --bun turbo build --filter=backend-boilerplate

# -------------------
# Production dependencies stage
# -------------------
FROM build-base AS prod-deps
COPY --from=prepare /app/out/json/ .
# Install only production dependencies
RUN bun install --production --ignore-scripts && \
    bun pm cache rm

# -------------------
# Runner stage
# -------------------
FROM bun-base AS runner

# Copy AWS Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.0 /lambda-adapter /opt/extensions/lambda-adapter

# Copy only production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json

# Copy built application
COPY --from=builder /app/apps/backend-boilerplate/dist ./apps/backend-boilerplate/dist
COPY --from=builder /app/apps/backend-boilerplate/package.json ./apps/backend-boilerplate/package.json
COPY --from=prod-deps /app/apps/backend-boilerplate/node_modules ./apps/backend-boilerplate/node_modules

# Copy workspace packages (config, neon) with their dependencies
COPY --from=builder /app/shared/config/dist ./shared/config/dist
COPY --from=builder /app/shared/config/package.json ./shared/config/package.json
COPY --from=prod-deps /app/shared/config/node_modules ./shared/config/node_modules

COPY --from=builder /app/shared/neon/dist ./shared/neon/dist
COPY --from=builder /app/shared/neon/prisma ./shared/neon/prisma
COPY --from=builder /app/shared/neon/package.json ./shared/neon/package.json
COPY --from=prod-deps /app/shared/neon/node_modules ./shared/neon/node_modules

# Lambda Web Adapter configuration
ENV PORT=4000
ENV NODE_ENV=production

WORKDIR /app/apps/backend-boilerplate

# Override ENTRYPOINT for AWS Lambda base image. Currently, lambda web adapter is not compatible with bun run dist/index.js
ENTRYPOINT []
CMD ["node", "dist/index.js"]
