import fs from "node:fs";
import path from "node:path";

import { apiClient, type ApiClient } from "@/lib/api-client";
import { observancesForYear } from "@/lib/church-calendar";

import type { ContentRepository, EventQuery, FeedQuery, Page, UnitQuery } from "../../repositories";
import type { ChurchEvent, Post, Unit } from "../../schema/content";
import { buildSeedGraph, ROOT_SLUG, type SeedGraph } from "../seed/build";
import { initialSacredStreamItems } from "../seed/stream-data";
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
  title?: string;
  eventTitle?: string;
  type?: string;
  eventType?: string;
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
  syncAdminPortalData(): void;
  refresh(): Promise<void>;
}

export function createHttpContentRepository(
  options: HttpContentRepositoryOptions = {},
): ExtendedHttpContentRepository {
  const { client = apiClient, initialGraph = buildSeedGraph() } = options;

  let graph = initialGraph;
  let units = new Map(graph.units.map((u) => [u.slug, u]));
  let children = computeChildren(graph.units);
  const posts = new Map(graph.posts.map((p) => [p.id, p]));
  const syncedPostIds = new Set<string>();
  let datedPosts = graph.posts.filter((p) => p.date).sort(byDateDesc);
  const eventsMap = new Map<string, ChurchEvent>();
  const unitIdToSlug = new Map<string, string>([
    ["01a11f17-f539-746b-975d-bfd5ae201541", "diobu-provincial-headquarters"],
    ["01a11f17-f52e-7fbe-ad2b-0b0a7ae346bd", "cmc-9"],
    ["01a11f17-eca9-7687-9ff0-b8dca297717f", ROOT_SLUG],
  ]);

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
        for (const raw of res.data) {
          if (raw.id && raw.slug) {
            unitIdToSlug.set(raw.id, raw.slug);
          }
        }
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
      if (Array.isArray(res.data)) {
        const fetchedPosts = res.data.map(mapBackendPost);
        const activeBackendPostIds = new Set(fetchedPosts.map((p) => p.id));

        // Prune any previously synced backend post that was deleted on the server
        for (const id of Array.from(syncedPostIds)) {
          if (!activeBackendPostIds.has(id)) {
            posts.delete(id);
            syncedPostIds.delete(id);
          }
        }

        for (const p of fetchedPosts) {
          posts.set(p.id, p);
          syncedPostIds.add(p.id);
        }
        const updatedPosts = Array.from(posts.values());
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
      if (Array.isArray(res.data)) {
        const activeOccurrenceIds = new Set<string>();
        for (const o of res.data) {
          activeOccurrenceIds.add(o.id);
          const slug = `event-${o.id}`;
          const title = o.eventTitle || o.title || "Church Gathering";
          const typeStr = (o.eventType || o.type || "service").toLowerCase();
          const unitSlug = o.unitSlug || (o.unitId ? unitIdToSlug.get(o.unitId) : null) || ROOT_SLUG;
          const image = o.imageUrl
            ? {
                url: o.imageUrl,
                width: 1200,
                height: 800,
                alt: title,
              }
            : null;
          const startsAt = o.startsAt || new Date().toISOString();
          eventsMap.set(slug, {
            slug,
            title,
            description: o.description ?? (o.location ? `Venue: ${o.location}` : "Church Event"),
            date: startsAt.slice(0, 10),
            endDate: o.endsAt ? o.endsAt.slice(0, 10) : undefined,
            startTime: startsAt.length >= 16 ? startsAt.slice(11, 16) : null,
            kind: typeStr === "service" ? "service" : typeStr === "observance" ? "observance" : "programme",
            unitSlug,
            image,
            computed: false,
          });

          // Single canonical feed post ID to prevent duplicate feed entries
          const postId = `evt-post-${o.id}`;
          posts.set(postId, {
            id: postId,
            kind: "news",
            unitSlug,
            tags: [unitSlug, "events", "cmc-9"],
            title,
            body: [
              o.description ||
                `Upcoming service and gathering at ${o.location || "the Sanctuary"}. All are welcome to attend.`,
            ],
            date: startsAt.slice(0, 10),
            images: image ? [image] : [],
          });
        }

        // Cleanly prune any backend event or post that is no longer returned
        for (const [k, ev] of eventsMap.entries()) {
          if (k.startsWith("event-") && !ev.computed) {
            const rawId = k.replace(/^event-/, "");
            if (!activeOccurrenceIds.has(rawId)) {
              eventsMap.delete(k);
            }
          }
        }
        for (const [k] of posts.entries()) {
          if (k.startsWith("evt-post-") || k.startsWith("backend-evt-")) {
            const rawId = k.replace(/^evt-post-|^backend-evt-/, "");
            if (!activeOccurrenceIds.has(rawId)) {
              posts.delete(k);
            }
          }
        }

        const updatedPosts = Array.from(posts.values());
        datedPosts = updatedPosts.filter((p) => p.date).sort(byDateDesc);
        graph = { ...graph, posts: updatedPosts };
      }
    } catch {
      // Backend offline: retain current state
    }
  }

  function syncAdminPortalData(): void {
    try {
      function resolveDbPath(relSubPath: string, fileName: string): string | null {
        const syncPath = path.resolve(process.cwd(), "src/data/sync", fileName);
        if (fs.existsSync(syncPath)) return syncPath;
        const hostPaths = [
          path.resolve(process.cwd(), "src/features-admin", relSubPath),
          path.resolve(process.cwd(), "../AdminPortal/src/features", relSubPath),
          path.resolve(process.cwd(), "AdminPortal/src/features", relSubPath),
          path.join("/Users/testapp/Documents/TechDev/EsocsRebuild/AdminPortal/src/features", relSubPath),
        ];
        return hostPaths.find((p) => fs.existsSync(p)) ?? null;
      }

      // 1. Sync Events
      const activeLocalEvtIds = new Set<string>();
      const eventsDbPath = resolveDbPath("events/events-db.json", "events-db.json");
      if (eventsDbPath && fs.existsSync(eventsDbPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(eventsDbPath, "utf-8"));
          if (Array.isArray(list)) {
            for (const ev of list) {
              activeLocalEvtIds.add(ev.id);
              const slug = `event-${ev.id}`;
              const unitSlug =
                (ev.unitName || "").toLowerCase().includes("diobu") || (ev.unitId || "").includes("diobu")
                  ? "diobu-provincial-headquarters"
                  : ROOT_SLUG;
              const startsAt = ev.startDate || new Date().toISOString();
              eventsMap.set(slug, {
                slug,
                title: ev.title,
                description: ev.description || (ev.venue ? `Venue: ${ev.venue}` : "Church Event"),
                date: startsAt.slice(0, 10),
                endDate: ev.endDate ? ev.endDate.slice(0, 10) : undefined,
                startTime: startsAt.length >= 16 ? startsAt.slice(11, 16) : null,
                kind: ev.category?.toLowerCase() === "sunday_service" ? "service" : "programme",
                unitSlug,
                image: ev.bannerUrl
                  ? {
                      url: ev.bannerUrl,
                      width: 1200,
                      height: 800,
                      alt: ev.title,
                    }
                  : null,
                computed: false,
              });

              // Add to posts feed
              const postId = `evt-post-${ev.id}`;
              posts.set(postId, {
                id: postId,
                kind: "news",
                unitSlug,
                tags: [unitSlug, "events", "diobu-province", "cmc-9"],
                title: ev.title,
                body: [
                  ev.description ||
                    `Upcoming service and gathering at ${ev.venue || "the Sanctuary"}. All are welcome to attend.`,
                ],
                date: startsAt.slice(0, 10),
                images: ev.bannerUrl ? [{ url: ev.bannerUrl, width: 1200, height: 675, alt: ev.title }] : [],
              });
            }
          }
        } catch {}
      }
      // Prune deleted local events
      for (const [k] of posts.entries()) {
        if (k.startsWith("evt-post-")) {
          const rawId = k.replace(/^evt-post-/, "");
          if (!activeLocalEvtIds.has(rawId)) {
            posts.delete(k);
            eventsMap.delete(`event-${rawId}`);
          }
        }
      }

      // 2. Sync Programmes
      const activeProgIds = new Set<string>();
      const progDbPath = resolveDbPath("web-cms/programmes-db.json", "programmes-db.json");
      if (progDbPath && fs.existsSync(progDbPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(progDbPath, "utf-8"));
          if (Array.isArray(list)) {
            for (const pr of list) {
              activeProgIds.add(pr.id);
              const slug = `prog-${pr.id}`;
              const unitSlug =
                (pr.unitName || "").toLowerCase().includes("diobu") || (pr.unitId || "").includes("diobu")
                  ? "diobu-provincial-headquarters"
                  : ROOT_SLUG;
              const sched = pr.scheduleDate || new Date().toISOString();
              eventsMap.set(slug, {
                slug,
                title: pr.title,
                description: pr.theme
                  ? `Theme: "${pr.theme}". Keynote Speakers: ${(pr.speakers || []).join(", ")}`
                  : "Provincial Programme",
                date: sched.slice(0, 10),
                startTime: sched.length >= 16 ? sched.slice(11, 16) : null,
                kind: "programme",
                unitSlug,
                image: null,
                computed: false,
              });

              const postId = `prog-post-${pr.id}`;
              posts.set(postId, {
                id: postId,
                kind: "news",
                unitSlug,
                tags: [unitSlug, "programmes", "diobu-province", "cmc-9"],
                title: `${pr.title} — ${pr.theme}`,
                body: [`Theme: "${pr.theme}". Keynote Speakers: ${(pr.speakers || []).join(", ")}.`],
                date: sched.slice(0, 10),
                images: [],
              });
            }
          }
        } catch {}
      }
      // Prune deleted programmes
      for (const [k] of posts.entries()) {
        if (k.startsWith("prog-post-")) {
          const rawId = k.replace(/^prog-post-/, "");
          if (!activeProgIds.has(rawId)) {
            posts.delete(k);
            eventsMap.delete(`prog-${rawId}`);
          }
        }
      }

      // 3. Sync Posts & Bulletins
      const activeBulletinIds = new Set<string>();
      const postsDbPath = resolveDbPath("web-cms/posts-db.json", "posts-db.json");
      if (postsDbPath && fs.existsSync(postsDbPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(postsDbPath, "utf-8"));
          if (Array.isArray(list)) {
            for (const b of list) {
              activeBulletinIds.add(b.id);
              const pId = `bulletin-${b.id}`;
              const unitSlug =
                (b.unitName || "").toLowerCase().includes("diobu") || (b.unitId || "").includes("diobu")
                  ? "diobu-provincial-headquarters"
                  : ROOT_SLUG;
              posts.set(pId, {
                id: pId,
                kind: "news",
                unitSlug,
                tags: [unitSlug, "bulletin", "diobu-province", "cmc-9"],
                title: b.title,
                body: [b.summary],
                date: (b.publishedAt || b.submittedAt || new Date().toISOString()).slice(0, 10),
                images: b.imageUrl ? [{ url: b.imageUrl, width: 1200, height: 675, alt: b.title }] : [],
              });
            }
          }
        } catch {}
      }
      // Prune deleted bulletins
      for (const [k] of posts.entries()) {
        if (k.startsWith("bulletin-")) {
          const rawId = k.replace(/^bulletin-/, "");
          if (!activeBulletinIds.has(rawId)) {
            posts.delete(k);
          }
        }
      }

      // 4. Sync Media Assets & Unit Visual Identity
      const mediaDbPath = resolveDbPath("web-cms/media-db.json", "media-db.json");
      if (mediaDbPath && fs.existsSync(mediaDbPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(mediaDbPath, "utf-8"));
          const albumPostId = "album-diobu-cathedral";
          const gSlug = "gallery-diobu-cathedral";
          if (Array.isArray(list) && list.length > 0) {
            const diobu = units.get("diobu-provincial-headquarters");
            if (diobu) {
              const altar =
                list.find(
                  (m: { fileName?: string; cdnUrl?: string }) =>
                    m.fileName?.includes("altar") ||
                    m.fileName?.includes("sanctuary") ||
                    m.fileName?.includes("cathedral"),
                ) || list[0];
              const crest = list.find((m: { fileName?: string; cdnUrl?: string }) =>
                m.fileName?.includes("crest"),
              ) || { cdnUrl: "/brand/esocs-crest.png" };

              diobu.cover = {
                url: altar.cdnUrl,
                width: 1200,
                height: 800,
                alt: "Diobu Provincial Headquarters Cathedral Sanctuary",
              };
              diobu.avatar = {
                url: crest.cdnUrl,
                width: 192,
                height: 192,
                alt: "Diobu Provincial Headquarters Crest",
              };
              units.set("diobu-provincial-headquarters", diobu);
            }

            // Create or update gallery for Diobu
            const diobuPhotos = list.map((m: { cdnUrl: string; fileName?: string }) => ({
              url: m.cdnUrl,
              width: 1200,
              height: 800,
              alt: m.fileName ? m.fileName.replace(/[_-]/g, " ").replace(/\.[^.]+$/, "") : "Cathedral Media",
            }));
            const diobuGallery: Gallery = {
              slug: gSlug,
              title: "Diobu Provincial Headquarters Cathedral & Ministries",
              date: new Date().toISOString().slice(0, 10),
              unitSlug: "diobu-provincial-headquarters",
              cover: diobuPhotos[0],
              photos: diobuPhotos,
            };

            const idx = graph.galleries.findIndex((g) => g.slug === gSlug);
            if (idx >= 0) {
              graph.galleries[idx] = diobuGallery;
            } else {
              graph.galleries.unshift(diobuGallery);
            }

            // Add album post
            posts.set(albumPostId, {
              id: albumPostId,
              kind: "album",
              unitSlug: "diobu-provincial-headquarters",
              tags: ["diobu-provincial-headquarters", "photos", "diobu-province", "cmc-9"],
              title: "Cathedral Sanctuary & Worship Highlights",
              body: [
                "Photographs from recent services, choir ministrations, and cathedral life at Diobu Provincial Headquarters.",
              ],
              date: new Date().toISOString().slice(0, 10),
              images: diobuPhotos.slice(0, 4),
              gallerySlug: gSlug,
            });
          } else {
            // Prune dynamic gallery & album post if media list is empty
            posts.delete(albumPostId);
            const idx = graph.galleries.findIndex((g) => g.slug === gSlug);
            if (idx >= 0) {
              graph.galleries.splice(idx, 1);
            }
          }
        } catch {}
      }

      // Re-sort dated posts
      const updatedPosts = Array.from(posts.values());
      datedPosts = updatedPosts.filter((p) => p.date).sort(byDateDesc);
      graph = { ...graph, posts: updatedPosts };
    } catch {}
  }

  // Initial sync from AdminPortal databases
  syncAdminPortalData();

  async function refresh(): Promise<void> {
    syncAdminPortalData();
    await Promise.allSettled([syncUnits(), syncPosts(), syncEvents()]);
  }

  return {
    syncUnits,
    syncPosts,
    syncEvents,
    syncAdminPortalData,
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

    listStreamItems: (query = {}) => {
      let items = initialSacredStreamItems;
      if (query.category) {
        items = items.filter((i) => i.category === query.category);
      }
      if (query.unitSlug) {
        items = items.filter((i) => i.unitSlug === query.unitSlug);
      }
      return items;
    },
  };
}
