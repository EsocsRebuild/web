import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";

import { getContent } from "@/data/content";
import type { Unit } from "@/data/schema/content";
import type { UnitTab } from "@/lib/routes";

export interface TabSpec {
  tab: UnitTab | null;
  label: string;
  count?: number;
}

/** Everything a unit page and its tabs need, resolved once per request. */
export const getUnitContext = cache((slug: string) => {
  const content = getContent();
  const unit = content.getUnit(slug);
  if (!unit) notFound();

  const ancestors = content.getAncestors(slug);
  const parent = ancestors.at(-1) ?? null;
  const siblings = parent ? content.getChildren(parent.slug) : [];
  const children = content.getChildren(slug);
  const posts = content.listPostsForUnit(slug);
  const galleries = content.listGalleries().filter((g) => g.unitSlug === slug);
  const events = content.listEvents({ unitSlug: slug });
  const photos = slug === "esocs" ? galleries : [];

  // Tabs appear only when they have something in them.
  const tabs: TabSpec[] = [
    { tab: null, label: "Posts", count: posts.length },
    { tab: "about", label: "About" },
  ];
  if (children.length) tabs.push({ tab: "branches", label: childTabLabel(unit), count: children.length });
  if (unit.leaders.length)
    tabs.push({
      tab: "leaders",
      label: unit.slug === "esocs" ? "Advisory Board" : "Leaders",
      count: unit.leaders.length,
    });
  if (photos.length) tabs.push({ tab: "photos", label: "Photos", count: photos.length });
  if (events.length) tabs.push({ tab: "events", label: "Events", count: events.length });

  return { unit, ancestors, parent, siblings, children, posts, galleries: photos, events, tabs };
});

export function childTabLabel(unit: Unit) {
  if (unit.kind === "holy-order") return "Network";
  if (unit.kind === "cmc") return "Provinces";
  return "Branches";
}

export function hasTab(ctx: ReturnType<typeof getUnitContext>, tab: UnitTab) {
  return ctx.tabs.some((t) => t.tab === tab);
}

/**
 * Static params for a tab route: only units that actually have the tab are
 * pre-rendered. Everything else is a normal 404 at request time, instead of a
 * pre-built 404 page per unit (which multiplied the build output several times).
 */
export function staticParamsForTab(tab: UnitTab) {
  return getContent()
    .listUnits()
    .filter((u) => hasTab(getUnitContext(u.slug), tab))
    .map((u) => ({ slug: u.slug }));
}
