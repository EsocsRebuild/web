import { SocialError } from "../../errors";
import type { SocialRepository } from "../../repositories";
import {
  commentSchema,
  memberSchema,
  type Comment,
  type Member,
  type Notification,
  type ReactionKind,
  type ReactionSummary,
  type RsvpStatus,
} from "../../schema/social";
import { apiClient, isApiClientError, type ApiClient } from "@/lib/api-client";

export interface HttpSocialOptions {
  client?: ApiClient;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  storageKey?: string;
  allowDemoSignIn?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTACT = /^(\+?\d[\d\s-]{7,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

interface StoredSocialState {
  token: string | null;
  member: Member | null;
  pendingContact: string | null;
  reactions: Record<string, Record<string, ReactionKind>>;
  comments: Comment[];
  following: string[];
  saved: string[];
  rsvps: Record<string, RsvpStatus>;
  notifications: Notification[];
}

const defaultState = (): StoredSocialState => ({
  token: null,
  member: null,
  pendingContact: null,
  reactions: {},
  comments: [],
  following: [],
  saved: [],
  rsvps: {},
  notifications: [],
});

export function createHttpSocialRepository(options: HttpSocialOptions = {}): SocialRepository {
  const {
    client = apiClient,
    storage = typeof window === "undefined" ? null : window.localStorage,
    storageKey = "esocs:social:http:v1",
    allowDemoSignIn = process.env.NODE_ENV !== "production",
  } = options;

  const listeners = new Set<() => void>();
  let state = loadState();

  function loadState(): StoredSocialState {
    try {
      const raw = storage?.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultState(), ...parsed };
      }
    } catch {
      // storage unreadable
    }
    return defaultState();
  }

  function commit(next: StoredSocialState) {
    state = next;
    try {
      storage?.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore storage quota error
    }
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        // ignore listener errors
      }
    }
  }

  function mapError(err: unknown, fallbackMessage: string): SocialError {
    if (isApiClientError(err)) {
      if (err.isNotFound) return new SocialError("not-found", err.message || fallbackMessage);
      if (err.isUnauthorized) return new SocialError("unauthenticated", err.message || fallbackMessage);
      if (err.isForbidden) return new SocialError("forbidden", err.message || fallbackMessage);
      if (err.isValidation) return new SocialError("validation", err.message || fallbackMessage);
      if (err.code === "NETWORK_ERROR") return new SocialError("network", err.message || fallbackMessage);
      return new SocialError("unavailable", err.message || fallbackMessage);
    }
    if (err instanceof SocialError) return err;
    return new SocialError("unavailable", fallbackMessage);
  }

  function requireMember(): Member {
    if (!state.member) {
      throw new SocialError("unauthenticated", "Please sign in to continue.");
    }
    return state.member;
  }

  function summary(postId: string): ReactionSummary {
    const byMember = state.reactions[postId] ?? {};
    const counts: Record<ReactionKind, number> = { amen: 0, love: 0, praise: 0 };
    for (const kind of Object.values(byMember)) {
      if (kind in counts) counts[kind]++;
    }
    const mine = state.member ? (byMember[state.member.id] ?? null) : null;
    return { counts, mine };
  }

  return {
    async getSession(): Promise<Member | null> {
      if (!state.token && !state.member) {
        return null;
      }
      try {
        if (state.token) {
          const res = await client.get<{
            id: string;
            displayName?: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            phoneNumber?: string;
            homeUnitSlug?: string | null;
            createdAt?: string;
          }>("/identity/users/me", { token: state.token });

          const user = res.data;
          const member: Member = memberSchema.parse({
            id: user.id,
            displayName:
              user.displayName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Member",
            contact: user.email || user.phoneNumber || "member@esocs.net",
            homeUnitSlug: user.homeUnitSlug ?? null,
            joinedAt: user.createdAt ?? new Date().toISOString(),
          });
          commit({ ...state, member });
          return member;
        }
      } catch (err) {
        if (isApiClientError(err) && err.isUnauthorized) {
          commit({ ...state, token: null, member: null });
          return null;
        }
      }
      return state.member;
    },

    async requestCode(contact: string): Promise<void> {
      const normalised = contact.trim();
      if (!CONTACT.test(normalised)) {
        throw new SocialError("validation", "Enter a valid email address or phone number.");
      }

      if (!allowDemoSignIn) {
        throw new SocialError("unavailable", "Member accounts are coming soon.");
      }

      try {
        await client.post("/identity/auth/otp/send", { contact: normalised });
        commit({ ...state, pendingContact: normalised });
      } catch {
        // If API is unavailable in local dev, allow pendingContact so demo code can proceed
        commit({ ...state, pendingContact: normalised });
      }
    },

    async verifyCode(contact: string, code: string, displayName?: string): Promise<Member> {
      const normalised = contact.trim();
      if (state.pendingContact !== normalised) {
        throw new SocialError("validation", "Request a new code to continue.");
      }

      // Check if backend verification endpoint is reachable
      try {
        const res = await client.post<{
          token: string;
          user: {
            id: string;
            displayName?: string;
            email?: string;
            phoneNumber?: string;
            homeUnitSlug?: string | null;
            createdAt?: string;
          };
        }>("/identity/auth/otp/verify", {
          contact: normalised,
          code,
          displayName,
        });

        const token = res.data.token;
        const u = res.data.user;
        const member = memberSchema.parse({
          id: u.id,
          displayName: displayName?.trim() || u.displayName || normalised.split("@")[0],
          contact: u.email || u.phoneNumber || normalised,
          homeUnitSlug: u.homeUnitSlug ?? null,
          joinedAt: u.createdAt ?? new Date().toISOString(),
        });

        commit({
          ...state,
          token,
          member,
          pendingContact: null,
        });
        return member;
      } catch (err) {
        // Support demo sign-in outside production
        if (allowDemoSignIn && code === "000000") {
          const member = memberSchema.parse({
            id: state.member?.id || `member_${Date.now()}`,
            displayName: displayName?.trim() || state.member?.displayName || normalised.split("@")[0],
            contact: normalised,
            homeUnitSlug: state.member?.homeUnitSlug ?? null,
            joinedAt: state.member?.joinedAt ?? new Date().toISOString(),
          });
          commit({
            ...state,
            token: "demo_token",
            member,
            pendingContact: null,
          });
          return member;
        }

        if (code !== "000000" && isApiClientError(err) && (err.isValidation || err.status === 400)) {
          throw new SocialError("invalid-code", "That code isn't right. Check it and try again.");
        }
        throw mapError(err, "Verification failed.");
      }
    },

    async signOut(): Promise<void> {
      if (state.token) {
        try {
          await client.post("/identity/auth/signout", {}, { token: state.token });
        } catch {
          // Ignore network errors on logout
        }
      }
      commit({ ...state, token: null, member: null });
    },

    async updateProfile(changes: Partial<Pick<Member, "displayName" | "homeUnitSlug">>): Promise<Member> {
      const current = requireMember();
      const updated = memberSchema.parse({ ...current, ...changes });

      if (state.token) {
        try {
          await client.patch("/identity/users/me", changes, { token: state.token });
        } catch (err) {
          throw mapError(err, "Could not update profile.");
        }
      }

      commit({ ...state, member: updated });
      return updated;
    },

    async getReactions(postId: string): Promise<ReactionSummary> {
      return summary(postId);
    },

    async setReaction(postId: string, kind: ReactionKind | null): Promise<ReactionSummary> {
      const member = requireMember();
      const byMember = { ...(state.reactions[postId] ?? {}) };
      if (kind) {
        byMember[member.id] = kind;
      } else {
        delete byMember[member.id];
      }
      commit({ ...state, reactions: { ...state.reactions, [postId]: byMember } });
      return summary(postId);
    },

    async listComments(postId: string): Promise<Comment[]> {
      return state.comments
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async addComment(postId: string, body: string, parentId: string | null = null): Promise<Comment> {
      const member = requireMember();
      if (parentId) {
        const parent = state.comments.find((c) => c.id === parentId);
        if (!parent) throw new SocialError("not-found", "That comment no longer exists.");
        parentId = parent.parentId ?? parent.id;
      }

      const parsed = commentSchema.safeParse({
        id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        postId,
        parentId,
        authorId: member.id,
        authorName: member.displayName,
        body,
        createdAt: new Date().toISOString(),
        editedAt: null,
      });

      if (!parsed.success) {
        throw new SocialError("validation", "Comments must be between 1 and 2,000 characters.");
      }

      commit({ ...state, comments: [...state.comments, parsed.data] });
      return parsed.data;
    },

    async editComment(commentId: string, body: string): Promise<Comment> {
      const member = requireMember();
      const existing = state.comments.find((c) => c.id === commentId);
      if (!existing) throw new SocialError("not-found", "That comment no longer exists.");
      if (existing.authorId !== member.id)
        throw new SocialError("forbidden", "You can only edit your own comments.");

      const parsed = commentSchema.safeParse({ ...existing, body, editedAt: new Date().toISOString() });
      if (!parsed.success) {
        throw new SocialError("validation", "Comments must be between 1 and 2,000 characters.");
      }

      commit({ ...state, comments: state.comments.map((c) => (c.id === commentId ? parsed.data : c)) });
      return parsed.data;
    },

    async deleteComment(commentId: string): Promise<void> {
      const member = requireMember();
      const existing = state.comments.find((c) => c.id === commentId);
      if (!existing) return;
      if (existing.authorId !== member.id)
        throw new SocialError("forbidden", "You can only delete your own comments.");

      commit({
        ...state,
        comments: state.comments.filter((c) => c.id !== commentId && c.parentId !== commentId),
      });
    },

    async report(): Promise<void> {
      requireMember();
    },

    async listFollowing(): Promise<string[]> {
      return state.member ? state.following : [];
    },

    async setFollowing(unitSlug: string, following: boolean): Promise<void> {
      requireMember();
      const next = following
        ? [...new Set([...state.following, unitSlug])]
        : state.following.filter((s) => s !== unitSlug);
      commit({ ...state, following: next });
    },

    async listSaved(): Promise<string[]> {
      return state.member ? state.saved : [];
    },

    async setSaved(postId: string, saved: boolean): Promise<void> {
      requireMember();
      const next = saved ? [...new Set([postId, ...state.saved])] : state.saved.filter((s) => s !== postId);
      commit({ ...state, saved: next });
    },

    async getRsvp(eventSlug: string): Promise<RsvpStatus | null> {
      return state.member ? (state.rsvps[eventSlug] ?? null) : null;
    },

    async setRsvp(eventSlug: string, status: RsvpStatus | null): Promise<void> {
      requireMember();
      const rsvps = { ...state.rsvps };
      if (status) rsvps[eventSlug] = status;
      else delete rsvps[eventSlug];
      commit({ ...state, rsvps });
    },

    async submitPrayerRequest(input: { name?: string; contact?: string; request: string }): Promise<void> {
      const text = input.request.trim();
      if (text.length < 3 || text.length > 4000) {
        throw new SocialError("validation", "Please write your request (up to 4,000 characters).");
      }

      if (!allowDemoSignIn) {
        throw new SocialError("unavailable", "Online prayer requests are coming soon.");
      }

      const email = input.contact?.includes("@") ? input.contact.trim() : null;
      const phoneNumber =
        !input.contact?.includes("@") && input.contact?.trim() ? input.contact.trim() : null;

      try {
        await client.post("/public/prayer-requests", {
          name: input.name?.trim() || "Anonymous",
          email,
          phoneNumber,
          request: text,
          isAnonymous: !input.name?.trim(),
          shareOnPrayerWall: true,
        });
      } catch (err) {
        // In local development without backend running, fallback gracefully
        if (isApiClientError(err) && err.isValidation) {
          throw mapError(err, "Please check your prayer request details.");
        }
      }
    },

    async subscribeToNewsletter(subscriber: { email: string; name?: string }): Promise<void> {
      const email = subscriber.email.trim().toLowerCase();
      if (!EMAIL.test(email)) {
        throw new SocialError("validation", "Please enter a valid email address.");
      }

      if (!allowDemoSignIn) {
        throw new SocialError("unavailable", "Newsletter sign-up opens soon.");
      }

      try {
        await client.post("/public/newsletter", {
          email,
          name: subscriber.name?.trim() || undefined,
        });
      } catch (err) {
        if (isApiClientError(err) && err.isValidation) {
          throw mapError(err, "Please enter a valid email address.");
        }
      }
    },

    async listNotifications(): Promise<Notification[]> {
      return state.member ? state.notifications : [];
    },

    async markNotificationsRead(ids?: string[]): Promise<void> {
      if (!state.member) return;
      const idSet = ids ? new Set(ids) : null;
      commit({
        ...state,
        notifications: state.notifications.map((n) => (!idSet || idSet.has(n.id) ? { ...n, read: true } : n)),
      });
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
