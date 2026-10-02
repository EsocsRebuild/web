"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import { Paragraphs } from "@/components/patterns/paragraphs";
import { ReadMore } from "@/components/patterns/read-more";
import type { ImageRef } from "@/data/schema/content";
import { FollowButton } from "@/features/social/actions";
import { cn } from "@/lib/utils";

export interface FamilyCard {
  key: string;
  title: string;
  eyebrow: string;
  body: string[];
  image: ImageRef | null;
  focus: string;
  link: { label: string; href: string };
  follow: { slug: string; name: string } | null;
}

/**
 * The generations as one row. The first cards are in view and the next one peeks
 * in at the edge, so it is plain there is more; people swipe (or scroll) through,
 * or use the arrows, and the dots show where they are and jump to a card.
 * Cards snap into place, keep a wide, short shape, and carry their words at the
 * foot of the photograph.
 */
export function FamilyCarousel({ cards }: { cards: FamilyCard[] }) {
  const track = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const [active, setActive] = React.useState(0);
  const [edges, setEdges] = React.useState({ start: true, end: false });

  // Where the reader is, from the scroll position itself (swipes included).
  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const items = [...(list.current?.children ?? [])] as HTMLElement[];
      if (!items.length) return;
      // Distance of each card from where snapping lines it up (the track's start padding).
      const start =
        el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
      const offsets = items.map((item) => Math.abs(item.getBoundingClientRect().left - start));
      const next = { start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 };
      // At the end the last card is in full view even though it cannot line up at the start.
      const nearest = next.end ? items.length - 1 : offsets.indexOf(Math.min(...offsets));
      setActive((a) => (a === nearest ? a : nearest));
      setEdges((e) => (e.start === next.start && e.end === next.end ? e : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTo = (i: number) => {
    const el = track.current;
    const clamped = Math.max(0, Math.min(i, cards.length - 1));
    const item = list.current?.children[clamped];
    if (!el || !item) return;
    setActive(clamped);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    el.scrollBy({ left: item.getBoundingClientRect().left - start, behavior: reduce ? "auto" : "smooth" });
  };

  /** The arrows move by one card's width, so they always move (even at the end, where
   * the last cards are in view together); snapping then lines the card up. */
  const step = (direction: 1 | -1) => {
    const el = track.current;
    const first = list.current?.children[0];
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(list.current!).columnGap || "0");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * (first.getBoundingClientRect().width + gap),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const arrow =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-default disabled:opacity-35";

  return (
    <div className="grid gap-4">
      <div
        ref={track}
        role="region"
        aria-label="Our church family, scroll for more"
        tabIndex={0}
        className="-mx-gutter scrollbar-none snap-x snap-mandatory scroll-px-gutter overflow-x-auto px-gutter pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <ul ref={list} className="flex gap-4 sm:gap-5">
          {cards.map((c, i) => {
            const inFocus = i === active;
            const actions = (
              <>
                {c.follow && (
                  <FollowButton slug={c.follow.slug} name={c.follow.name} size="sm" tone="inverse" />
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  {c.link.label}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover/family:translate-x-0.5"
                  />
                </span>
              </>
            );
            return (
              <li
                key={c.key}
                data-reveal=""
                className="flex shrink-0 basis-[86%] snap-start sm:basis-[64%] lg:basis-[calc(46%-0.625rem)]"
              >
                <article className="group/family relative isolate flex min-h-80 w-full flex-col justify-end overflow-hidden rounded-panel bg-royal-950 text-white">
                  {c.image && (
                    <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
                      <SmartImage
                        image={c.image}
                        fill
                        frame={{ width: 2, height: 1 }}
                        sizes="(min-width: 1024px) 46vw, (min-width: 640px) 64vw, 86vw"
                        style={{ objectPosition: c.focus }}
                        className={cn(
                          "object-cover transition-transform duration-700 group-hover/family:scale-[1.04]",
                          // The card in focus drifts slowly into its photograph.
                          inFocus && "animate-family-drift motion-reduce:animate-none",
                        )}
                      />
                    </div>
                  )}
                  {/* The hero's navy veil: darker at the foot and on the words' side. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-linear-to-r from-royal-950/80 via-royal-950/35 to-royal-950/5"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-linear-to-t from-royal-950/85 via-royal-950/15 to-royal-950/35"
                  />
                  {/* The words on frosted glass, rising into place each time the card comes into focus. */}
                  <div
                    className={cn(
                      "m-3 grid gap-1 rounded-card border border-white/15 bg-royal-950/30 p-4 shadow-[0_12px_40px_-16px_oklch(0.1_0.05_265/0.8)] backdrop-blur-md backdrop-saturate-150 sm:m-4 sm:gap-1.5 sm:p-5",
                      inFocus && "animate-rise-in motion-reduce:animate-none",
                    )}
                  >
                    <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-gold-300 uppercase sm:text-overline">
                      {c.eyebrow}
                    </p>
                    <h3 className="font-display text-xl font-extrabold sm:text-display-sm">
                      <Link href={c.link.href} className="after:absolute after:inset-0">
                        {c.title}
                      </Link>
                    </h3>
                    {/* Phones: just the way in. Wider screens add the description, opened with Read more. */}
                    <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 sm:hidden">
                      {actions}
                    </div>
                    <ReadMore
                      lines={2}
                      tone="inverse"
                      className="relative z-10 hidden max-w-lg gap-1 sm:grid"
                      contentClassName="text-sm leading-6 text-white/85"
                      trailing={actions}
                    >
                      <Paragraphs text={c.body} />
                    </ReadMore>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="group" aria-label="Choose a card">
          {cards.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${c.title}`}
              aria-current={i === active ? "true" : undefined}
              className="group/dot inline-flex size-6 cursor-pointer items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-1.5 rounded-pill transition-[width,background-color] duration-300",
                  i === active
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-border-strong group-hover/dot:bg-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        {/* On phones people swipe; the arrows join from tablets up, clear of the corner dock. */}
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            className={arrow}
            onClick={() => step(-1)}
            disabled={edges.start}
            aria-label="Previous"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            className={arrow}
            onClick={() => step(1)}
            disabled={edges.end}
            aria-label="Next"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
