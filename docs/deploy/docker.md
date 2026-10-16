# Running ESOCS web in containers

## At a glance

| Piece         | File                                     | Purpose                                                                                           |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Development   | `docker-compose.yml` (`Dockerfile.dev`)  | Hot-reloading development stack with source volume mounts and polling watchers                    |
| Production    | `docker-compose.prod.yml` (`Dockerfile`) | Hardened production runner container, plus optional Caddy reverse proxy (`--profile proxy`)       |
| Image (Prod)  | `Dockerfile`                             | Three stages: `deps` → `builder` (`next build`, standalone output) → `runner` (~200 MB, non-root) |
| Build context | `.dockerignore`                          | Keeps source control, secrets, tests and legacy originals out of the build                        |
| Proxy         | `deploy/caddy/Caddyfile`                 | Automatic HTTPS, HTTP/3, compression, year-long caching of fingerprinted assets                   |
| Health        | `GET /api/health`                        | `200` when ready, `503` when content cannot load; used by Docker and load balancers               |
| CI            | `.github/workflows/ci.yml`               | 2-Tier Quality Gate: static analysis, unit tests, Next.js build and container verification        |
| Publish       | `.github/workflows/container.yml`        | Multi-arch (amd64, arm64) images to GHCR with SBOM and provenance on releases                     |

## Commands

### Development (Live Hot-Reloading)

```bash
npm run docker:dev       # Build and start development container with live logs on http://localhost:3000
npm run docker:up        # Start development container in background (-d)
npm run docker:logs      # Follow development container logs
npm run docker:down      # Stop development container
```

Edits to files on your host machine are reflected immediately in your browser via HMR without container rebuilds.

### Production Stack (Optimized & Hardened)

```bash
npm run docker:prod                                                      # Start production standalone container on http://localhost:3000
docker compose -f docker-compose.prod.yml --profile proxy up --build -d  # Production with Caddy proxy on :80/:443
npm run docker:logs:prod                                                 # Follow production container logs
```

## Runtime design

- **Standalone server.** `output: "standalone"` traces only the files the server needs. The image
  holds that server, `.next/static` and `public/`: no source code and no dev dependencies.
- **Non-root and locked down.** The app runs as `nextjs` (uid 1001), with a read-only root
  filesystem, all Linux capabilities dropped, `no-new-privileges`, and a 64 MB `tmpfs` for `/tmp`.
- **Clean shutdown.** `tini` is PID 1, so `SIGTERM` reaches Node and the server drains before it
  exits.
- **Image memory.** jemalloc is preloaded, as sharp recommends on glibc, to keep image optimisation
  memory stable.
- **Caches.**
  - Optimised images and fetch data go to `/app/.next/cache`, a named volume, so they survive
    restarts.
  - Regenerated pages stay in memory (`experimental.isrFlushToDisk: false`), because the build
    output is read-only.
  - Each instance refreshes its pages independently every hour.

## Build arguments and secrets

| Name                                   | Kind            | When            | Notes                                                                                                                                                 |
| -------------------------------------- | --------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | build arg       | build           | Inlined into the browser bundle; set to the public URL                                                                                                |
| `DEPLOYMENT_ID`                        | build arg       | build + runtime | Git SHA in CI. Enables version-skew protection during rolling updates                                                                                 |
| `APP_VERSION`, `VCS_REF`, `BUILD_DATE` | build args      | build           | Image labels and `/api/health`                                                                                                                        |
| `server_actions_key`                   | BuildKit secret | build           | Shared Server Functions key. Never stored in a layer. Locally created by `npm run docker:init`; in CI from the `SERVER_ACTIONS_ENCRYPTION_KEY` secret |

## Running more than one instance

- **Same image everywhere.** Build once and run the same image on every instance, so the build ID,
  deployment ID and Server Functions key match.
- **Shared page cache (optional).** To share regenerated pages across instances, add a custom cache
  handler backed by Redis or object storage.
- **Media.** Move `public/media/legacy` to object storage with a CDN when that account exists. Only
  `LEGACY_MEDIA_BASE` in `src/data/adapters/seed/build.ts` changes.

## Local development

Use `npm run dev` on the host. It is much faster than a container on macOS and Windows. Containers
are for production-like runs and CI.
