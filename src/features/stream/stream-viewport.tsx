"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react";
import type { SacredStreamCategory, SacredStreamItem } from "@/data/schema/stream";
import { cn } from "@/lib/utils";
import { StreamCard } from "./stream-card";

interface StreamViewportProps {
  initialItems: SacredStreamItem[];
}

const CATEGORY_TABS: Array<{ id: SacredStreamCategory | "all"; label: string }> = [
  { id: "all", label: "All Word" },
  { id: "sermon-clip", label: "Sermons" },
  { id: "canticle-hymn", label: "Hymns & Canticles" },
  { id: "prophetic-word", label: "Prophetic" },
  { id: "testimony", label: "Testimonies" },
];

export function StreamViewport({ initialItems }: StreamViewportProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<SacredStreamCategory | "all">("all");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(true);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);

  const filteredItems = React.useMemo(() => {
    if (selectedCategory === "all") return initialItems;
    return initialItems.filter((item) => item.category === selectedCategory);
  }, [initialItems, selectedCategory]);

  // Track active item with IntersectionObserver
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: [0.55],
      },
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredItems]);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= filteredItems.length) return;
      const target = cardRefs.current[index];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [filteredItems.length],
  );

  const handleBackToSanctuary = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Keyboard navigation (ArrowUp, ArrowDown, Escape, M)
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleBackToSanctuary();
      } else if (e.key.toLowerCase() === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, scrollToIndex, handleBackToSanctuary]);

  return (
    <div
      data-stream-viewport="true"
      className="relative h-dvh w-full overflow-hidden bg-[#040814] text-white select-none"
    >
      {/* 1. Dedicated Liturgical Cinema Top Bar (Clear Back Navigation & Unified Controls) */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 bg-linear-to-b from-[#040814]/95 via-[#040814]/80 to-transparent px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-4 backdrop-blur-md transition-all sm:px-6">
        {/* Left: Prominent, High-End Return to Sanctuary Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToSanctuary}
            aria-label="Return to Sanctuary Home"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-amber-400 hover:bg-slate-800 hover:text-amber-300 active:scale-95 sm:px-4 sm:py-2"
          >
            <ArrowLeft className="size-4 text-amber-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to Sanctuary</span>
            <span className="sm:hidden">Sanctuary</span>
          </button>

          <Link
            href="/"
            className="hidden items-center gap-2 border-l border-white/10 pl-3 transition-opacity hover:opacity-80 lg:flex"
            title="The Eternal Sacred Order of the Cherubim and Seraphim"
          >
            <div className="relative size-6 overflow-hidden rounded-full border border-amber-400/50 bg-black">
              <Image
                src="/brand/esocs-crest.png"
                alt="ESOCS Crest"
                width={24}
                height={24}
                className="size-full object-contain p-0.5"
              />
            </div>
            <span className="font-serif text-xs font-medium tracking-wider text-amber-200/90 uppercase">
              Sacred Stream
            </span>
          </Link>
        </div>

        {/* Center: Refined, Calm Category Selector Tabs */}
        <nav
          aria-label="Stream Categories"
          className="scrollbar-none flex max-w-[50vw] items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-slate-950/70 p-1 shadow-2xl backdrop-blur-xl sm:max-w-none"
        >
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-wider whitespace-nowrap uppercase transition-all duration-200 sm:text-xs",
                  isSelected
                    ? "bg-amber-400 font-bold text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Fellowship Indicator & Master Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* Subtle Live Sanctuary Fellowship Ember */}
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-[0.6875rem] text-slate-300 backdrop-blur-md xl:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-medium tracking-wide text-slate-200">Mount Zion Worldwide</span>
          </div>

          {/* Master Sound Button */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? "Unmute Audio (or press M)" : "Mute Audio (or press M)"}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
            className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-amber-400 hover:bg-slate-800 active:scale-95 sm:size-10"
          >
            {isMuted ? (
              <VolumeX className="size-4 text-slate-400" />
            ) : (
              <Volume2 className="size-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Fullscreen Vertical Snap Stream */}
      <main
        ref={containerRef}
        aria-label="Sacred Stream Feed"
        className="scrollbar-none h-dvh w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth pt-20 pb-4 md:pt-24 md:pb-6"
        style={{ scrollSnapType: "y mandatory", overscrollBehaviorY: "contain" }}
      >
        {filteredItems.map((item, index) => (
          <section
            key={item.id}
            data-index={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            aria-label={item.title}
            className="relative flex h-full w-full snap-start snap-always items-center justify-center px-0 py-1 sm:px-4 sm:py-2"
          >
            <StreamCard
              item={item}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
            />
          </section>
        ))}
      </main>

      {/* 3. Subtle Desktop Stream Progress Indicator & Smooth Navigation Cue */}
      <aside
        aria-label="Stream Progress"
        className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      >
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          title="Previous Ministry Clip (Up Arrow)"
          aria-label="Previous Word"
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-slate-300 shadow-xl backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-900 hover:text-amber-300 disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronUp className="size-4" />
        </button>

        <div className="flex flex-col items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2 py-3 backdrop-blur-md">
          <span className="font-mono text-[0.625rem] font-bold text-amber-300">{activeIndex + 1}</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="font-mono text-[0.625rem] text-slate-500">{filteredItems.length}</span>
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === filteredItems.length - 1}
          title="Next Ministry Clip (Down Arrow)"
          aria-label="Next Word"
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-slate-300 shadow-xl backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-900 hover:text-amber-300 disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronDown className="size-4" />
        </button>
      </aside>
    </div>
  );
}
