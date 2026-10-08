import { apiClient, type ApiClient } from "@/lib/api-client";
import { observancesForYear } from "@/lib/church-calendar";

import type { ContentRepository, EventQuery, FeedQuery, Page, UnitQuery } from "../../repositories";
import type { ChurchEvent, Post, Unit } from "../../schema/content";
import { buildSeedGraph, ROOT_SLUG, type SeedGraph } from "../seed/build";
import {
  mapBackendPost,
  mapBackendUnit,
  type BackendPostResponse,
  type BackendUnitResponse,
} from "./mappers";

const DEFAULT_PAGE_SIZE = 10;

const byDateDesc = (a: Post, b: Post) => b.date!.localeCompare(a.date!) || a.id.localeCompare(b.id);

function observanceEvents(year: number): ChurchEvent[] {
  return observancesForYear(year).map((o) => ({
    slug: o.slug,
    title: o.title,
    description: o.description,
    date: o.date,
    ...(o.endDate ? { endDate: o.endDate } : {}),
    startTime: o.startTime ?? null,
    kind: "observance",
    unitSlug: ROOT_SLUG,
    image: null,
    computed: true,
  }));
}

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

interface BackendOccurrenceResponse {
  id: string;
  eventId: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  status: string;
  description?: string | null;
  location?: string | null;
  unitId?: string | null;
  unitSlug?: string | null;
  imageUrl?: string | null;
}

export interface HttpContentRepositoryOptions {
  client?: ApiClient;
  initialGraph?: SeedGraph;
}

export interface ExtendedHttpContentRepository extends ContentRepository {
  syncUnits(): Promise<void>;
  syncPosts(): Promise<void>;
  syncEvents(): Promise<void>;
  refresh(): Promise<void>;
}

