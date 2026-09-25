import { Cake, Church, Images, Megaphone, MessageCircle, Newspaper, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { PostKind } from "@/data/schema/content";
import { ReactionBar, SaveButton, ShareButton, actionButton } from "@/features/social/actions";
import { formatLongDate, formatRelative } from "@/lib/format";
import { POST_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { PostMedia } from "./post-media";
import type { FeedItem } from "./types";

const KIND_ICON: Record<PostKind, LucideIcon> = {
  message: Megaphone,
  news: Newspaper,
  dedication: Church,
  album: Images,
  milestone: Cake,
};

/** Posts older than a month show a full date; newer ones read relatively ("3 days ago"). */
function when(date: string) {
  const age = Date.now() - Date.parse(`${date}T12:00:00Z`);
  return age < 30 * 86_400_000 ? formatRelative(`${date}T12:00:00Z`) : formatLongDate(date);
}

export function postHref(item: FeedItem) {
  return item.post.gallerySlug ? routes.album(item.post.gallerySlug) : routes.post(item.post.id);
}

/**
 * A post in any feed. Isomorphic: rendered on the server for the first page and
 * in the browser when "Show more" appends, so it imports no server-only code.
 */
export function PostCard({
  item,
  albumSize,
  className,
}: {
  item: FeedItem;
  albumSize?: number;
  className?: string;
}) {
  const { post, publisher, tagged } = item;
  const href = postHref(item);
  const Icon = KIND_ICON[post.kind];
  const excerpt = post.body.join(" ");

  return (
    <article
      aria-labelledby={`post-${post.id}`}
      className={cn(
        "grid gap-4 rounded-panel border border-border bg-surface p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <header className="flex items-center gap-3">
        <Link href={routes.unit(publisher.slug)} tabIndex={-1} aria-hidden>
          <UnitAvatar name={publisher.name} kind={publisher.kind} image={publisher.avatar} size="sm" />
        </Link>
        <div className="grid min-w-0 flex-1">
          <Link
            href={routes.unit(publisher.slug)}
            className="truncate text-sm font-semibold hover:underline hover:underline-offset-4"
          >
            {publisher.slug === "esocs" ? "ESOCS Worldwide" : publisher.name}
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon aria-hidden className="size-3.5" />
            {POST_KIND[post.kind].label}
            {post.date && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.date}>{when(post.date)}</time>
              </>
            )}
          </p>
        </div>
      </header>

      <div className="grid gap-2">
        <h3
          id={`post-${post.id}`}
          className="font-display text-lg leading-snug font-bold text-balance sm:text-xl"
        >
          <Link href={href} className="hover:text-highlight">
            {post.title}
          </Link>
        </h3>
        {excerpt && (
          <p className="line-clamp-3 text-[0.9375rem] leading-7 text-muted-foreground">{excerpt}</p>
        )}
      </div>

      {post.images.length > 0 && (
        <PostMedia images={post.images} href={href} total={albumSize} title={post.title} />
      )}

      {tagged.length > 0 && (
        <ul aria-label="Pages in this post" className="flex flex-wrap gap-2">
          {tagged.map((t) => (
            <li key={t.slug}>
              <Link
                href={routes.unit(t.slug)}
                className="inline-flex min-h-8 items-center gap-2 rounded-pill border border-border py-1 pr-3 pl-1 text-xs font-semibold hover:border-border-strong hover:bg-surface-muted"
              >
                <UnitAvatar
                  name={t.name}
                  kind={t.kind}
                  image={t.avatar}
                  size="xs"
                  className="rounded-pill!"
                />
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="-mx-1.5 -mb-1.5 flex flex-wrap items-center justify-between gap-1 border-t border-border pt-2">
        <ReactionBar postId={post.id} title={post.title} />
        <div className="flex items-center">
          {!post.gallerySlug && (
            <Link
              href={`${routes.post(post.id)}#comments-heading`}
              className={actionButton}
              aria-label={`Comments on “${post.title}”`}
            >
              <MessageCircle aria-hidden className="size-5" />
              <span className="sr-only sm:not-sr-only">Comment</span>
            </Link>
          )}
          <SaveButton postId={post.id} title={post.title} />
          <ShareButton title={post.title} path={href} variant="ghost" size="sm" iconOnly />
        </div>
      </footer>
    </article>
  );
}
