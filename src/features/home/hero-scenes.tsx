"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface HeroScene {
  id: string;
  image: string;
  /** A tiny blurred preview shown while the photograph loads. */
  placeholder?: string;
  alt: string;
  /** CSS object-position, to keep faces clear of the words. */
  focus: string;
  eyebrow: string;
  lead: string;
  accent: string;
  /** Scripture reference when the words are a verse (KJV). */
  cite?: string;
  body: string;
  cta: { label: string; href: string };
}

const SCENE_MS = 7000;
const SWIPE_PX = 50;

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const q = window.matchMedia("(prefers-reduced-motion: reduce)");
      q.addEventListener("change", onChange);
      return () => q.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Whether the page is visible and the element is on screen: the film only runs when someone can see it. */
function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = React.useState(true);
  const [pageVisible, setPageVisible] = React.useState(true);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && pageVisible;
}

/** Words rise into place one after another; they wait for the app splash on a first visit. */
function RisingWords({ text, start, className }: { text: string; start: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <span
            aria-hidden
            className={cn("hero-word inline-block animate-word-in will-change-transform", className)}
            style={{ "--d": `${start + i * 80}ms` } as React.CSSProperties}
          >
            {word}
          </span>
          {" "}
        </span>
      ))}
    </>
  );
}

/**
 * The opening of the platform: the church family in five scenes. Photographs
 * drift in and out like film and crossfade, each with its own words and way in.
 * It runs itself with no controls on screen: advancing on a timer, holding still
 * while a mouse rests on it, while someone uses it by keyboard, when the tab is
 * hidden or the hero is scrolled away, and not moving at all for reduced motion.
 * Swipe and the arrow keys move between scenes. Photos load just before their turn.
 */
export function HeroScenes({
  scenes,
  findHref,
  footer,
}: {
  scenes: HeroScene[];
  findHref: string;
  footer?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [index, setIndex] = React.useState(0);
  // Photos mounted so far: the first two up front, then each one ahead of its turn.
  const [mounted, setMounted] = React.useState<ReadonlySet<number>>(() => new Set([0, 1]));
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const touchX = React.useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const onScreen = useOnScreen(ref);
  const playing = !reduced && !hovered && !focused && onScreen;
  const count = scenes.length;
  const scene = scenes[index];

  const show = React.useCallback(
    (next: number, byUser = false) => {
      const i = (next + count) % count;
      setIndex(i);
      setMounted((m) => (m.has(i) && m.has((i + 1) % count) ? m : new Set([...m, i, (i + 1) % count])));
      if (byUser) setAnnounce(`${scenes[i].lead} ${scenes[i].accent}`);
    },
    [count, scenes],
  );

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => show(index + 1), SCENE_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, show]);

  return (
    <section
      ref={ref}
      data-overlay-hero
      aria-roledescription="carousel"
      aria-label="The church family"
      className="dark relative isolate flex h-[max(38rem,100svh)] min-h-[max(38rem,100svh)] w-full touch-pan-y flex-col overflow-hidden bg-inverse text-foreground"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") show(index + 1, true);
        if (e.key === "ArrowLeft") show(index - 1, true);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start === null || end === undefined || Math.abs(end - start) < SWIPE_PX) return;
        show(end < start ? index + 1 : index - 1, true);
      }}
    >
      {/* Photographs: stacked and crossfading; the active one drifts in or out. */}
      <div aria-hidden className="absolute inset-0 -z-30 h-full w-full">
        {scenes.map((s, i) =>
          mounted.has(i) ? (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-[var(--ease-standard)]",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                key={i === index ? `${s.id}-active-${index}` : s.id}
                src={s.image}
                alt=""
                fill
                placeholder={s.placeholder ? "blur" : "empty"}
                blurDataURL={s.placeholder}
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "low"}
                sizes="100vw"
                style={{ objectPosition: s.focus }}
                className={cn(
                  "object-cover",
                  i === index && !reduced && (i % 2 === 0 ? "animate-hero-zoom-in" : "animate-hero-zoom-out"),
                )}
              />
            </div>
          ) : null,
        )}
      </div>
      {/* The navy veil over the photographs: the hero's soft, hazy look. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-r from-inverse/95 via-inverse/70 to-inverse/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-t from-inverse via-inverse/10 to-inverse/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(40% 50% at 8% 92%, color-mix(in oklch, var(--color-gold-500) 26%, transparent), transparent 70%)",
        }}
      />

      {/* The words sit in the lower part of the frame, clear of the quick paths that overlap the hero's foot. */}
      <div className="parallax-exit mx-auto flex w-full max-w-wide flex-1 flex-col justify-end px-gutter pt-[calc(var(--spacing-header)+2rem)] pb-24 sm:pb-32 lg:pb-36">
        <div key={scene.id} className="grid max-w-2xl gap-4 sm:gap-5">
          <p
            className="hero-word animate-fade-in text-[0.6875rem] font-semibold tracking-[0.16em] text-highlight uppercase sm:text-overline sm:tracking-[0.2em]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {scene.eyebrow}
          </p>

          <h1
            aria-label={`${scene.lead} ${scene.accent}`}
            className="font-display text-[clamp(1.8rem,1.35rem+1.6vw,2.85rem)] leading-[1.05] font-extrabold tracking-[-0.026em] text-balance"
          >
            <RisingWords text={scene.lead} start={120} />
            <span className="block font-serif text-[1.04em] leading-[1.06] font-normal tracking-[-0.008em] italic">
              <RisingWords
                text={scene.accent}
                start={120 + scene.lead.split(" ").length * 80}
                className="bg-linear-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text pr-[0.06em] text-transparent"
              />
            </span>
          </h1>

          {scene.cite && (
            <p
              className="hero-word animate-rise-in font-serif text-[0.9375rem] text-foreground/70 italic sm:text-base"
              style={{ "--d": "600ms" } as React.CSSProperties}
            >
              {scene.cite} (KJV)
            </p>
          )}

          <p
            className="hero-word max-w-lg animate-rise-in text-[0.9375rem] leading-7 text-foreground/80 sm:text-base sm:leading-7"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            {scene.body}
          </p>

          <div
            className="hero-word mt-2 flex animate-rise-in flex-col gap-2.5 sm:flex-row sm:gap-3"
            style={{ "--d": "850ms" } as React.CSSProperties}
          >
            <Link
              href={findHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-gold-400 px-5 text-sm font-semibold text-royal-950 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-gold-300"
            >
              <MapPin aria-hidden className="size-4" /> Find a church near you
            </Link>
            <Link
              href={scene.cta.href}
              className="group/cta inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-white/30 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-royal-950"
            >
              {scene.cta.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover/cta:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {footer}
    </section>
  );
}
