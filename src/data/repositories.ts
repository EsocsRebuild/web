import type {
  ChurchEvent,
  Gallery,
  Ordination,
  Organisation,
  Person,
  Post,
  PostKind,
  Tour,
  Unit,
  UnitKind,
} from "./schema/content";
import type {
  Comment,
  Member,
  Notification,
  ReactionKind,
  ReactionSummary,
  ReportReason,
  RsvpStatus,
} from "./schema/social";

/**
 * The contracts every data source implements. Components depend only on these,
 * so the legacy seed adapter can be replaced by Payload without UI changes.
 */

export interface Page<T> {
  items: T[];
  /** Opaque cursor for the next page, or null at the end. */
  nextCursor: string | null;
}

export interface UnitQuery {
  kind?: UnitKind | UnitKind[];
  parentSlug?: string;
  country?: string;
  /** Case-insensitive match on name, locality and address. */
  q?: string;
}

export interface FeedQuery {
  /** Posts published by or tagged with this unit (and, for `includeDescendants`, its sub-units). */
  unitSlug?: string;
  includeDescendants?: boolean;
  kind?: PostKind;
  /** Posts already told elsewhere on the page (e.g. a branch's own dedication story). */
  excludeIds?: string[];
  cursor?: string | null;
  limit?: number;
}

export interface EventQuery {
  /** Inclusive ISO date bounds. */
  from?: string;
  to?: string;
  unitSlug?: string;
}

export interface ContentRepository {
  getOrganisation(): Organisation;

  getUnit(slug: string): Unit | null;
  listUnits(query?: UnitQuery): Unit[];
  /** Ancestors from the root down to (not including) the unit. */
  getAncestors(slug: string): Unit[];
  getChildren(slug: string): Unit[];
  getDescendantCount(slug: string): number;

  getFeed(query?: FeedQuery): Page<Post>;
  getPost(id: string): Post | null;
  /** Newest first. Undated posts (some milestones) are included only when asked for, last. */
  listPostsForUnit(slug: string, options?: { includeUndated?: boolean }): Post[];

  listEvents(query?: EventQuery): ChurchEvent[];
  getEvent(slug: string): ChurchEvent | null;

  listPeople(): Person[];
  getPerson(slug: string): Person | null;

  listGalleries(): Gallery[];
  getGallery(slug: string): Gallery | null;

  listTours(): Tour[];
  getTour(slug: string): Tour | null;

  listOrdinations(): Ordination[];
}

export interface SocialRepository {
  getSession(): Promise<Member | null>;
  /** Sends a one-time code to an email address or phone number. */
  requestCode(contact: string): Promise<void>;
  verifyCode(contact: string, code: string, displayName?: string): Promise<Member>;
  signOut(): Promise<void>;
  updateProfile(changes: Partial<Pick<Member, "displayName" | "homeUnitSlug">>): Promise<Member>;

  getReactions(postId: string): Promise<ReactionSummary>;
  setReaction(postId: string, kind: ReactionKind | null): Promise<ReactionSummary>;

  listComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, body: string, parentId?: string | null): Promise<Comment>;
  editComment(commentId: string, body: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  report(target: { postId?: string; commentId?: string }, reason: ReportReason, note?: string): Promise<void>;

  listFollowing(): Promise<string[]>;
  setFollowing(unitSlug: string, following: boolean): Promise<void>;

  listSaved(): Promise<string[]>;
  setSaved(postId: string, saved: boolean): Promise<void>;

  getRsvp(eventSlug: string): Promise<RsvpStatus | null>;
  setRsvp(eventSlug: string, status: RsvpStatus | null): Promise<void>;

  /** Private: read only by the prayer team. Works signed in or not. */
  submitPrayerRequest(request: { name?: string; contact?: string; request: string }): Promise<void>;

  listNotifications(): Promise<Notification[]>;
  markNotificationsRead(ids?: string[]): Promise<void>;

  /** Notifies listeners whenever any social state changes. */
  subscribe(listener: () => void): () => void;
}
