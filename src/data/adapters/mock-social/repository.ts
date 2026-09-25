import { SocialError } from "../../errors";
import type { SocialRepository } from "../../repositories";
import {
  commentSchema,
  memberSchema,
  reactionKinds,
  type Comment,
  type Member,
  type Notification,
  type ReactionKind,
  type ReactionSummary,
  type ReportReason,
  type RsvpStatus,
} from "../../schema/social";

/**
 * Device-local implementation of the social contract. It exists so every
 * interaction state (pending, success, failure, signed out) is designed and tested
 * before the Payload backend lands; nothing leaves the device and no counts are
 * invented. Replace with the Payload adapter without touching components.
 */

interface State {
  version: 1;
  member: Member | null;
  pendingContact: string | null;
  /** postId → memberId → reaction */
  reactions: Record<string, Record<string, ReactionKind>>;
  comments: Comment[];
  following: string[];
  saved: string[];
  rsvps: Record<string, RsvpStatus>;
  notifications: Notification[];
  reports: { postId?: string; commentId?: string; reason: ReportReason; note?: string; at: string }[];
  prayerRequests: { name?: string; contact?: string; request: string; at: string }[];
}

const emptyState = (): State => ({
  version: 1,
  member: null,
  pendingContact: null,
  reactions: {},
  comments: [],
  following: [],
  saved: [],
  rsvps: {},
  notifications: [],
  reports: [],
  prayerRequests: [],
});

export interface MockSocialOptions {
  /** Where state is kept; `null` keeps it in memory only. */
  storage?: Pick<Storage, "getItem" | "setItem"> | null;
  storageKey?: string;
  /** Simulated round trip, in milliseconds. */
  latency?: [min: number, max: number];
  /** Share of requests that fail with a retryable network error (0–1). */
  failureRate?: number;
  /** Accept the demo code `000000`. Never enabled in production builds. */
  allowDemoSignIn?: boolean;
  now?: () => Date;
  random?: () => number;
}

export const DEMO_CODE = "000000";

