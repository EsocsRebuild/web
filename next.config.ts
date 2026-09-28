import type { NextConfig } from "next";

import { legacyRedirects } from "./src/config/redirects";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Stop `next dev` from generating AGENTS.md / CLAUDE.md in the project root.
  agentRules: false,
  // Minimal self-contained server for the container image (see Dockerfile).
  output: "standalone",
  // Set per release (the git SHA in CI) so rolling deployments detect version skew
  // and clients reload cleanly instead of requesting assets that no longer exist.
  deploymentId: process.env.DEPLOYMENT_ID || undefined,
  experimental: {
    // The container's filesystem is read-only; regenerated pages live in memory
    // (per instance) instead of being written into the build output.
    isrFlushToDisk: false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // WebP only. The AVIF encoder hangs on some photos at some widths (the giving
    // photo at 750px never returned), leaving the page loading forever; our
    // sources are already WebP, so AVIF's saving is small and not worth that risk.
    formats: ["image/webp"],
    // 60 for small grid tiles and thumbnails (the difference is invisible at that
    // size and they are the bulk of a gallery's bytes); 75 for everything else.
    qualities: [60, 75],
  },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
