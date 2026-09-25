"use client";

import * as React from "react";

import { toast } from "@/components/ui/toaster";
import { isSocialError } from "@/data/errors";
import type { Member, Notification } from "@/data/schema/social";
import { getSocial } from "@/data/social";

interface SocialContextValue {
  /** `undefined` while the session is loading, `null` when signed out. */
  member: Member | null | undefined;
  following: ReadonlySet<string>;
  saved: ReadonlySet<string>;
  notifications: Notification[];
  /** Opens the sign-in flow; resolves true once the person is signed in. */
  requestSignIn: (reason?: string) => void;
  signInReason: string | null;
  signInOpen: boolean;
  setSignInOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
}

const SocialContext = React.createContext<SocialContextValue | null>(null);

interface Snapshot {
  member: Member | null;
  following: string[];
  saved: string[];
  notifications: Notification[];
}

async function loadSnapshot(): Promise<Snapshot> {
  const social = getSocial();
  const [member, following, saved, notifications] = await Promise.all([
    social.getSession(),
    social.listFollowing(),
    social.listSaved(),
    social.listNotifications(),
  ]);
  return { member, following, saved, notifications };
}

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const social = getSocial();
  const [member, setMember] = React.useState<Member | null | undefined>(undefined);
  const [following, setFollowing] = React.useState<ReadonlySet<string>>(new Set());
  const [saved, setSaved] = React.useState<ReadonlySet<string>>(new Set());
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [signInOpen, setSignInOpen] = React.useState(false);
  const [signInReason, setSignInReason] = React.useState<string | null>(null);

  const apply = React.useCallback((snapshot: Snapshot) => {
    setMember(snapshot.member);
    setFollowing(new Set(snapshot.following));
    setSaved(new Set(snapshot.saved));
    setNotifications(snapshot.notifications);
  }, []);

  const refresh = React.useCallback(
    () => loadSnapshot().then(apply, () => setMember((m) => (m === undefined ? null : m))),
    [apply],
  );

  React.useEffect(() => {
    let active = true;
    const sync = () => {
      loadSnapshot().then(
        (snapshot) => active && apply(snapshot),
        () => active && setMember((m) => (m === undefined ? null : m)),
      );
    };
    sync();
    const unsubscribe = social.subscribe(sync);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [social, apply]);

  const requestSignIn = React.useCallback((reason?: string) => {
    setSignInReason(reason ?? null);
    setSignInOpen(true);
  }, []);

  const value = React.useMemo(
    () => ({
      member,
      following,
      saved,
      notifications,
      requestSignIn,
      signInReason,
      signInOpen,
      setSignInOpen,
      refresh,
    }),
    [member, following, saved, notifications, requestSignIn, signInReason, signInOpen, refresh],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = React.useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used inside <SocialProvider>");
  return ctx;
}

/** Shows the right message for a failed social action. */
export function reportSocialError(error: unknown, fallback = "That didn't work. Please try again.") {
  if (isSocialError(error)) toast.error(error.message);
  else toast.error(fallback);
}

/**
 * Wraps a member-only action: asks the person to sign in first, otherwise runs
 * it, reporting failures. Returns false when the action did not run or failed.
 */
export function useMemberAction() {
  const { member, requestSignIn } = useSocial();
  return React.useCallback(
    async (reason: string, action: () => Promise<unknown>) => {
      if (!member) {
        requestSignIn(reason);
        return false;
      }
      try {
        await action();
        return true;
      } catch (error) {
        reportSocialError(error);
        return false;
      }
    },
    [member, requestSignIn],
  );
}
