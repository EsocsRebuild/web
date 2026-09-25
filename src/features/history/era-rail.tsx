"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface EraLink {
  id: string;
  label: string;
  years: string;
}

/**
 * Sticky chapter rail that tracks the era in view. On phones it becomes a
 * horizontal strip of chips under the header.
 */
export function EraRail({ eras }: { eras: EraLink[] }) {
  const [active, setActive] = React.useState(eras[0]?.id);

  React.useEffect(() => {
    const sections = eras.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [eras]);

  const activeIndex = eras.findIndex((e) => e.id === active);

  return (
    <nav aria-label="Eras" className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
      <ol className="-mx-gutter scrollbar-none flex gap-2 overflow-x-auto px-gutter lg:mx-0 lg:grid lg:gap-0 lg:overflow-visible lg:border-l lg:border-border lg:px-0">
        {eras.map((e, i) => (
          <li key={e.id} className="shrink-0">
            <a
              href={`#${e.id}`}
              aria-current={e.id === active ? "location" : undefined}
              className={cn(
                "relative flex flex-col rounded-pill border px-3 py-1.5 text-xs transition-colors lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5",
                e.id === active
                  ? "border-foreground bg-foreground text-background lg:border-highlight lg:bg-transparent lg:text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground lg:border-transparent",
                i < activeIndex && "lg:text-foreground/70",
              )}
            >
              <span className="font-semibold whitespace-nowrap lg:text-sm">{e.label}</span>
              <span className="hidden tabular lg:block">{e.years}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
