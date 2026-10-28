"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SacredStreamCategory, SacredStreamItem } from "@/data/schema/stream";
import { cn } from "@/lib/utils";
import { StreamCard } from "./stream-card";

interface StreamViewportProps {
  initialItems: SacredStreamItem[];
}

export function StreamViewport({ initialItems }: StreamViewportProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<SacredStreamCategory | "all">("all");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);

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
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: [0.6],
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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [filteredItems.length],
  );

  // Keyboard navigation (ArrowUp, ArrowDown)
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, scrollToIndex]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#040814]">
      {/* 1. Header Filter Bar Floating Over the Stream */}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex flex-col items-center gap-2 px-4 md:top-20">
        <div className="pointer-events-auto scrollbar-none flex items-center gap-1.5 overflow-x-auto rounded-full border border-amber-500/30 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase transition-all",
              selectedCategory === "all"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white",
            )}
          >
            All Word
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("sermon-clip")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase transition-all",
              selectedCategory === "sermon-clip"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white",
            )}
          >
            Sermons
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("canticle-hymn")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase transition-all",
              selectedCategory === "canticle-hymn"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white",
            )}
          >
            Hymns
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("prophetic-word")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase transition-all",
              selectedCategory === "prophetic-word"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white",
            )}
          >
            Prophetic
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("testimony")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase transition-all",
              selectedCategory === "testimony"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white",
            )}
          >
            Testimonies
          </button>
        </div>

        {/* Live Fellowship Active Counter */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-0.5 text-[0.625rem] text-slate-300 shadow-lg backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-medium tracking-wide">
            Live Sanctuary Stream · Connected to Global Sanctuary Hub
          </span>
        </div>
      </div>

      {/* 2. Fullscreen Vertical Snap Stream */}
      <div
        ref={containerRef}
        className="scrollbar-none h-dvh w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth pt-24 pb-20 md:pt-28 md:pb-8"
        style={{ scrollSnapType: "y mandatory", overscrollBehaviorY: "contain" }}
      >
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            data-index={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="relative flex h-full w-full snap-start snap-always items-center justify-center py-2"
          >
            <StreamCard item={item} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      {/* 3. Desktop Vertical Scroll Assist Buttons */}
      <div className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          title="Previous Word (Up Arrow)"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-amber-500/30 bg-slate-950/80 text-amber-300 shadow-xl backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === filteredItems.length - 1}
          title="Next Word (Down Arrow)"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-amber-500/30 bg-slate-950/80 text-amber-300 shadow-xl backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}
