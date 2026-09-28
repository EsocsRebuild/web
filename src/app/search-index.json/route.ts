import { getContent } from "@/data/content";
import { buildSearchIndex } from "@/features/search/index-builder";

// Rebuilt hourly so upcoming events stay current; loaded only when search opens.
export const revalidate = 3600;

export function GET() {
  return Response.json(buildSearchIndex(getContent()));
}
