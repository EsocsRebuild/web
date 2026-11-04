"use client";

import * as React from "react";
import type { SynchronizedVerse } from "@/data/schema/stream";
import { cn } from "@/lib/utils";

interface HymnSyncedLyricsProps {
  verses: SynchronizedVerse[];
  currentTime: number;
  onSeek?: (timeSec: number) => void;
}

export function HymnSyncedLyrics({ verses, currentTime, onSeek }: HymnSyncedLyricsProps) {
  // Find current verse index
  const activeIndex = React.useMemo(() => {
    let active = 0;
    for (let i = 0; i < verses.length; i++) {
      if (currentTime >= verses[i].timeSec) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [verses, currentTime]);

  return (
    <div className="relative my-auto scrollbar-none flex max-h-[55vh] w-full flex-col items-center justify-center space-y-4 overflow-y-auto px-6 py-4 text-center select-none">
      {verses.map((verse, index) => {
        const isCurrent = index === activeIndex;
        return (
          <div
            key={index}
            onClick={() => onSeek?.(verse.timeSec)}
            className={cn(
              "group cursor-pointer rounded-2xl p-4 transition-all duration-300",
              isCurrent
                ? "scale-105 border border-amber-400/40 bg-amber-500/15 shadow-[0_0_24px_rgba(251,191,36,0.3)] backdrop-blur-md"
                : "scale-95 opacity-40 hover:opacity-75",
            )}
          >
            <p
              className={cn(
                "font-serif text-lg leading-relaxed transition-colors sm:text-2xl",
                isCurrent ? "font-bold text-amber-200" : "text-white",
              )}
            >
              {verse.text}
            </p>
            {verse.textYoruba && (
              <p
                className={cn(
                  "mt-1.5 font-sans text-sm tracking-wide italic transition-colors sm:text-base",
                  isCurrent ? "font-medium text-amber-300/90" : "text-slate-400",
                )}
              >
                {verse.textYoruba}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