const CONTACT = /^(\+?\d[\d\s-]{7,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export function createMockSocialRepository(options: MockSocialOptions = {}): SocialRepository {
  const {
    storage = null,
    storageKey = "esocs:social:v1",
    latency = [150, 400],
    failureRate = 0,
    allowDemoSignIn = false,
    now = () => new Date(),
    random = Math.random,
  } = options;

  const listeners = new Set<() => void>();
  let state = load();
  let sequence = 0;

  function load(): State {
    try {
      const raw = storage?.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed.version === 1) return { ...emptyState(), ...parsed };
      }
    } catch {
      // Unreadable or blocked storage: start clean.
    }
    return emptyState();
  }

  function commit(next: State) {
    state = next;
    try {
      storage?.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage full or blocked; state still lives for this session.
    }
    listeners.forEach((listener) => listener());
  }

  async function request<T>(work: () => T): Promise<T> {
    const [min, max] = latency;
    if (max > 0) await new Promise((r) => setTimeout(r, min + random() * (max - min)));
    if (random() < failureRate)
      throw new SocialError("network", "We couldn't reach the server. Please try again.");
    return work();
  }

  const id = (prefix: string) => `${prefix}-${now().getTime().toString(36)}-${(sequence++).toString(36)}`;
  const stamp = () => now().toISOString();

  function requireMember(): Member {
    if (!state.member) throw new SocialError("unauthenticated", "Sign in to continue.");
    return state.member;
  }

  function summary(postId: string): ReactionSummary {
    const byMember = state.reactions[postId] ?? {};
    const counts = Object.fromEntries(reactionKinds.map((k) => [k, 0])) as Record<ReactionKind, number>;
    for (const kind of Object.values(byMember)) counts[kind] += 1;
    return { counts, mine: state.member ? (byMember[state.member.id] ?? null) : null };
  }

  function ownComment(commentId: string): Comment {
    const member = requireMember();
    const comment = state.comments.find((c) => c.id === commentId);
    if (!comment) throw new SocialError("not-found", "That comment no longer exists.");
    if (comment.authorId !== member.id)
      throw new SocialError("forbidden", "You can only change your own comments.");
    return comment;
  }

  return {
    getSession: () => request(() => state.member),

    requestCode: (contact) =>
      request(() => {
        if (!allowDemoSignIn) {
          throw new SocialError("unavailable", "Member accounts are coming soon.");
        }
        const normalised = contact.trim();
        if (!CONTACT.test(normalised))
          throw new SocialError("validation", "Enter a valid email address or phone number.");
        commit({ ...state, pendingContact: normalised });
      }),

    verifyCode: (contact, code, displayName) =>
      request(() => {
        if (!allowDemoSignIn) throw new SocialError("unavailable", "Member accounts are coming soon.");
        if (state.pendingContact !== contact.trim())
          throw new SocialError("validation", "Request a new code to continue.");
        if (code !== DEMO_CODE)
          throw new SocialError("invalid-code", "That code isn't right. Check it and try again.");
        const member = memberSchema.parse({
          id: state.member?.id ?? id("member"),
          displayName: displayName?.trim() || state.member?.displayName || contact.trim().split("@")[0],
          contact: contact.trim(),
          homeUnitSlug: state.member?.homeUnitSlug ?? null,
          joinedAt: state.member?.joinedAt ?? stamp(),
        });
        const welcome: Notification = {
          id: id("notification"),
          kind: "welcome",
          title: "Welcome to ESOCS. Choose your home church to see its news first.",
          href: "/onboarding",
          createdAt: stamp(),
          read: false,
        };
        const isNew = !state.notifications.some((n) => n.kind === "welcome");
        commit({
          ...state,
          member,
          pendingContact: null,
          notifications: isNew ? [welcome, ...state.notifications] : state.notifications,
        });
        return member;
      }),

    signOut: () => request(() => commit({ ...state, member: null })),

    updateProfile: (changes) =>
      request(() => {
        const member = memberSchema.parse({ ...requireMember(), ...changes });
        commit({ ...state, member });
        return member;
      }),

    getReactions: (postId) => request(() => summary(postId)),

    setReaction: (postId, kind) =>
      request(() => {
        const member = requireMember();
        const byMember = { ...(state.reactions[postId] ?? {}) };
        if (kind) byMember[member.id] = kind;
        else delete byMember[member.id];
        commit({ ...state, reactions: { ...state.reactions, [postId]: byMember } });
        return summary(postId);
      }),

    listComments: (postId) =>
      request(() =>
        state.comments
          .filter((c) => c.postId === postId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      ),

    addComment: (postId, body, parentId = null) =>
      request(() => {
        const member = requireMember();
        if (parentId) {
          const parent = state.comments.find((c) => c.id === parentId);
          if (!parent) throw new SocialError("not-found", "That comment no longer exists.");
          // One level of replies: replying to a reply joins its thread.
          parentId = parent.parentId ?? parent.id;
        }
        const parsed = commentSchema.safeParse({
          id: id("comment"),
          postId,
          parentId,
          authorId: member.id,
          authorName: member.displayName,
          body,
          createdAt: stamp(),
          editedAt: null,
        });
        if (!parsed.success)
          throw new SocialError("validation", "Comments must be between 1 and 2,000 characters.");
        commit({ ...state, comments: [...state.comments, parsed.data] });
        return parsed.data;
      }),

    editComment: (commentId, body) =>
      request(() => {
        const existing = ownComment(commentId);
        const parsed = commentSchema.safeParse({ ...existing, body, editedAt: stamp() });
        if (!parsed.success)
          throw new SocialError("validation", "Comments must be between 1 and 2,000 characters.");
        commit({ ...state, comments: state.comments.map((c) => (c.id === commentId ? parsed.data : c)) });
        return parsed.data;
      }),

    deleteComment: (commentId) =>
      request(() => {
        ownComment(commentId);
        // Replies go with the comment they answer.
        commit({
          ...state,
          comments: state.comments.filter((c) => c.id !== commentId && c.parentId !== commentId),
        });
      }),

    report: (target, reason, note) =>
      request(() => {
        requireMember();
        commit({ ...state, reports: [...state.reports, { ...target, reason, note, at: stamp() }] });
      }),

    listFollowing: () => request(() => (state.member ? state.following : [])),

    setFollowing: (unitSlug, following) =>
      request(() => {
        requireMember();
        const next = following
          ? [...new Set([...state.following, unitSlug])]
          : state.following.filter((s) => s !== unitSlug);
        commit({ ...state, following: next });
      }),

    listSaved: () => request(() => (state.member ? state.saved : [])),

    setSaved: (postId, saved) =>
      request(() => {
        requireMember();
        const next = saved ? [...new Set([postId, ...state.saved])] : state.saved.filter((s) => s !== postId);
        commit({ ...state, saved: next });
      }),

    getRsvp: (eventSlug) => request(() => (state.member ? (state.rsvps[eventSlug] ?? null) : null)),

    setRsvp: (eventSlug, status) =>
      request(() => {
        requireMember();
        const rsvps = { ...state.rsvps };
        if (status) rsvps[eventSlug] = status;
        else delete rsvps[eventSlug];
        commit({ ...state, rsvps });
      }),

    submitPrayerRequest: (input) =>
      request(() => {
        if (!allowDemoSignIn) throw new SocialError("unavailable", "Online prayer requests are coming soon.");
        const text = input.request.trim();
        if (text.length < 3 || text.length > 4000) {
          throw new SocialError("validation", "Please write your request (up to 4,000 characters).");
        }
        commit({
          ...state,
          prayerRequests: [
            ...state.prayerRequests,
            {
              name: input.name?.trim() || undefined,
              contact: input.contact?.trim() || undefined,
              request: text,
              at: stamp(),
            },
          ],
        });
      }),

    listNotifications: () =>
      request(() =>
        state.member ? [...state.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [],
      ),

    markNotificationsRead: (ids) =>
      request(() => {
        requireMember();
        const target = ids ? new Set(ids) : null;
        commit({
          ...state,
          notifications: state.notifications.map((n) =>
            !target || target.has(n.id) ? { ...n, read: true } : n,
          ),
        });
      }),

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
