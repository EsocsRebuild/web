import "server-only";

import { getContent } from "@/data/content";
import type { FinderUnit } from "@/features/find/find-explorer";
import { routes } from "@/lib/routes";

import type { PostSummary, UnitSummary } from "./member-pages";

export function unitSummaries(): UnitSummary[] {
  return getContent()
    .listUnits()
    .map((u) => ({
      slug: u.slug,
      name: u.slug === "esocs" ? "ESOCS Worldwide" : u.name,
      kind: u.kind,
      locality: u.locality,
    }));
}

export function postSummaries(): PostSummary[] {
  return getContent()
    .getFeed({ limit: 1000 })
    .items.map((p) => ({
      id: p.id,
      title: p.title,
      kind: p.kind,
      date: p.date,
      href: p.gallerySlug ? routes.album(p.gallerySlug) : routes.post(p.id),
    }));
}

/** Local churches a member can call home: houses of prayer, districts and headquarters. */
export function homeChurchOptions(): FinderUnit[] {
  const content = getContent();
  const names = new Map(content.listUnits().map((u) => [u.slug, u.name]));
  return content.listUnits({ kind: ["branch", "district", "headquarters"] }).map((u) => ({
    slug: u.slug,
    name: u.name,
    kind: u.kind,
    locality: u.locality,
    address: u.address,
    country: u.country,
    parentName: u.parentSlug && u.parentSlug !== "esocs" ? (names.get(u.parentSlug) ?? null) : null,
  }));
}
