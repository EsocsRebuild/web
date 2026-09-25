"use client";

import { ArrowRight, MapPin, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface HeroScene {
  id: string;
  image: string;
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
 * It runs itself: advancing on a timer, pausing when the tab is hidden, the hero is
 * scrolled away or someone is using it by keyboard, and swiping on touch screens.
 * Photos load just before their turn. A small pause control remains (WCAG 2.2.2).
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
  const [userPaused, setUserPaused] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const touchX = React.useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const onScreen = useOnScreen(ref);
  const playing = !reduced && !userPaused && !focused && onScreen;
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
      className="dark relative isolate flex min-h-[max(38rem,100svh)] touch-pan-y flex-col overflow-hidden bg-inverse text-foreground"
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
      <div aria-hidden className="absolute inset-0 -z-30">
        {scenes.map((s, i) =>
          mounted.has(i) ? (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-standard)]",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                key={i === index ? `${s.id}-active-${index}` : s.id}
                src={s.image}
                alt=""
                fill
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

      <div className="mx-auto flex w-full max-w-wide flex-1 flex-col justify-center px-gutter pt-[calc(var(--spacing-header)+2rem)] pb-12">
        <div key={scene.id} className="grid max-w-3xl gap-5 sm:gap-6">
          <p
            className="hero-word animate-fade-in text-[0.6875rem] font-semibold tracking-[0.16em] text-highlight uppercase sm:text-overline sm:tracking-[0.2em]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {scene.eyebrow}
          </p>

          <h1
            aria-label={`${scene.lead} ${scene.accent}`}
            className="font-display text-[clamp(2.15rem,1.3rem+3.2vw,4.5rem)] leading-[1] font-extrabold tracking-[-0.03em] text-balance"
          >
            <RisingWords text={scene.lead} start={120} />
            <span className="block font-serif text-[1.08em] leading-[1.02] font-normal tracking-[-0.005em] italic">
              <RisingWords
                text={scene.accent}
                start={120 + scene.lead.split(" ").length * 80}
                className="bg-linear-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text pr-[0.06em] text-transparent"
              />
            </span>
          </h1>

          {scene.cite && (
            <p
              className="hero-word animate-rise-in font-serif text-base text-foreground/70 italic sm:text-lg"
              style={{ "--d": "600ms" } as React.CSSProperties}
            >
              {scene.cite} (KJV)
            </p>
          )}

          <p
            className="hero-word max-w-xl animate-rise-in text-[0.9375rem] leading-7 text-foreground/80 sm:text-lg sm:leading-8"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            {scene.body}
          </p>

          <div
            className="hero-word mt-1 flex animate-rise-in flex-col gap-3 sm:flex-row"
            style={{ "--d": "850ms" } as React.CSSProperties}
          >
            <Link
              href={findHref}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-pill bg-accent px-6 text-[0.9375rem] font-semibold text-accent-foreground transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-accent-hover sm:h-13 sm:px-7"
            >
              <MapPin aria-hidden className="size-[1.125rem]" /> Find a church near you
            </Link>
            <Link
              href={scene.cta.href}
              className="group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-pill border border-white/30 bg-white/5 px-6 text-[0.9375rem] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-royal-950 sm:h-13 sm:px-7"
            >
              {scene.cta.label}
              <ArrowRight
                aria-hidden
                className="size-[1.125rem] transition-transform group-hover/cta:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* The only control: pause, ringed by the scene's progress. */}
      {!reduced && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          className="absolute right-[max(var(--spacing-gutter),env(safe-area-inset-right))] bottom-[4.25rem] z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-white/85 backdrop-blur-md transition-colors hover:text-white"
          aria-label={userPaused ? "Play the scenes" : "Pause the scenes"}
        >
          <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <circle
              key={`${index}-${playing}`}
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="var(--color-gold-400)"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              className={playing ? "animate-scene-ring" : ""}
              style={
                {
                  "--scene-ms": `${SCENE_MS}ms`,
                  strokeDashoffset: playing ? undefined : 1,
                } as React.CSSProperties
              }
            />
          </svg>
          {userPaused ? <Play className="relative size-4" /> : <Pause className="relative size-4" />}
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {footer}
    </section>
  );
}
