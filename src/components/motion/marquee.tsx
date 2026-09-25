import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Continuous ticker. The track is rendered twice and slides by half its width,
 * so the loop is seamless at any screen size. Speed is set in pixels per second
 * via an estimate of the content length, so short and long tickers move alike.
 * Pauses on hover and keyboard focus; under reduced motion it becomes a static,
 * horizontally scrollable row. Screen readers get the list once.
 */
export function Marquee({
  items,
  label,
  pxPerSecond = 45,
  className,
  itemClassName,
  separator = <span aria-hidden className="mx-6 inline-block size-1 rounded-full bg-current opacity-40" />,
}: {
  items: React.ReactNode[];
  label: string;
  pxPerSecond?: number;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
}) {
  // ~8px per character is close enough to keep perceived speed consistent.
  const approxWidth = items.reduce<number>(
    (sum, item) => sum + (typeof item === "string" ? item.length * 8 : 240) + 60,
    0,
  );
  const duration = Math.max(20, Math.round(approxWidth / pxPerSecond));

  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          {item}
          {separator}
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={label}
      className={cn(
        "group/marquee relative overflow-hidden mask-fade-x motion-reduce:scrollbar-none motion-reduce:overflow-x-auto",
        className,
      )}
    >
      <div
        className="flex w-max animate-marquee group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {track(false)}
        <div className="flex motion-reduce:hidden">{track(true)}</div>
      </div>
    </section>
  );
}
