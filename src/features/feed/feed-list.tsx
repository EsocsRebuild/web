"use client";

import * as React from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

import { loadFeedPage } from "./actions";
import { PostCard } from "./post-card";
import type { FeedItem, FeedPage } from "./types";

/**
 * The first page arrives server-rendered; "Show more" fetches the next page with
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

  const more = async () => {
    if (!cursor) return;
    setLoading(true);
    setFailed(false);
    try {
      const next = await loadFeedPage({ cursor, kind, unitSlug, includeDescendants, excludeIds });
      setItems((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      <ol className="grid gap-5">
        {items.map((item, i) => (
          <Reveal as="li" key={item.post.id} delay={(i % 10) * 30}>
            <PostCard
              item={item}
              albumSize={item.post.gallerySlug ? albumSizes[item.post.gallerySlug] : undefined}
            />
          </Reveal>
        ))}
      </ol>
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
