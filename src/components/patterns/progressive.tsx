"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

/**
 * Long lists arrive in batches. The next batch is added automatically as the
 * reader nears the end (well before they reach it, so they rarely wait); after a
 * few automatic batches it waits for a tap instead, so the footer stays reachable.
 * A "Show more" button is always there as well, for keyboards and slow connections.
 */
export function useAutoMore({
  onMore,
  enabled,
  autoLimit = 3,
  margin = "900px",
}: {
  /** Add the next batch. */
  onMore: () => void;
  /** False when there is nothing more, or a batch is on its way. */
  enabled: boolean;
  /** Automatic batches before it waits for a tap. */
  autoLimit?: number;
  /** How far ahead of the end to start. */
  margin?: string;
}) {
  const sentinel = React.useRef<HTMLDivElement>(null);
  const autoCount = React.useRef(0);
  const [paused, setPaused] = React.useState(false);
  const latest = React.useRef(onMore);
  React.useEffect(() => {
    latest.current = onMore;
  });

  React.useEffect(() => {
    const el = sentinel.current;
    if (!el || !enabled || paused) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        autoCount.current += 1;
        if (autoCount.current >= autoLimit) setPaused(true);
        latest.current();
      },
      { rootMargin: `0px 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, paused, autoLimit, margin]);

  return { sentinel };
}

/** The end of a progressive list: the invisible sentinel, the button and the announcement. */
export function MoreControl({
  sentinel,
  remaining,
  label,
  loading,
  onMore,
  announce,
}: {
  sentinel: React.RefObject<HTMLDivElement | null>;
  /** How many are left, when known. */
  remaining?: number;
  label: string;
  loading?: boolean;
  onMore: () => void;
  /** Read out to screen readers when a batch arrives, e.g. "24 more photos shown". */
  announce: string;
}) {
  return (
    <div className="grid justify-items-center gap-2">
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <Button variant="outline" size="lg" onClick={onMore} loading={loading}>
        {label}
        {remaining !== undefined && remaining > 0 && (
          <span className="text-muted-foreground tabular"> ({remaining} left)</span>
        )}
      </Button>
    </div>
  );
}
