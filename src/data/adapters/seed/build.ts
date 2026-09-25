import { z } from "zod";

import advisoryBoardSeed from "../../../../data/legacy/seed/advisory-board.json";
import babaAladurasSeed from "../../../../data/legacy/seed/baba-aladuras.json";
import cmcsSeed from "../../../../data/legacy/seed/cmcs.json";
import contactsSeed from "../../../../data/legacy/seed/contacts.json";
import dedicationsSeed from "../../../../data/legacy/seed/dedications.json";
import directoratesSeed from "../../../../data/legacy/seed/directorates.json";
import galleriesSeed from "../../../../data/legacy/seed/galleries.json";
import heroSlidesSeed from "../../../../data/legacy/seed/hero-slides.json";
import milestonesSeed from "../../../../data/legacy/seed/milestones.json";
import newsSeed from "../../../../data/legacy/seed/news.json";
import organisationSeed from "../../../../data/legacy/seed/organisation.json";
import provincesSeed from "../../../../data/legacy/seed/provinces.json";

import { displayCase, htmlToParagraphs } from "@/lib/text";

import {
  gallerySchema,
  ordinationSchema,
  organisationSchema,
  personSchema,
  postSchema,
  tourSchema,
  unitSchema,
  type Gallery,
  type ImageRef,
  type Leader,
  type Ordination,
  type Organisation,
  type Person,
  type Post,
  type Tour,
  type Unit,
  type UnitKind,
} from "../../schema/content";
import {
  BRANCHES,
  DEDICATION_UNITS,
  HEADQUARTERS,
  INTERNATIONAL,
  PROVINCES_MENTIONED,
  type DirectoryEntry,
} from "./directory";

export interface SeedGraph {
  organisation: Organisation;
  units: Unit[];
  posts: Post[];
  people: Person[];
  galleries: Gallery[];
  tours: Tour[];
  ordinations: Ordination[];
}

export const ROOT_SLUG = "esocs";
const CURRENT_BABA_ALADURA = "david-dabaye-lamjose-bob-manuel";

// ---------------------------------------------------------------------------
// Helpers

type SeedImage = { url: string; width: number | null; height: number | null; alt?: string | null } | null;

/**
 * Images are served from this app's own copies (scripts/legacy/optimise-media.mjs),
 * never from the slow legacy host. Moving to object storage changes only this base.
 */
export const LEGACY_MEDIA_BASE = "/media/legacy";
const LEGACY_UPLOADS = "https://super-vault.esocs.net/wp-content/uploads/";
const MAX_EDGE = 1280;

function image(source: SeedImage | undefined, alt: string): ImageRef | null {
  if (!source) return null;
  const raster = /\.(jpe?g|png|webp)$/i.test(source.url) && source.url.startsWith(LEGACY_UPLOADS);
  const scale =
    raster && source.width && source.height
      ? Math.min(1, MAX_EDGE / Math.max(source.width, source.height))
      : 1;
  return {
    url: raster
      ? `${LEGACY_MEDIA_BASE}/${decodeURIComponent(source.url.slice(LEGACY_UPLOADS.length))}.webp`
      : source.url,
    width: source.width ? Math.round(source.width * scale) : null,
    height: source.height ? Math.round(source.height * scale) : null,
    alt: source.alt || alt,
  };
}

