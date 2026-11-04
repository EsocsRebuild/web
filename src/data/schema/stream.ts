import { z } from "zod";

export const sacredStreamCategories = [
  "sermon-clip",
  "prophetic-word",
  "canticle-hymn",
  "testimony",
] as const;

export type SacredStreamCategory = (typeof sacredStreamCategories)[number];

export const synchronizedVerseSchema = z.object({
  timeSec: z.number(),
  text: z.string(),
  textYoruba: z.string().optional(),
});

export type SynchronizedVerse = z.infer<typeof synchronizedVerseSchema>;

export const sacredStreamItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.enum(sacredStreamCategories),
  author: z.string().min(1),
  authorTitle: z.string().default("Ecclesiastical Minister"),
  authorAvatarUrl: z.string().optional(),
  verifiedClergy: z.boolean().default(true),
  unitSlug: z.string().optional(),
  unitName: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  thumbnailUrl: z.string(),
  scriptureReference: z.string().optional(),
  scriptureText: z.string().optional(),
  caption: z.string(),
  hymnNumber: z.number().int().positive().optional(),
  verses: z.array(synchronizedVerseSchema).optional(),
  amensCount: z.number().int().nonnegative().default(0),
  intercessionsCount: z.number().int().nonnegative().default(0),
  sharesCount: z.number().int().nonnegative().default(0),
  durationSeconds: z.number().int().positive().default(60),
  publishedAt: z.string(),
});

export type SacredStreamItem = z.infer<typeof sacredStreamItemSchema>;

export interface StreamQuery {
  category?: SacredStreamCategory;
  unitSlug?: string;
  limit?: number;
  cursor?: string;
}
