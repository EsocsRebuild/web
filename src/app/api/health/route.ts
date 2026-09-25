import { getContent } from "@/data/content";

// Always evaluated per request: a cached health check would hide a broken instance.
export const dynamic = "force-dynamic";

const startedAt = Date.now();

/**
 * Liveness and readiness for load balancers, Docker and Kubernetes.
 * Ready means the content source loads; a failure returns 503 so traffic moves elsewhere.
 */
export function GET() {
  const body = {
    status: "ok" as "ok" | "degraded",
    version: process.env.APP_VERSION ?? "dev",
    deploymentId: process.env.DEPLOYMENT_ID ?? null,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    checks: { content: "ok" as "ok" | "error" },
  };
  try {
    if (getContent().listUnits().length === 0) throw new Error("No content");
  } catch {
    body.status = "degraded";
    body.checks.content = "error";
  }
  return Response.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
