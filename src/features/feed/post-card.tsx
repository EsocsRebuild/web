import { MessageCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Paragraphs } from "@/components/patterns/paragraphs";
import { ReadMore } from "@/components/patterns/read-more";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { PostKind } from "@/data/schema/content";
import { ReactionBar, SaveButton, ShareButton, actionButton } from "@/features/social/actions";
import { formatLongDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { PostMedia } from "./post-media";
import type { FeedItem, UnitRef } from "./types";

/** What the page did, in the church's own voice. */
const VERB: Record<PostKind, string> = {
  message: "shared a message",
  news: "shared news",
  dedication: "recorded a dedication",
  album: "added photos",
  milestone: "marked a milestone",
};

/** Posts older than a month show a full date; newer ones read relatively ("3 days ago"). */
function when(date: string) {
  const age = Date.now() - Date.parse(`${date}T12:00:00Z`);
  return age < 30 * 86_400_000 ? formatRelative(`${date}T12:00:00Z`) : formatLongDate(date);
}

export function postHref(item: FeedItem) {
  return item.post.gallerySlug ? routes.album(item.post.gallerySlug) : routes.post(item.post.id);
}

const pageName = (u: UnitRef) => (u.slug === "esocs" ? "ESOCS Worldwide" : u.name);

/** "Women", "Women and Youth", "Women, Youth and CMC 9". */
function PageList({ units }: { units: UnitRef[] }) {
  return units.map((u, i) => (
    <React.Fragment key={u.slug}>
      {i > 0 && (i === units.length - 1 ? " and " : ", ")}
      <Link href={routes.unit(u.slug)} className="font-semibold hover:underline hover:underline-offset-4">
        {pageName(u)}
      </Link>
    </React.Fragment>
  ));
}

/**
 * A post as an entry in the Order's chronicle. It carries no box of its own: the
 * feed is one sheet, and on wider screens each entry hangs from the publisher's
 * seal on a thread that runs down the month. Isomorphic: rendered on the server
 * for the first page and in the browser when "Show more" appends.
 */
export function PostCard({
  item,
  albumSize,
  threaded = false,
  className,
}: {
  item: FeedItem;
  albumSize?: number;
  /** Draw the thread down to the next entry (inside a feed list). */
  threaded?: boolean;
  className?: string;
}) {
  const { post, publisher, tagged } = item;
  const href = postHref(item);
  const verb = post.kind === "album" && albumSize ? `added ${albumSize} photos` : VERB[post.kind];

  return (
    <article
      aria-labelledby={`post-${post.id}`}
      className={cn(
        "relative grid gap-x-4 px-4 py-5 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:px-6",
        className,
      )}
    >
      <div aria-hidden className="relative hidden sm:block">
        <Link href={routes.unit(publisher.slug)} tabIndex={-1} className="relative z-10 block">
          <UnitAvatar name={publisher.name} kind={publisher.kind} image={publisher.avatar} size="md" />
        </Link>
        {threaded && (
          <span className="absolute top-12 -bottom-6 left-1/2 w-px -translate-x-1/2 bg-border [li:last-child_&]:hidden" />
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3">
        <header className="flex items-center gap-3">
          <Link href={routes.unit(publisher.slug)} tabIndex={-1} aria-hidden className="sm:hidden">
            <UnitAvatar name={publisher.name} kind={publisher.kind} image={publisher.avatar} size="sm" />
          </Link>
          <p className="min-w-0 text-sm leading-6">
            <PageList units={[publisher]} />{" "}
            <span className="font-serif text-[1.0625rem] text-muted-foreground italic">{verb}</span>
            {tagged.length > 0 && (
              <>
                {" "}
                <span className="font-serif text-[1.0625rem] text-muted-foreground italic">with</span>{" "}
                <PageList units={tagged} />
              </>
            )}
            {post.date && (
              <span className="block text-xs text-muted-foreground">
                <time dateTime={post.date}>{when(post.date)}</time>
              </span>
            )}
          </p>
        </header>

        <div className="grid gap-1.5">
          <h3
            id={`post-${post.id}`}
            className="font-display text-lg leading-snug font-bold tracking-[-0.01em] text-balance sm:text-xl"
          >
            <Link href={href} className="transition-colors hover:text-accent">
              {post.title}
            </Link>
          </h3>
          {post.body.length > 0 && (
            <ReadMore lines={3} contentClassName="text-[0.9375rem] leading-7 text-muted-foreground">
              <Paragraphs text={post.body} />
            </ReadMore>
          )}
        </div>

        {post.images.length > 0 && (
          <PostMedia images={post.images} href={href} total={albumSize} title={post.title} />
        )}

        <footer className="@container/actions -mx-2 flex items-center justify-between gap-1">
          <ReactionBar postId={post.id} title={post.title} />
          <div className="flex items-center">
            {!post.gallerySlug && (
              <Link
                href={`${routes.post(post.id)}#comments-heading`}
                className={actionButton}
                aria-label={`Comments on “${post.title}”`}
              >
                <MessageCircle aria-hidden className="size-5" />
                <span className="@max-[30rem]/actions:sr-only">Comment</span>
              </Link>
            )}
            <SaveButton postId={post.id} title={post.title} />
            <ShareButton title={post.title} path={href} variant="ghost" size="sm" iconOnly />
          </div>
        </footer>
      </div>
    </article>
  );
}
