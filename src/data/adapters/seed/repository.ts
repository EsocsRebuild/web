import { observancesForYear } from "@/lib/church-calendar";

import type { ContentRepository, EventQuery, FeedQuery, Page, UnitQuery } from "../../repositories";
import type { ChurchEvent, Post, Unit } from "../../schema/content";
import { buildSeedGraph, ROOT_SLUG, type SeedGraph } from "./build";

const DEFAULT_PAGE_SIZE = 10;

/** Newest first; undated posts never enter feeds. */
const byDateDesc = (a: Post, b: Post) => b.date!.localeCompare(a.date!) || a.id.localeCompare(b.id);

function observanceEvents(year: number): ChurchEvent[] {
  return observancesForYear(year).map((o) => ({
    slug: o.slug,
    title: o.title,
    description: o.description,
    date: o.date,
    ...(o.endDate ? { endDate: o.endDate } : {}),
    startTime: null,
    kind: "observance",
    unitSlug: ROOT_SLUG,
    image: null,
    computed: true,
  }));
}

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

export function createSeedContentRepository(graph: SeedGraph = buildSeedGraph()): ContentRepository {
  const units = new Map(graph.units.map((u) => [u.slug, u]));
  const children = new Map<string, Unit[]>();
  for (const u of graph.units) {
    if (!u.parentSlug) continue;
    children.set(u.parentSlug, [...(children.get(u.parentSlug) ?? []), u]);
  }
  for (const list of children.values()) list.sort((a, b) => a.name.localeCompare(b.name, "en"));

  const posts = new Map(graph.posts.map((p) => [p.id, p]));
  const datedPosts = graph.posts.filter((p) => p.date).sort(byDateDesc);

  const descendants = (slug: string): string[] =>
    (children.get(slug) ?? []).flatMap((c) => [c.slug, ...descendants(c.slug)]);

  const postTouches = (post: Post, slugs: Set<string>) =>
    slugs.has(post.unitSlug) || post.tags.some((t) => slugs.has(t));

  return {
    getOrganisation: () => graph.organisation,

    getUnit: (slug) => units.get(slug) ?? null,

    listUnits(query: UnitQuery = {}) {
      const kinds = query.kind ? new Set([query.kind].flat()) : null;
      const q = query.q?.trim().toLowerCase();
      return graph.units
        .filter((u) => !kinds || kinds.has(u.kind))
        .filter((u) => !query.parentSlug || u.parentSlug === query.parentSlug)
        .filter((u) => !query.country || u.country === query.country)
        .filter((u) => !q || [u.name, u.locality, u.address].some((f) => f?.toLowerCase().includes(q)))
        .sort((a, b) => a.name.localeCompare(b.name, "en"));
    },

    getAncestors(slug) {
      const chain: Unit[] = [];
      for (let u = units.get(units.get(slug)?.parentSlug ?? ""); u; u = units.get(u.parentSlug ?? "")) {
        chain.unshift(u);
      }
      return chain;
    },

    getChildren: (slug) => children.get(slug) ?? [],

    getDescendantCount: (slug) => descendants(slug).length,

    getFeed(query: FeedQuery = {}): Page<Post> {
      let list = datedPosts;
      if (query.unitSlug) {
        const scope = new Set([
          query.unitSlug,
          ...(query.includeDescendants ? descendants(query.unitSlug) : []),
        ]);
        // The root's own feed is the whole Order.
        if (query.unitSlug !== ROOT_SLUG) list = list.filter((p) => postTouches(p, scope));
      }
      if (query.kind) list = list.filter((p) => p.kind === query.kind);
      if (query.excludeIds?.length) {
        const excluded = new Set(query.excludeIds);
        list = list.filter((p) => !excluded.has(p.id));
      }

      const limit = query.limit ?? DEFAULT_PAGE_SIZE;
      const offset = query.cursor ? Number.parseInt(query.cursor, 36) || 0 : 0;
      const items = list.slice(offset, offset + limit);
      const next = offset + limit;
      return { items, nextCursor: next < list.length ? next.toString(36) : null };
    },

    getPost: (id) => posts.get(id) ?? null,

    listPostsForUnit(slug, options = {}) {
      const scope = new Set([slug]);
      const dated = slug === ROOT_SLUG ? datedPosts : datedPosts.filter((p) => postTouches(p, scope));
      if (!options.includeUndated) return dated;
      const undated = graph.posts.filter((p) => !p.date && (slug === ROOT_SLUG || postTouches(p, scope)));
      return [...dated, ...undated];
    },

    listEvents(query: EventQuery = {}) {
      const from = query.from ?? today();
      const to = query.to ?? plusDays(from, 365);
      const years: number[] = [];
      for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) years.push(y);
      return years
        .flatMap(observanceEvents)
        .filter((e) => (e.endDate ?? e.date) >= from && e.date <= to)
        .filter((e) => !query.unitSlug || e.unitSlug === query.unitSlug)
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    getEvent(slug) {
      const year = Number(slug.match(/-(\d{4})$/)?.[1]);
      if (!year) return null;
      return observanceEvents(year).find((e) => e.slug === slug) ?? null;
    },

    listPeople: () => [...graph.people].sort((a, b) => a.order - b.order),
    getPerson: (slug) => graph.people.find((p) => p.slug === slug) ?? null,

    listGalleries: () => [...graph.galleries].sort((a, b) => b.date.localeCompare(a.date)),
    getGallery: (slug) => graph.galleries.find((g) => g.slug === slug) ?? null,

    listTours: () => graph.tours,
    getTour: (slug) => graph.tours.find((t) => t.slug === slug) ?? null,

    listOrdinations: () => [...graph.ordinations].sort((a, b) => b.date.localeCompare(a.date)),
  };
}
