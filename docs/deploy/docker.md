# Running ESOCS web in containers

## At a glance

| Piece         | File                                     | Purpose                                                                                                               |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Image         | `Dockerfile`                             | Three stages: `deps` → `builder` (`next build`, standalone output) → `runner` (about 200 MB, non-root)                |
| Build context | `.dockerignore`                          | Keeps source control, secrets, tests and the 336 MB of legacy originals out of the build                              |
| Local stack   | `compose.yaml`                           | Hardened app container, plus an optional Caddy reverse proxy (`--profile proxy`)                                      |
| Proxy         | `deploy/caddy/Caddyfile`                 | Automatic HTTPS, HTTP/3, compression, year-long caching of fingerprinted assets, body-size limit                      |
| Health        | `GET /api/health`                        | `200` when ready, `503` when content cannot load; used by Docker, Caddy and load balancers                            |
| CI            | `.github/workflows/ci.yml` → `container` | Lints the Dockerfile, builds, runs hardened, waits for healthy, smoke-tests routes, checks non-root, scans with Trivy |
| Publish       | `.github/workflows/container.yml`        | Multi-arch (amd64, arm64) images to GHCR with an SBOM and provenance, on `main` and version tags                      |

## Commands

```bash
npm run docker:up        # create the shared key once, build, start on http://localhost:3000
npm run docker:logs      # follow the app logs
npm run docker:down      # stop
docker compose --profile proxy up --build -d   # add Caddy on :80/:443 (set SITE_ADDRESS)
npm run lint:docker      # lint the Dockerfile with hadolint
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
