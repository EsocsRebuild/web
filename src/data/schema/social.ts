import { z } from "zod";

/** Member-generated state. Counts are derived from real actions only, never seeded. */

export const reactionKinds = ["amen", "love", "praise"] as const;
export const reactionKindSchema = z.enum(reactionKinds);

export const memberSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().trim().min(1).max(80),
  /** Email or phone, as the member signed in with. */
  contact: z.string().min(3),
  homeUnitSlug: z.string().nullable(),
  joinedAt: z.iso.datetime(),
});

export const commentSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  parentId: z.string().nullable(),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  createdAt: z.iso.datetime(),
  editedAt: z.iso.datetime().nullable(),
});

export const notificationSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["new-post", "reply", "event-reminder", "welcome"]),
  title: z.string().min(1),
  href: z.string().startsWith("/"),
  createdAt: z.iso.datetime(),
  read: z.boolean(),
});

export const rsvpStatusSchema = z.enum(["going", "interested"]);

export const reportReasons = ["spam", "abuse", "false-information", "other"] as const;

export type ReactionKind = z.infer<typeof reactionKindSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;
export type ReportReason = (typeof reportReasons)[number];

export interface ReactionSummary {
  counts: Record<ReactionKind, number>;
  mine: ReactionKind | null;
}
