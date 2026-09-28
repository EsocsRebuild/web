"use client";

import * as React from "react";

import { Reveal } from "@/components/motion/reveal";
import { useAutoMore } from "@/components/patterns/progressive";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { loadFeedPage } from "./actions";
import { PostCard } from "./post-card";
import type { FeedItem, FeedPage } from "./types";

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Consecutive posts grouped under the month they belong to (the feed is newest first). */
function byMonth(items: FeedItem[]) {
  const groups: { key: string; label: string; items: FeedItem[] }[] = [];
  for (const item of items) {
    const key = item.post.date?.slice(0, 7) ?? "undated";
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else
      groups.push({
        key,
        label: item.post.date ? monthLabel.format(new Date(`${key}-15T00:00:00Z`)) : "Undated",
        items: [item],
      });
  }
  return groups;
}

/**
 * The feed as one sheet, a chronicle in months. The first page arrives server-rendered; "Show more" fetches the next page with
 * a server action and appends it. Album sizes are passed for the "+N" tile.
 * Give it a `key` per filter so a new filter starts from a fresh first page.
 */
export function FeedList({
  initial,
  kind,
  unitSlug,
  includeDescendants,
  excludeIds,
  albumSizes,
}: {
  initial: FeedPage;
  kind?: string | null;
  unitSlug?: string | null;
  includeDescendants?: boolean;
  excludeIds?: string[];
  albumSizes: Record<string, number>;
}) {
  const [items, setItems] = React.useState<FeedItem[]>(initial.items);
  const [cursor, setCursor] = React.useState(initial.nextCursor);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const [announce, setAnnounce] = React.useState("");
  // The next page loads by itself as the reader nears the end (a few times), with
  // the button always there too; a failure stops it until the reader tries again.
  const { sentinel } = useAutoMore({ onMore: () => void more(), enabled: !!cursor && !loading && !failed });

  const more = async () => {
    if (!cursor) return;
    setLoading(true);
    setFailed(false);
    try {
      const next = await loadFeedPage({ cursor, kind, unitSlug, includeDescendants, excludeIds });
      setItems((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor);
      setAnnounce(`${next.items.length} more posts loaded.`);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="overflow-clip rounded-panel border border-border bg-surface">
        {byMonth(items).map((group, g) => (
          <section key={group.key} aria-label={group.label}>
            <p className={cn("flex items-center gap-3 px-4 pt-5 sm:px-6", g > 0 && "pt-7")}>
              <span className="font-serif text-xl leading-none text-highlight italic">{group.label}</span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </p>
            <ol>
              {group.items.map((item) => (
                <Reveal as="li" key={item.post.id}>
                  <PostCard
                    threaded
                    item={item}
                    albumSize={item.post.gallerySlug ? albumSizes[item.post.gallerySlug] : undefined}
                  />
                </Reveal>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <div aria-live="polite" className="flex flex-col items-center gap-2">
        {failed && (
          <p className="text-sm text-danger">Couldn&apos;t load more posts. Check your connection.</p>
        )}
        {cursor ? (
          <Button variant="outline" size="lg" onClick={more} loading={loading}>
            {failed ? "Try again" : "Show more"}
          </Button>
        ) : (
          items.length > 5 && <p className="text-sm text-subtle-foreground">You&apos;re all caught up.</p>
        )}
      </div>
    </div>
  );
}
