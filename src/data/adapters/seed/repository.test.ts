import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildSeedGraph } from "./build";
import { createSeedContentRepository } from "./repository";

const graph = buildSeedGraph();
const repo = createSeedContentRepository(graph);

describe("seed graph", () => {
  it("builds a single tree rooted at the Holy Order", () => {
    const roots = graph.units.filter((u) => u.parentSlug === null);
    expect(roots.map((u) => u.slug)).toEqual(["esocs"]);
    for (const u of graph.units) {
      if (u.parentSlug) expect(repo.getUnit(u.parentSlug), `${u.slug} → ${u.parentSlug}`).not.toBeNull();
    }
  });

  it("has every level of the Order", () => {
    const kinds = new Set(graph.units.map((u) => u.kind));
    for (const kind of [
      "holy-order",
      "headquarters",
      "cmc",
      "province",
      "special-area",
      "district",
      "branch",
      "section",
      "directorate",
    ]) {
      expect(kinds, kind).toContain(kind);
    }
    expect(repo.listUnits({ kind: "cmc" })).toHaveLength(12);
    expect(repo.getUnit("women")?.leaders.map((l) => l.name)).toEqual([
      "Mother Cherub Janet Otubu",
      "Mother Seraph Esther Obaro",
      "Mother Captain Mariam Akinbode",
    ]);
  });

  it("never publishes placeholder or truncated text", () => {
    const json = JSON.stringify(graph);
    expect(json).not.toMatch(/lorem ipsum/i);
    expect(json).not.toMatch(/98765432|99987654/);
    expect(graph.organisation.mission).toBeNull();
  });

  it("serves every image from this app's own media, and every file exists", () => {
    const urls = [
      ...graph.posts.flatMap((p) => p.images),
      ...graph.galleries.flatMap((g) => [g.cover, ...g.photos]),
      ...graph.people.flatMap((p) => (p.portrait ? [p.portrait] : [])),
      ...graph.organisation.heroSlides.map((h) => h.image),
      ...graph.units.flatMap((u) => [u.cover, u.avatar]).filter((i) => i !== null),
    ].map((i) => i.url);
    expect(urls.length).toBeGreaterThan(300);
    for (const url of urls) {
      expect(url.startsWith("/media/legacy/"), url).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", url)), url).toBe(true);
    }
  });

  it("gives every image alt text", () => {
    const images = [
      ...graph.posts.flatMap((p) => p.images),
      ...graph.galleries.flatMap((g) => [g.cover, ...g.photos]),
      ...graph.people.flatMap((p) => (p.portrait ? [p.portrait] : [])),
    ];
    expect(images.length).toBeGreaterThan(300);
    for (const img of images) expect(img.alt.trim()).not.toBe("");
  });

  it("keeps the succession of Baba Aladuras in order, ending with the current one", () => {
    const people = repo.listPeople();
    expect(people).toHaveLength(9);
    expect(people[0].name).toBe("Moses Orimolade Tunolase");
    expect(people.at(-1)?.tenure.to).toBeNull();
    for (const p of people) expect(p.bio.length).toBeGreaterThan(1);
  });
});

