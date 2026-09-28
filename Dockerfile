# syntax=docker/dockerfile:1.10
#
# ESOCS web: production image.
#
#   docker build -t esocs-web .
#   docker run --rm -p 3000:3000 esocs-web
#
# Stages: deps (install) → builder (next build, standalone output) → runner (minimal).
# The runner holds only the traced server, static assets and public files: no
# source, no dev dependencies, no build tools, and it runs as a non-root user.
# See docs/deploy/docker.md for the architecture, variables and operations.

ARG NODE_VERSION=24
ARG DEBIAN_RELEASE=bookworm

# ---------------------------------------------------------------------------
# base: shared, pinned runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-${DEBIAN_RELEASE}-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
WORKDIR /app

# ---------------------------------------------------------------------------
# deps: install exactly what the lockfile says, cached between builds
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
# --ignore-scripts: the only install script is the Git-hooks installer, which has no
# place in an image. sharp ships prebuilt binaries and needs no install script.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ---------------------------------------------------------------------------
# builder: compile the app
# ---------------------------------------------------------------------------
FROM base AS builder

# Public values are inlined into the browser bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Identifies this release; used for version-skew protection during rolling updates.
ARG DEPLOYMENT_ID=""
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    DEPLOYMENT_ID=${DEPLOYMENT_ID} \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Server Functions encryption key, shared by every instance of this build. Provided
# as a BuildKit secret so it never lands in an image layer or the build history.
RUN --mount=type=secret,id=server_actions_key,required=false \
    --mount=type=cache,target=/app/.next/cache \
    if [ -f /run/secrets/server_actions_key ]; then \
      export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/server_actions_key)"; \
    fi && \
    npm run build

# ---------------------------------------------------------------------------
# runner: the image that ships
# ---------------------------------------------------------------------------
FROM base AS runner

ARG APP_VERSION=dev
ARG DEPLOYMENT_ID=""
ARG VCS_REF=""
ARG BUILD_DATE=""

LABEL org.opencontainers.image.title="esocs-web" \
      org.opencontainers.image.description="The Eternal Sacred Order of the Cherubim & Seraphim: web platform" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

# tini: PID 1 that forwards signals and reaps zombies, so SIGTERM stops the server cleanly.
# jemalloc: recommended by sharp on glibc to keep image-optimisation memory in check.
RUN apt-get update \
 && apt-get install --no-install-recommends -y tini libjemalloc2 \
 && rm -rf /var/lib/apt/lists/* \
 && ln -s "$(find /usr/lib -name 'libjemalloc.so.2' | head -n1)" /usr/lib/libjemalloc.so.2

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP_VERSION=${APP_VERSION} \
    DEPLOYMENT_ID=${DEPLOYMENT_ID} \
    LD_PRELOAD=/usr/lib/libjemalloc.so.2

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /usr/sbin/nologin nextjs

# Traced server and its minimal node_modules, then the assets it serves directly.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# The only writable path the app needs: incremental regeneration and optimised
# images. Mount a volume here to keep that cache across restarts.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache
VOLUME ["/app/.next/cache"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

STOPSIGNAL SIGTERM
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