function unit(fields: Partial<Unit> & Pick<Unit, "slug" | "kind" | "name" | "parentSlug">): Unit {
  return {
    tagline: null,
    about: [],
    locality: null,
    address: null,
    country: null,
    established: null,
    cover: null,
    avatar: null,
    leaders: [],
    phones: [],
    ...fields,
  };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’'.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Legacy text truncated mid-sentence ends on a joining word; it is not publishable as is. */
const isTruncated = (value: string) => /\b(and|or|the|of|to|in)$/i.test(value.trim());

/** Paragraphs typed in capitals (headings, signatures) read as shouting; set them in display case. */
const unshout = (paragraph: string) =>
  paragraph === paragraph.toUpperCase() && /[A-Z]{3}/.test(paragraph) ? displayCase(paragraph) : paragraph;

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const longDate = (iso: string) => LONG_DATE.format(new Date(`${iso}T00:00:00Z`));

// ---------------------------------------------------------------------------
// Organisation and people

function buildOrganisation(): Organisation {
  const o = organisationSeed;
  return {
    name: o.name,
    shortName: o.shortName,
    founded: o.founded,
    founder: o.founder,
    summary: o.summary,
    vision: o.vision,
    mission: isTruncated(o.mission) ? null : o.mission,
    coreValues: o.coreValues,
    watchword: { text: "Sustained by God's Endless Mercies", reference: "Lamentations 3:21" },
    message: {
      title: "New Year Message",
      subtitle: displayCase(o.welcomeMessage.subtitle),
      body: htmlToParagraphs(o.welcomeMessage.bodyHtml).map(unshout),
    },
    givingAppeal: {
      title: o.givingAppeal.title,
      body: o.givingAppeal.body,
      image: image(o.givingAppeal.image, "Sowing Seeds of Love"),
    },
    heroSlides: heroSlidesSeed.flatMap((slide) => {
      const title = displayCase(slide.title);
      const img = image(slide.image, title);
      return img ? [{ title, image: img }] : [];
    }),
    socials: o.socials.map((s) => ({ name: s.name === "Youtube" ? "YouTube" : s.name, url: s.url })),
    phones: contactsSeed.phones,
  };
}

function buildPeople(): Person[] {
  return babaAladurasSeed.map((p) => {
    const name = `${p.firstName} ${p.lastName}`.replace(/\s+/g, " ").trim();
    return {
      slug: p.slug,
      order: p.order,
      honorific: p.honorific.trim(),
      name,
      designation: p.designation.trim(),
      tenure: p.tenure ?? { from: 0, to: null },
      portrait: image(p.portrait, `Portrait of ${name}`),
      bio: htmlToParagraphs(p.bioHtml).map(unshout),
    };
  });
}

// ---------------------------------------------------------------------------
// Units

interface BoardMember {
  name: string;
  portfolio: string | null;
}

function boardMembers(): BoardMember[] {
  return advisoryBoardSeed.flatMap((m) =>
    m.name ? [{ name: displayCase(m.name), portfolio: m.portfolio ? displayCase(m.portfolio) : null }] : [],
  );
}

function buildRoot(org: Organisation, board: BoardMember[]): Unit {
  const leaders: Leader[] = board.map((m, i) => ({
    name: m.name,
    role: m.portfolio ?? "Member, Advisory Board",
    ...(i === 0 ? { personSlug: CURRENT_BABA_ALADURA } : {}),
  }));
  return unit({
    slug: ROOT_SLUG,
    kind: "holy-order",
    name: org.name,
    parentSlug: null,
    tagline: `Founded in ${org.founded} by ${org.founder}`,
    about: [org.summary, `Vision: ${org.vision}`],
    locality: "Worldwide",
    cover: org.heroSlides.find((s) => /banner/i.test(s.title))?.image ?? null,
    leaders,
    phones: org.phones.map((p) => p.number),
  });
}

function buildCmcs(): Unit[] {
  return cmcsSeed.map((c) => {
    const leaders: Leader[] = [];
    if (c.chairman) leaders.push({ name: displayCase(c.chairman), role: "Chairman" });
    if (c.viceChairman) leaders.push({ name: displayCase(c.viceChairman), role: "Vice Chairman" });
    if (c.secretary) leaders.push({ name: displayCase(c.secretary), role: "Secretary" });
    return unit({ slug: c.slug, kind: "cmc", name: c.name, parentSlug: ROOT_SLUG, leaders });
  });
}

const SECTIONS: Record<string, { slug: string; name: string; tagline: string; boardRole: RegExp }> = {
  "womens-affairs": {
    slug: "women",
    name: "Women",
    tagline: "Directorate of Women's Affairs",
    boardRole: /Director - Women Affairs/i,
  },
  "youth-affairs": {
    slug: "youth",
    name: "Youth",
    tagline: "Directorate of Youth Affairs · Mount Zion Youth Society (MZYS)",
    boardRole: /Director - Youth Affairs/i,
  },
};

function buildDirectoratesAndSections(board: BoardMember[]): Unit[] {
  return directoratesSeed.map((d) => {
    const section = SECTIONS[d.slug];
    const about = htmlToParagraphs(d.bodyHtml);
    if (section) {
      const leaders = board
        .filter((m) => m.portfolio && section.boardRole.test(m.portfolio))
        .map((m) => ({
          name: m.name,
          role: section.slug === "women" ? "Director, Women's Affairs" : "Director, Youth Affairs",
        }));
      return unit({
        slug: section.slug,
        kind: "section",
        name: section.name,
        parentSlug: ROOT_SLUG,
        tagline: section.tagline,
        about,
        leaders,
      });
    }
    const leaders = d.director ? [{ name: displayCase(d.director), role: "Director" }] : [];
    return unit({
      slug: slugify(d.name),
      kind: "directorate",
      name: d.name,
      parentSlug: ROOT_SLUG,
      about,
      leaders,
    });
  });
}

function buildDirectory(): Unit[] {
  const fromEntry = (kind: UnitKind) => (e: DirectoryEntry) =>
    unit({
      slug: e.slug,
      kind: e.kind ?? kind,
      name: e.name,
      parentSlug: e.parent,
      locality: e.locality ?? null,
      address: e.address ?? null,
      country: e.country ?? (kind === "branch" || kind === "district" ? "NG" : null),
      established: e.established ?? null,
      about: e.note ? [e.note] : [],
    });

  const created = provincesSeed.map((p) =>
    unit({
      slug: p.slug,
      kind: p.kind === "special-area" ? "special-area" : "province",
      name: p.name,
      parentSlug: ROOT_SLUG,
      about: ["Created under Baba Aladura Dr. D. D. L. Bob-Manuel (2017 – present)."],
    }),
  );

  return [
    ...HEADQUARTERS.map(fromEntry("headquarters")),
    ...INTERNATIONAL.map(fromEntry("branch")),
    ...created,
    ...PROVINCES_MENTIONED.map(fromEntry("province")),
    ...BRANCHES.map(fromEntry("branch")),
  ];
}

// ---------------------------------------------------------------------------
// Posts

/** Records in the list of dedications that are not a church building being dedicated. */
const OTHER_RECORDS: Record<number, { title: string; body: (date: string) => string }> = {
  21: {
    title: "Baba Aladura's manse commissioned in Onitsha Province",
    body: (d) => `His Most Eminence commissioned the Baba Aladura's manse in Onitsha Province on ${d}.`,
  },
  24: {
    title: "Foundation laid for Saint Gabriel House of Prayer, Ibadan",
    body: (d) => `The foundation of Saint Gabriel House of Prayer, Ibadan Province, was laid on ${d}.`,
  },
  28: {
    title: "Foundation laid for the CMC 9 hospital",
    body: (d) => `The foundation of the CMC 9 hospital was laid on ${d}.`,
  },
  33: {
    title: "Baba Aladura's manse dedicated in Enugu Province",
    body: (d) => `The Baba Aladura's manse in Enugu Province was dedicated on ${d}.`,
  },
  40: {
    title: "Baba Aladura's manse dedicated at Nando, Ogbunike Province",
    body: (d) => `The Baba Aladura's manse at Nando, Ogbunike Province, was dedicated on ${d}.`,
  },
};
const TITLES: Record<number, string> = {
  0: "Dedication of the new Mount Zion General Headquarters cathedral",
};
const DATES: Record<number, string> = {
  // The source reads "13th February, 202"; it sits in the February 2021 visits to Onitsha.
  21: "2021-02-13",
  // Foundation laid 15 February 2021; dedicated 11 December 2021.
  22: "2021-12-11",
};

function buildDedicationPosts(units: Map<string, Unit>): Post[] {
  if (DEDICATION_UNITS.length !== dedicationsSeed.length) {
    throw new Error(
      `DEDICATION_UNITS has ${DEDICATION_UNITS.length} entries for ${dedicationsSeed.length} dedications`,
    );
  }
  return dedicationsSeed.map((d, i) => {
    const target = units.get(DEDICATION_UNITS[i]);
    if (!target) throw new Error(`Dedication ${i} points to unknown unit ${DEDICATION_UNITS[i]}`);
    const date = DATES[i] ?? d.date;
    if (!date) throw new Error(`Dedication ${i} has no date`);

    const other = OTHER_RECORDS[i];
    const isBuilding = !other;
    const title = other?.title ?? TITLES[i] ?? `Dedication of ${target.name}`;
    const body = other
      ? [other.body(longDate(date))]
      : [
          `${target.name}${target.locality ? `, ${target.locality},` : ""} was dedicated by His Most Eminence, Baba Aladura Dr. D. D. L. Bob-Manuel, on ${longDate(date)}.`,
          ...target.about,
        ];

    const tags = [target.slug, target.parentSlug].filter((s): s is string => !!s && s !== ROOT_SLUG);
    return {
      id: `dedication-${date}-${slugify(title)}`.slice(0, 96).replace(/-$/, ""),
      kind: isBuilding ? "dedication" : "milestone",
      unitSlug: ROOT_SLUG,
      tags: [...new Set(tags)],
      title,
      body,
      date,
      images: [],
      // The list of dedications sits under the current Baba Aladura's achievements.
      personSlug: CURRENT_BABA_ALADURA,
    };
  });
}

interface MilestoneSpec {
  index: number;
  title: string;
  date: string | null;
  tags?: string[];
}

/** Milestones from the history, with titles written to summarise each record faithfully. */
const MILESTONES: MilestoneSpec[] = [
  { index: 0, title: "Revival of the Mount Zion Youth Society", date: null, tags: ["youth"] },
  { index: 2, title: "70 acres acquired for the Moses Orimolade Unity Centre at Bara", date: null },
  {
    index: 15,
    title: "Mount Zion National Headquarters Management Council established",
    date: null,
    tags: ["mount-zion-general-headquarters"],
  },
  { index: 16, title: "The Zion Daughters Band organised", date: null },
  { index: 19, title: "ESOCS celebrates its 90th anniversary", date: null },
  {
    index: 21,
    title: "Eternal Mandate, the biography of Baba Aladura Dr. L. A. Onyeleonu, launched",
    date: "2014-09-13",
  },
  { index: 23, title: "Baba Aladura Dr. L. A. Onyeleonu slept in the Lord", date: "2017-05-13" },
  { index: 25, title: "Saint Moses Orimolade Annual Lecture instituted", date: null },
  { index: 26, title: "Eleven directorates created to expand the administration", date: null },
  { index: 27, title: "Female members to read the first lesson", date: null, tags: ["women"] },
  {
    index: 28,
    title: "Seat of Baba Aladura carved out of the Abuja National Headquarters Annex",
    date: null,
    tags: ["national-headquarters-annex-abuja", "abuja-province"],
  },
  { index: 30, title: "Annual Advisory Board Retreat introduced", date: null },
  { index: 31, title: "First Christian crusade at King's Square, Benin Kingdom", date: "2018-05-26" },
  {
    index: 32,
    title: "Mother Jennie Winful Foundation office complex commissioned",
    date: null,
    tags: ["mount-zion-general-headquarters"],
  },
  {
    index: 34,
    title: "His Most Eminence receives the Vice-President of Nigeria at the Abuja Annex",
    date: "2018-07-02",
    tags: ["national-headquarters-annex-abuja"],
  },
  {
    index: 35,
    title: "Training workshop for the Visioners and Prophets of the Holy Order",
    date: "2018-09-08",
  },
  {
    index: 36,
    title: "Crusade at Ikare, hometown of the founder, and ESOCS water project commissioned",
    date: "2018-09-18",
  },
  {
    index: 37,
    title: "Memorial Holy Temple declared the Seat of Baba Aladura",
    date: "2018-10-07",
    tags: ["memorial-holy-temple", "lagos-province"],
  },
  { index: 38, title: "ESOCS Father's Day and Mother's Day instituted", date: "2021-04-08", tags: ["women"] },
  {
    index: 39,
    title: "Canada Special Area upgraded to Canada Province",
    date: "2022-07-13",
    tags: ["canada-province"],
  },
  {
    index: 40,
    title: "First ESOCS empowerment scheme graduates 62 in CMC 9",
    date: "2022-12-12",
    tags: ["cmc-9", "diobu-province", "diobu-provincial-headquarters"],
  },
];

/** The history files each achievement under a leader's heading; match it to a person by surname. */
function personForHeading(heading: string | null | undefined): string | undefined {
  if (!heading) return undefined;
  const upper = heading.toUpperCase();
  return babaAladurasSeed.find((p) => upper.includes(p.lastName.trim().split(" ").at(-1)!.toUpperCase()))
    ?.slug;
}

function buildMilestonePosts(): Post[] {
  const achievements = milestonesSeed.achievements;
  const posts: Post[] = MILESTONES.map((m) => {
    const personSlug = personForHeading(achievements[m.index].leader);
    return {
      id: `milestone-${slugify(m.title)}`.slice(0, 96).replace(/-$/, ""),
      kind: "milestone",
      unitSlug: ROOT_SLUG,
      tags: m.tags ?? [],
      title: m.title,
      body: [achievements[m.index].text.replace(/\s+/g, " ").trim()],
      date: m.date,
      images: [],
      ...(personSlug ? { personSlug } : {}),
    };
  });
  const rank = milestonesSeed.acquisitions.find((a) => /Mother-In-Israel/i.test(a));
  if (rank) {
    posts.push({
      id: "milestone-rank-of-special-senior-mother-in-israel-created",
      kind: "milestone",
      unitSlug: ROOT_SLUG,
      tags: ["women"],
      title: "Rank of Special Senior Mother-in-Israel created",
      body: [rank],
      date: "2024-10-02",
      images: [],
      personSlug: CURRENT_BABA_ALADURA,
    });
  }
  return posts;
}

function buildNewsPosts(): Post[] {
  return newsSeed.map((n) => ({
    id: `news-${n.slug}`,
    kind: "news" as const,
    unitSlug: ROOT_SLUG,
    tags: [],
    title: n.title,
    body: [n.body],
    date: n.date,
    images: [image(n.image, n.title)].filter((i): i is ImageRef => !!i),
  }));
}

function buildMessagePost(org: Organisation): Post {
  return {
    id: "message-new-year-2026",
    kind: "message",
    unitSlug: ROOT_SLUG,
    tags: [],
    title: "New Year Message from His Most Eminence, Baba Aladura & Prelate",
    body: org.message.body,
    // Last updated in the legacy CMS on 29 January 2026.
    date: "2026-01-29",
    images: [],
  };
}

function buildGalleries(): { galleries: Gallery[]; posts: Post[] } {
  const galleries: Gallery[] = galleriesSeed.map((g) => {
    const title = displayCase(g.title);
    const photos = g.photos.map((p, i) => image(p, `${title}, photo ${i + 1} of ${g.photos.length}`)!);
    return {
      slug: g.slug,
      title,
      date: g.published.slice(0, 10),
      unitSlug: ROOT_SLUG,
      cover: image(g.cover, `${title}, cover photo`)!,
      photos,
    };
  });
  const posts: Post[] = galleries.map((g) => ({
    id: `album-${g.slug}`,
    kind: "album",
    unitSlug: g.unitSlug,
    tags: [],
    title: g.title,
    body: [],
    date: g.date,
    images: [g.cover, ...g.photos.filter((p) => p.url !== g.cover.url)].slice(0, 5),
    gallerySlug: g.slug,
  }));
  return { galleries, posts };
}

function buildTours(posts: Post[]): Tour[] {
  const visits = posts.filter((p) => p.kind === "dedication" && p.date);
  const years = [...new Set(visits.map((p) => Number(p.date!.slice(0, 4))))].sort((a, b) => b - a);
  return years.map((year) => ({
    slug: `pastoral-visits-${year}`,
    title: `Pastoral visits and dedications, ${year}`,
    year,
    visits: visits
      .filter((p) => p.date!.startsWith(String(year)))
      .sort((a, b) => a.date!.localeCompare(b.date!))
      .map((p) => ({ date: p.date!, unitSlug: p.tags[0] ?? ROOT_SLUG, summary: p.title, postId: p.id })),
  }));
}

function buildOrdinations(): Ordination[] {
  const record = milestonesSeed.achievements[33].text;
  return [
    {
      slug: "special-senior-apostle-2018-kumasi",
      date: "2018-06-19",
      title: "Bishop Dr. Joshua Kofi-Dankwa Amos ordained Special Senior Apostle",
      summary: record.replace(/\s+/g, " ").trim(),
      unitSlug: ROOT_SLUG,
    },
  ];
}

// ---------------------------------------------------------------------------
// Assembly and integrity

function assertIntegrity(graph: SeedGraph) {
  const problems: string[] = [];
  const unitSlugs = new Set<string>();
  for (const u of graph.units) {
    if (unitSlugs.has(u.slug)) problems.push(`Duplicate unit slug: ${u.slug}`);
    unitSlugs.add(u.slug);
  }
  for (const u of graph.units) {
    if (u.parentSlug && !unitSlugs.has(u.parentSlug))
      problems.push(`${u.slug}: unknown parent ${u.parentSlug}`);
  }
  const roots = graph.units.filter((u) => u.parentSlug === null);
  if (roots.length !== 1) problems.push(`Expected exactly one root unit, found ${roots.length}`);

  const postIds = new Set<string>();
  for (const p of graph.posts) {
    if (postIds.has(p.id)) problems.push(`Duplicate post id: ${p.id}`);
    postIds.add(p.id);
    for (const slug of [p.unitSlug, ...p.tags]) {
      if (!unitSlugs.has(slug)) problems.push(`Post ${p.id}: unknown unit ${slug}`);
    }
  }
  for (const t of graph.tours) {
    for (const v of t.visits)
      if (!unitSlugs.has(v.unitSlug)) problems.push(`Tour ${t.slug}: unknown unit ${v.unitSlug}`);
  }
  if (problems.length) throw new Error(`Seed data failed integrity checks:\n- ${problems.join("\n- ")}`);
}

export function buildSeedGraph(): SeedGraph {
  const organisation = buildOrganisation();
  const board = boardMembers();
  const units = [
    buildRoot(organisation, board),
    ...buildCmcs(),
    ...buildDirectoratesAndSections(board),
    ...buildDirectory(),
  ];
  const unitMap = new Map(units.map((u) => [u.slug, u]));
  const { galleries, posts: albumPosts } = buildGalleries();
  const dedications = buildDedicationPosts(unitMap);
  const posts = [
    buildMessagePost(organisation),
    ...buildNewsPosts(),
    ...dedications,
    ...buildMilestonePosts(),
    ...albumPosts,
  ];

  const graph: SeedGraph = {
    organisation: organisationSchema.parse(organisation),
    units: z.array(unitSchema).parse(units),
    posts: z.array(postSchema).parse(posts),
    people: z.array(personSchema).parse(buildPeople()),
    galleries: z.array(gallerySchema).parse(galleries),
    tours: z.array(tourSchema).parse(buildTours(dedications)),
    ordinations: z.array(ordinationSchema).parse(buildOrdinations()),
  };
  assertIntegrity(graph);
  return graph;
}
