"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { routes, type UnitTab } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface UnitTabLink {
  tab: UnitTab | null;
  label: string;
  count?: number;
}

/**
 * Route tabs: each tab is its own URL, so it is linkable and cached. The
 * indicator slides to the active tab; it jumps instead under reduced motion.
 */
export function UnitTabs({ slug, tabs }: { slug: string; tabs: UnitTabLink[] }) {
  const pathname = usePathname();
  const listRef = React.useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => (t.tab ? pathname === routes.unit(slug, t.tab) : pathname === routes.unit(slug))),
  );

  React.useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelectorAll<HTMLAnchorElement>("a")[activeIndex];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, tabs.length]);

  React.useEffect(() => {
    listRef.current
      ?.querySelectorAll("a")
      [activeIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  return (
    <nav
      aria-label="Page sections"
      className="relative -mx-gutter scrollbar-none overflow-x-auto px-gutter sm:mx-0 sm:px-0"
    >
      <ul ref={listRef} className="relative flex gap-1 border-b border-border">
        {tabs.map((t, i) => (
          <li key={t.tab ?? "posts"}>
            <Link
              href={routes.unit(slug, t.tab ?? undefined)}
              scroll={false}
              aria-current={i === activeIndex ? "page" : undefined}
              className={cn(
                "inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors sm:px-4",
                i === activeIndex ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-pill bg-surface-muted px-1.5 text-xs text-muted-foreground tabular">
                  {t.count}
                </span>
              )}
            </Link>
          </li>
        ))}
        {indicator && (
          <li
            aria-hidden
            className="absolute -bottom-px h-[3px] rounded-pill bg-highlight transition-[transform,width] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
            style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
          />
        )}
      </ul>
    </nav>
  );
}
