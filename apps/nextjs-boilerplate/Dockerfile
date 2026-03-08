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

# Install Node.js 24.x (required by Turbo and Next.js)
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
RUN bunx --bun turbo prune nextjs-boilerplate --docker

# -------------------
# Builder stage
# -------------------
FROM build-base AS builder

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SENTRY_DSN

# Copy pruned lockfile and package.json files
COPY --from=prepare /app/out/json/ .
# Install dependencies from pruned workspace
RUN bun install
# Copy source code
COPY --from=prepare /app/out/full/ .
# Ensure public directory exists for public files
RUN mkdir -p /app/apps/nextjs-boilerplate/public
# Build the Next.js project (standalone output)
RUN bunx --bun turbo build --filter=nextjs-boilerplate

# -------------------
# Runner stage
# -------------------
FROM bun-base AS runner

# Copy AWS Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.0 /lambda-adapter /opt/extensions/lambda-adapter

# Copy Next.js standalone output
COPY --from=builder /app/apps/nextjs-boilerplate/.next/standalone ./
# Copy static files
COPY --from=builder /app/apps/nextjs-boilerplate/.next/static ./apps/nextjs-boilerplate/.next/static
# Copy public files
COPY --from=builder /app/apps/nextjs-boilerplate/public ./apps/nextjs-boilerplate/public

# Copy workspace packages (@shared/config)
COPY --from=builder /app/shared/config/dist ./shared/config/dist
COPY --from=builder /app/shared/config/package.json ./shared/config/package.json

# Lambda Web Adapter configuration
ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app/apps/nextjs-boilerplate

# Override ENTRYPOINT for AWS Lambda base image. Nextjs standalone output is not compatible yet with bun run server.js
ENTRYPOINT []
CMD ["node", "server.js"]