export function createHttpContentRepository(
  options: HttpContentRepositoryOptions = {},
): ExtendedHttpContentRepository {
  const { client = apiClient, initialGraph = buildSeedGraph() } = options;

  let graph = initialGraph;
  let units = new Map(graph.units.map((u) => [u.slug, u]));
  let children = computeChildren(graph.units);
  let posts = new Map(graph.posts.map((p) => [p.id, p]));
  let datedPosts = graph.posts.filter((p) => p.date).sort(byDateDesc);
  const eventsMap = new Map<string, ChurchEvent>();

  function computeChildren(unitList: Unit[]) {
    const map = new Map<string, Unit[]>();
    for (const u of unitList) {
      if (!u.parentSlug) continue;
      map.set(u.parentSlug, [...(map.get(u.parentSlug) ?? []), u]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, "en"));
    }
    return map;
  }

  const descendants = (slug: string): string[] =>
    (children.get(slug) ?? []).flatMap((c) => [c.slug, ...descendants(c.slug)]);

  const postTouches = (post: Post, slugs: Set<string>) =>
    slugs.has(post.unitSlug) || post.tags.some((t) => slugs.has(t));

  async function syncUnits(): Promise<void> {
    try {
      const res = await client.get<BackendUnitResponse[]>("/public/units");
      if (Array.isArray(res.data) && res.data.length > 0) {
        const fetchedUnits = res.data.map(mapBackendUnit);
        // Merge with seed units, prioritizing backend
        const mergedMap = new Map(graph.units.map((u) => [u.slug, u]));
        for (const u of fetchedUnits) {
          mergedMap.set(u.slug, u);
        }
        const updatedUnits = Array.from(mergedMap.values());
        units = mergedMap;
        children = computeChildren(updatedUnits);
        graph = { ...graph, units: updatedUnits };
      }
    } catch {
      // Backend not running / offline: retain current graph
    }
  }

  async function syncPosts(): Promise<void> {
    try {
      const res = await client.get<BackendPostResponse[]>("/public/content/posts");
      if (Array.isArray(res.data) && res.data.length > 0) {
        const fetchedPosts = res.data.map(mapBackendPost);
        const mergedMap = new Map(graph.posts.map((p) => [p.id, p]));
        for (const p of fetchedPosts) {
          mergedMap.set(p.id, p);
        }
        const updatedPosts = Array.from(mergedMap.values());
        posts = mergedMap;
        datedPosts = updatedPosts.filter((p) => p.date).sort(byDateDesc);
        graph = { ...graph, posts: updatedPosts };
      }
    } catch {
      // Backend not running / offline: retain current graph
    }
  }

  async function syncEvents(): Promise<void> {
    try {
      const res = await client.get<BackendOccurrenceResponse[]>("/public/events?days=365");
      if (Array.isArray(res.data) && res.data.length > 0) {
        for (const o of res.data) {
          const slug = `event-${o.id}`;
          const image = o.imageUrl
            ? {
                url: o.imageUrl,
                width: 1200,
                height: 800,
                alt: o.title,
              }
            : null;
          eventsMap.set(slug, {
            slug,
            title: o.title,
            description: o.description ?? (o.location ? `Venue: ${o.location}` : "Church Event"),
            date: o.startsAt.slice(0, 10),
            endDate: o.endsAt ? o.endsAt.slice(0, 10) : undefined,
            startTime: o.startsAt.length >= 16 ? o.startsAt.slice(11, 16) : null,
            kind:
              o.type.toLowerCase() === "service"
                ? "service"
                : o.type.toLowerCase() === "observance"
                  ? "observance"
                  : "programme",
            unitSlug: o.unitSlug ?? ROOT_SLUG,
            image,
            computed: false,
          });
        }
      }
    } catch {
      // Backend offline: retain current state
    }
  }

  async function refresh(): Promise<void> {
    await Promise.allSettled([syncUnits(), syncPosts(), syncEvents()]);
  }

  return {
    syncUnits,
    syncPosts,
    syncEvents,
    refresh,

    getOrganisation: () => graph.organisation,

    getUnit: (slug: string) => units.get(slug) ?? null,

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

    getAncestors(slug: string) {
      const chain: Unit[] = [];
      for (let u = units.get(units.get(slug)?.parentSlug ?? ""); u; u = units.get(u.parentSlug ?? "")) {
        chain.unshift(u);
      }
      return chain;
    },

    getChildren: (slug: string) => children.get(slug) ?? [],

    getDescendantCount: (slug: string) => descendants(slug).length,

    getFeed(query: FeedQuery = {}): Page<Post> {
      let list = datedPosts;
      if (query.unitSlug) {
        const scope = new Set([
          query.unitSlug,
          ...(query.includeDescendants ? descendants(query.unitSlug) : []),
        ]);
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

    getPost: (id: string) => posts.get(id) ?? null,

    listPostsForUnit(slug: string, options = {}) {
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
      const observances = years.flatMap(observanceEvents);
      const customEvents = Array.from(eventsMap.values());
      return [...observances, ...customEvents]
        .filter((e) => (e.endDate ?? e.date) >= from && e.date <= to)
        .filter((e) => !query.unitSlug || e.unitSlug === query.unitSlug)
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    getEvent(slug: string) {
      if (eventsMap.has(slug)) {
        return eventsMap.get(slug)!;
      }
      const year = Number(slug.match(/-(\d{4})$/)?.[1]);
      if (!year) return null;
      return observanceEvents(year).find((e) => e.slug === slug) ?? null;
    },

    listPeople: () => [...graph.people].sort((a, b) => a.order - b.order),
    getPerson: (slug: string) => graph.people.find((p) => p.slug === slug) ?? null,

    listGalleries: () => [...graph.galleries].sort((a, b) => b.date.localeCompare(a.date)),
    getGallery: (slug: string) => graph.galleries.find((g) => g.slug === slug) ?? null,

    listTours: () => graph.tours,
    getTour: (slug: string) => graph.tours.find((t) => t.slug === slug) ?? null,

    listOrdinations: () => [...graph.ordinations].sort((a, b) => b.date.localeCompare(a.date)),
  };
}