describe("hierarchy", () => {
  it("returns ancestors from the root down", () => {
    expect(repo.getAncestors("diobu-provincial-headquarters").map((u) => u.slug)).toEqual([
      "esocs",
      "cmc-9",
      "diobu-province",
    ]);
    expect(repo.getAncestors("esocs")).toEqual([]);
  });

  it("lists children alphabetically and counts descendants", () => {
    const names = repo.getChildren("awka-province").map((u) => u.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    expect(names.length).toBe(4);
    expect(repo.getDescendantCount("cmc-9")).toBe(2);
  });

  it("filters the directory by kind, parent and text", () => {
    expect(repo.listUnits({ q: "ibadan" }).map((u) => u.slug)).toEqual(
      expect.arrayContaining([
        "ibadan-province",
        "mokola-district-headquarters",
        "covenant-house-of-prayer-ibadan",
      ]),
    );
    expect(repo.listUnits({ kind: ["province", "special-area"] }).length).toBeGreaterThan(60);
    expect(repo.listUnits({ country: "US" }).every((u) => u.country === "US")).toBe(true);
  });
});

describe("feeds", () => {
  it("orders the Order-wide feed newest first and pages with a cursor", () => {
    const first = repo.getFeed({ limit: 5 });
    expect(first.items).toHaveLength(5);
    const dates = first.items.map((p) => p.date!);
    expect(dates).toEqual([...dates].sort().reverse());

    const second = repo.getFeed({ limit: 5, cursor: first.nextCursor });
    expect(second.items[0].id).not.toBe(first.items[0].id);
    expect(new Set([...first.items, ...second.items].map((p) => p.id)).size).toBe(10);
  });

  it("shows a branch's dedication on the branch and its province", () => {
    const onBranch = repo.listPostsForUnit("diobu-provincial-headquarters").map((p) => p.title);
    expect(onBranch).toContain("Dedication of Diobu Provincial Headquarters");
    const onProvince = repo.getFeed({ unitSlug: "diobu-province", limit: 50 }).items.map((p) => p.title);
    expect(onProvince).toContain("Dedication of Diobu Provincial Headquarters");
  });

  it("gives Women its own milestones", () => {
    const titles = repo.listPostsForUnit("women").map((p) => p.title);
    expect(titles).toContain("Rank of Special Senior Mother-in-Israel created");
  });

  it("includes undated milestones only when asked, after dated posts", () => {
    expect(repo.listPostsForUnit("women").every((p) => p.date)).toBe(true);
    const all = repo.listPostsForUnit("women", { includeUndated: true });
    expect(all.map((p) => p.title)).toContain("Female members to read the first lesson");
    expect(all.at(-1)?.date).toBeNull();
  });

  it("leaves out posts the page already tells", () => {
    const all = repo.getFeed({ unitSlug: "oroigwe-pro-cathedral", limit: 50 }).items;
    const without = repo.getFeed({
      unitSlug: "oroigwe-pro-cathedral",
      excludeIds: [all[0].id],
      limit: 50,
    }).items;
    expect(without).toHaveLength(all.length - 1);
  });

  it("filters by post kind", () => {
    const albums = repo.getFeed({ kind: "album", limit: 50 }).items;
    expect(albums.length).toBe(5);
    expect(albums.every((p) => p.kind === "album" && p.gallerySlug)).toBe(true);
  });
});

describe("events", () => {
  it("computes church calendar observances for a date range", () => {
    const events = repo.listEvents({ from: "2026-09-24", to: "2027-04-30" });
    expect(events.map((e) => e.title)).toEqual([
      "Christmas Day",
      "Ash Wednesday · Lent begins",
      "ESOCS Mother's Day",
      "Palm Sunday",
      "Good Friday",
      "Easter Sunday",
    ]);
    expect(events.every((e) => e.computed)).toBe(true);
  });

  it("resolves an event by slug", () => {
    expect(repo.getEvent("easter-sunday-2027")?.date).toBe("2027-03-28");
    expect(repo.getEvent("unknown")).toBeNull();
  });
});

describe("eras", () => {
  it("files milestones under the Baba Aladura the history names", () => {
    const post = repo.getPost("milestone-revival-of-the-mount-zion-youth-society");
    expect(post?.personSlug).toBe("lazarus-anuba-onyeleonu");
    const benin = graph.posts.find((p) => p.title.startsWith("First Christian crusade"));
    expect(benin?.personSlug).toBe("david-dabaye-lamjose-bob-manuel");
    const people = new Set(graph.people.map((p) => p.slug));
    for (const p of graph.posts) if (p.personSlug) expect(people.has(p.personSlug), p.id).toBe(true);
  });
});

describe("tours", () => {
  it("groups dated dedications into yearly pastoral visits", () => {
    const tours = repo.listTours();
    expect(tours[0].year).toBeGreaterThan(tours.at(-1)!.year);
    const visits2023 = repo.getTour("pastoral-visits-2023")!.visits;
    expect(visits2023.map((v) => v.date)).toEqual([...visits2023.map((v) => v.date)].sort());
  });
});
