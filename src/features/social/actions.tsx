"use client";

import {
  Bookmark,
  Check,
  HandHeart,
  Heart,
  Link2,
  Plus,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import type { ReactionKind, ReactionSummary, RsvpStatus } from "@/data/schema/social";
import { getSocial } from "@/data/social";
import { cn } from "@/lib/utils";

import { reportSocialError, useMemberAction, useSocial } from "./provider";

// --- Follow --------------------------------------------------------------------

export function FollowButton({
  slug,
  name,
  size = "md",
  className,
  tone = "default",
}: {
  slug: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
  tone?: "default" | "inverse";
}) {
  const { following } = useSocial();
  const run = useMemberAction();
  const [pending, setPending] = React.useState<boolean | null>(null);
  const isFollowing = pending ?? following.has(slug);

  const toggle = async () => {
    const next = !isFollowing;
    setPending(next);
    const ok = await run(`Sign in to follow ${name}.`, () => getSocial().setFollowing(slug, next));
    setPending(null);
    if (ok) toast.success(next ? `Following ${name}` : `Unfollowed ${name}`);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? (tone === "inverse" ? "overlay" : "secondary") : "accent"}
      aria-pressed={isFollowing}
      onClick={toggle}
      className={cn("min-w-28", className)}
      leftIcon={isFollowing ? <Check /> : <Plus />}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

// --- Share ---------------------------------------------------------------------

export function ShareButton({
  title,
  path,
  size = "md",
  variant = "outline",
  className,
  iconOnly,
}: {
  title: string;
  path: string;
  size?: "sm" | "md";
  variant?: "outline" | "ghost" | "overlay";
  className?: string;
  iconOnly?: boolean;
}) {
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar.");
    }
  };

  return iconOnly ? (
    <Button
      type="button"
      variant={variant}
      size={size === "sm" ? "icon-sm" : "icon"}
      onClick={share}
      aria-label={`Share ${title}`}
      className={className}
    >
      <Share2 />
    </Button>
  ) : (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={share}
      leftIcon={<Share2 />}
      className={className}
    >
      Share
    </Button>
  );
}

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      leftIcon={copied ? <Check /> : <Link2 />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Couldn't copy the link.");
        }
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

// --- Save ----------------------------------------------------------------------

export function SaveButton({
  postId,
  title,
  className,
}: {
  postId: string;
  title: string;
  className?: string;
}) {
  const { saved } = useSocial();
  const run = useMemberAction();
  const [pending, setPending] = React.useState<boolean | null>(null);
  const isSaved = pending ?? saved.has(postId);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove “${title}” from saved` : `Save “${title}”`}
      onClick={async () => {
        const next = !isSaved;
        setPending(next);
        const ok = await run("Sign in to save posts to read later.", () =>
          getSocial().setSaved(postId, next),
        );
        setPending(null);
        if (ok) toast.success(next ? "Saved" : "Removed from saved");
      }}
      className={cn(actionButton, isSaved && "text-highlight", className)}
    >
      <Bookmark aria-hidden className={cn("size-5", isSaved && "fill-current")} />
      <span className="sr-only sm:not-sr-only">{isSaved ? "Saved" : "Save"}</span>
    </button>
  );
}

// --- Reactions -----------------------------------------------------------------

const REACTIONS: { kind: ReactionKind; label: string; icon: LucideIcon }[] = [
  { kind: "amen", label: "Amen", icon: HandHeart },
  { kind: "love", label: "Love", icon: Heart },
  { kind: "praise", label: "Praise", icon: Sparkles },
];

export const actionButton =
  "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-control px-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-default";

function useReactions(postId: string) {
  const { member } = useSocial();
  const [summary, setSummary] = React.useState<ReactionSummary | null>(null);

  React.useEffect(() => {
    let active = true;
    getSocial()
      .getReactions(postId)
      .then((s) => active && setSummary(s))
      .catch(() => active && setSummary({ counts: { amen: 0, love: 0, praise: 0 }, mine: null }));
    return () => {
      active = false;
    };
  }, [postId, member]);

  return [summary, setSummary] as const;
}

/** Amen · Love · Praise. One per member; counts are only ever real reactions. */
export function ReactionBar({ postId, title }: { postId: string; title: string }) {
  const { member, requestSignIn } = useSocial();
  const [summary, setSummary] = useReactions(postId);
  const [popped, setPopped] = React.useState<ReactionKind | null>(null);

  const choose = async (kind: ReactionKind) => {
    if (!member) {
      requestSignIn("Sign in to respond to posts.");
      return;
    }
    if (!summary) return;
    const previous = summary;
    const next: ReactionKind | null = summary.mine === kind ? null : kind;
    const counts = { ...summary.counts };
    if (summary.mine) counts[summary.mine] -= 1;
    if (next) counts[next] += 1;
    setSummary({ counts, mine: next });
    if (next) setPopped(next);
    try {
      setSummary(await getSocial().setReaction(postId, next));
    } catch (error) {
      setSummary(previous);
      reportSocialError(error);
    }
  };

  return (
    <div role="group" aria-label={`Respond to “${title}”`} className="flex items-center gap-0.5">
      {REACTIONS.map(({ kind, label, icon: Icon }) => {
        const active = summary?.mine === kind;
        const count = summary?.counts[kind] ?? 0;
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={active}
            disabled={!summary}
            onClick={() => choose(kind)}
            className={cn(actionButton, active && "text-highlight")}
          >
            <Icon
              aria-hidden
              key={popped === kind ? `pop-${count}` : kind}
              className={cn(
                "size-5",
                active && "fill-current/20",
                popped === kind && active && "animate-pop",
              )}
            />
            <span>{label}</span>
            {count > 0 && <span className="text-xs tabular">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// --- RSVP ----------------------------------------------------------------------

export function RsvpControl({ eventSlug, title }: { eventSlug: string; title: string }) {
  const { member } = useSocial();
  const run = useMemberAction();
  const [status, setStatus] = React.useState<RsvpStatus | null>(null);

  React.useEffect(() => {
    let active = true;
    getSocial()
      .getRsvp(eventSlug)
      .then((s) => active && setStatus(s))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [eventSlug, member]);

  const set = async (next: RsvpStatus) => {
    const value = status === next ? null : next;
    const previous = status;
    if (member) setStatus(value);
    const ok = await run(`Sign in to tell us you're coming to ${title}.`, () =>
      getSocial().setRsvp(eventSlug, value),
    );
    if (!ok) setStatus(previous);
    else
      toast.success(
        value === "going"
          ? "You're going"
          : value === "interested"
            ? "Marked as interested"
            : "Response removed",
      );
  };

  return (
    <div role="group" aria-label={`Your response to ${title}`} className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant={status === "going" ? "primary" : "outline"}
        aria-pressed={status === "going"}
        onClick={() => set("going")}
        leftIcon={status === "going" ? <Check /> : undefined}
      >
        Going
      </Button>
      <Button
        type="button"
        variant={status === "interested" ? "primary" : "outline"}
        aria-pressed={status === "interested"}
        onClick={() => set("interested")}
        leftIcon={status === "interested" ? <Check /> : undefined}
      >
        Interested
      </Button>
    </div>
  );
}
