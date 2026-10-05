"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import type { ImageRef } from "@/data/schema/content";
import { FollowButton } from "@/features/social/actions";
import { cn } from "@/lib/utils";

import styles from "./home-architecture.module.scss";

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
 * The church family generations carousel.
 * Features cinematic ambient background image animations, solid ecclesiastical substrates,
 * and a smooth hover/focus content drawer that expands to reveal each generation's purpose.
 */
export function FamilyCarousel({ cards }: { cards: FamilyCard[] }) {
  const track = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const [active, setActive] = React.useState(0);
  const [edges, setEdges] = React.useState({ start: true, end: false });

  // Update active card from scroll position
  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const items = [...(list.current?.children ?? [])] as HTMLElement[];
      if (!items.length) return;
      const start =
        el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
      const offsets = items.map((item) => Math.abs(item.getBoundingClientRect().left - start));
      const next = { start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 };
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
    const item = list.current?.children[clamped] as HTMLElement | undefined;
    if (!el || !item) return;
    setActive(clamped);
    setEdges({
      start: clamped === 0,
      end: clamped === cards.length - 1,
    });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    el.scrollBy({ left: item.getBoundingClientRect().left - start, behavior: reduce ? "auto" : "smooth" });
  };

  const step = (direction: 1 | -1) => {
    goTo(active + direction);
  };

  return (
    <div className={cn("max-w-full min-w-0 overflow-hidden", styles.familyContainer)}>
      <div
        ref={track}
        role="region"
        aria-label="Our church family, scroll for more"
        tabIndex={0}
        className={cn("max-w-full min-w-0", styles.familyTrack)}
      >
        <ul ref={list} className={styles.familyList}>
          {cards.map((c, i) => {
            const inFocus = i === active;
            return (
              <li key={c.key} className={cn("min-w-0", styles.familyItem)}>
                <article
                  className={cn(
                    "relative isolate flex min-h-[25rem] w-full flex-col justify-end overflow-hidden sm:min-h-[28rem] lg:min-h-[30rem]",
                    styles.familyCard,
                  )}
                  data-active={inFocus ? "true" : undefined}
                  onClick={() => goTo(i)}
                >
                  {/* Cinematic Background Image Layer */}
                  {c.image && (
                    <div
                      aria-hidden
                      className={cn("absolute inset-0 -z-20 overflow-hidden", styles.familyImageWrap)}
                    >
                      <SmartImage
                        image={c.image}
                        fill
                        frame={{ width: 16, height: 11 }}
                        sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 46vw, (min-width: 640px) 65vw, 86vw"
                        style={{ objectPosition: c.focus }}
                        className={cn(styles.familyImage, inFocus && styles.familyImageDrifting)}
                      />
                    </div>
                  )}

                  {/* Ecclesiastical Sacred Veil & Ambient Gold Luminous Glow */}
                  <div
                    aria-hidden
                    className={cn("pointer-events-none absolute inset-0 -z-10", styles.familyVeil)}
                  />
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-0 bottom-0",
                      styles.familyLuminousGlow,
                    )}
                  />

                  {/* Solid Sanctuary Content Plinth */}
                  <div className={styles.familyPlinth}>
                    <div className={styles.familyEyebrowBadge}>
                      <Sparkles aria-hidden className="size-3 text-gold-400" />
                      <span>{c.eyebrow}</span>
                    </div>

                    <div className={styles.familyHeadingRow}>
                      <h3 className={styles.familyTitle}>
                        <Link href={c.link.href} onClick={(e) => e.stopPropagation()}>
                          {c.title}
                        </Link>
                      </h3>
                      <span className={styles.familyDiscoverHint} aria-hidden>
                        <span>Explore</span>
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>

                    {/* Smooth Reveal Content Drawer (On Hover / Focus-Within / Active) */}
                    <div className={styles.familyContentDrawer}>
                      {c.body.length > 0 && <p className={styles.familyBodyText}>{c.body.join(" ")}</p>}

                      <div className={styles.familyActionsRow}>
                        {c.follow && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <FollowButton
                              slug={c.follow.slug}
                              name={c.follow.name}
                              size="sm"
                              tone="inverse"
                            />
                          </div>
                        )}
                        <Link
                          href={c.link.href}
                          className={styles.familyPrimaryCta}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{c.link.label}</span>
                          <ArrowRight aria-hidden className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Navigation Controls: Dots & Step Buttons */}
      <div className={styles.familyNavRow}>
        <div className={styles.familyDots} role="group" aria-label="Choose a generation">
          {cards.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${c.title}`}
              aria-current={i === active ? "true" : undefined}
              className={styles.familyDotButton}
            >
              <span
                aria-hidden
                className={cn(
                  styles.familyDotIndicator,
                  i === active ? "w-6 bg-foreground" : "w-1.5 bg-border-strong hover:bg-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>

        <div className={styles.familyNavArrows}>
          <button
            type="button"
            className={styles.familyArrowButton}
            onClick={() => step(-1)}
            disabled={active <= 0 || edges.start}
            aria-label="Previous"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            className={styles.familyArrowButton}
            onClick={() => step(1)}
            disabled={active >= cards.length - 1 || edges.end}
            aria-label="Next"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
