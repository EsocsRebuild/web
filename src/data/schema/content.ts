import { z } from "zod";

/**
 * Content model. Every organisational unit of the Holy Order, from the worldwide
 * body down to a single house of prayer, is a `Unit` with one shape, so any level
 * gets the same page, feed and directory entry. These schemas are the single source
 * of the types and validate every adapter's output.
 */

const isoDate = z.iso.date();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs are lowercase words joined by hyphens");
const text = z.string().trim().min(1);

/** Text that must never reach a page: dummy content left over from the legacy CMS. */
const placeholder = /lorem ipsum|98765432|99987654/i;
const realText = text.refine((v) => !placeholder.test(v), "Placeholder text is not publishable");

export const imageSchema = z.object({
  /** Absolute URL, or a path served by this app (starting with "/"). */
  url: z.union([z.url(), z.string().regex(/^\/[^/]/)]),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt: text,
});

export const unitKinds = [
  "holy-order",
  "headquarters",
  "cmc",
  "province",
  "special-area",
  "district",
  "branch",
  "section",
  "directorate",
] as const;
export const unitKindSchema = z.enum(unitKinds);

export const leaderSchema = z.object({
  name: text,
  role: text,
  personSlug: slug.optional(),
});

export const unitSchema = z.object({
  slug,
  kind: unitKindSchema,
  name: text,
  parentSlug: slug.nullable(),
  tagline: realText.nullable(),
  about: z.array(realText),
  locality: text.nullable(),
  address: text.nullable(),
  /** ISO 3166-1 alpha-2. */
  country: z.string().length(2).nullable(),
  established: isoDate.nullable(),
  cover: imageSchema.nullable(),
  avatar: imageSchema.nullable(),
  leaders: z.array(leaderSchema),
  phones: z.array(z.string().regex(/^\+\d{8,15}$/)),
});

export const postKinds = ["news", "message", "dedication", "album", "milestone"] as const;
export const postKindSchema = z.enum(postKinds);

export const postSchema = z.object({
  id: slug,
  kind: postKindSchema,
  /** The page that published it. */
  unitSlug: slug,
  /** Other pages the post also appears on. */
  tags: z.array(slug),
  title: realText,
  body: z.array(realText),
  /** Null when the source gives no date; undated posts are kept out of feeds. */
  date: isoDate.nullable(),
  images: z.array(imageSchema),
  gallerySlug: slug.optional(),
  /** The Baba Aladura whose tenure the record belongs to, where the history says so. */
  personSlug: slug.optional(),
});

export const eventKinds = ["observance", "service", "programme"] as const;

export const churchEventSchema = z.object({
  slug,
  title: realText,
  description: realText,
  date: isoDate,
  endDate: isoDate.optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
  kind: z.enum(eventKinds),
  unitSlug: slug,
  image: imageSchema.nullable(),
  /** Computed from church calendar rules rather than entered by hand. */
  computed: z.boolean(),
});

export const personSchema = z.object({
  slug,
  /** Position in the succession of Baba Aladuras. */
  order: z.number().int().positive(),
  honorific: text,
  name: text,
  designation: text,
  tenure: z.object({ from: z.number().int(), to: z.number().int().nullable() }),
  portrait: imageSchema.nullable(),
  bio: z.array(realText).min(1),
});

export const gallerySchema = z.object({
  slug,
  title: realText,
  date: isoDate,
  unitSlug: slug,
  cover: imageSchema,
  photos: z.array(imageSchema).min(1),
});

export const visitSchema = z.object({
  date: isoDate,
  unitSlug: slug,
  summary: realText,
  postId: slug,
});

/** A year of the Baba Aladura's pastoral visits, grouped by year as recorded. */
export const tourSchema = z.object({
  slug,
  title: realText,
  year: z.number().int(),
  visits: z.array(visitSchema).min(1),
});

export const ordinationSchema = z.object({
  slug,
  date: isoDate,
  title: realText,
  summary: realText,
  unitSlug: slug,
});

export const organisationSchema = z.object({
  name: text,
  shortName: text,
  founded: z.number().int(),
  founder: text,
  summary: realText,
  vision: realText,
  /** Null while the legacy text is incomplete; see docs/PLAN.md data problems. */
  mission: realText.nullable(),
  coreValues: z.array(z.object({ letter: z.string().length(1), value: text })).min(1),
  watchword: z.object({ text: realText, reference: text }),
  message: z.object({ title: realText, subtitle: realText, body: z.array(realText).min(1) }),
  givingAppeal: z.object({ title: realText, body: realText, image: imageSchema.nullable() }),
  heroSlides: z.array(z.object({ title: realText, image: imageSchema })),
  socials: z.array(z.object({ name: text, url: z.url() })),
  phones: z.array(z.object({ label: text, number: z.string().regex(/^\+\d{8,15}$/) })),
});

export type ImageRef = z.infer<typeof imageSchema>;
export type UnitKind = z.infer<typeof unitKindSchema>;
export type Leader = z.infer<typeof leaderSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type PostKind = z.infer<typeof postKindSchema>;
export type Post = z.infer<typeof postSchema>;
export type ChurchEvent = z.infer<typeof churchEventSchema>;
export type Person = z.infer<typeof personSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
export type Visit = z.infer<typeof visitSchema>;
export type Tour = z.infer<typeof tourSchema>;
export type Ordination = z.infer<typeof ordinationSchema>;
export type Organisation = z.infer<typeof organisationSchema>;
