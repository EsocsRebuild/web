"use client";

import { ChevronDown, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Unit } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Spatial Context Ribbon (HierarchyTrail):
 *
 * Provides physical spatial continuity as users navigate through the Sacred Order
 * (Holy Order -> Province -> District -> Parish). Keeps previous context tangible
 * and enables instant lateral switching between siblings with zero cognitive transit loss.
 */
export function HierarchyTrail({
  ancestors,
  current,
  siblings = [],
  siblingsLabel,
  className,
  tone = "default",
}: {
  ancestors: Pick<Unit, "slug" | "name">[];
  current: Pick<Unit, "slug" | "name">;
  siblings?: Pick<Unit, "slug" | "name">[];
  siblingsLabel?: string;
  className?: string;
  tone?: "default" | "inverse";
}) {
  const [filterQuery, setFilterQuery] = React.useState("");
  const isInverse = tone === "inverse";

  const others = siblings.filter((s) => s.slug !== current.slug);
  const filteredOthers = filterQuery.trim()
    ? others.filter((s) => s.name.toLowerCase().includes(filterQuery.toLowerCase()))
    : others;

  return (
    <nav
      aria-label="Where this page sits in the church"
      className={cn("scrollbar-none max-w-full min-w-0 overflow-x-auto", className)}
    >
      <ol
        className={cn(
          "inline-flex flex-wrap items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs shadow-xs transition-colors",
          isInverse
            ? "border-white/15 bg-white/10 text-white backdrop-blur-none"
            : "border-border bg-surface text-foreground",
        )}
      >
        <li className="flex items-center pr-1 text-muted-foreground">
          <Compass aria-hidden className="size-3.5 shrink-0 text-gold-500" />
        </li>

        {ancestors.map((a) => (
          <li key={a.slug} className="flex items-center gap-1.5">
            <Link
              href={routes.unit(a.slug)}
              className={cn(
                "rounded-pill px-2 py-0.5 font-medium transition-colors duration-150",
                isInverse
                  ? "text-white/80 hover:bg-white/15 hover:text-white"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {a.slug === "esocs" ? "ESOCS" : a.name}
            </Link>
            <ChevronRight
              aria-hidden
              className={cn("size-3 shrink-0", isInverse ? "text-white/40" : "text-muted-foreground/50")}
            />
          </li>
        ))}

        <li className="flex items-center">
          {others.length > 0 ? (
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-pill border px-2.5 py-0.5 font-bold transition-colors select-none",
                  isInverse
                    ? "border-white/20 bg-white/20 text-white hover:bg-white/30"
                    : "border-border bg-surface-muted text-foreground hover:bg-surface-sunken",
                )}
              >
                <span aria-hidden className="size-1.5 shrink-0 animate-pulse rounded-full bg-gold-500" />
                <span aria-current="page" className="max-w-[200px] break-words sm:max-w-[280px]">
                  {current.name}
                </span>
                <ChevronDown aria-hidden className="size-3 opacity-70" />
                <span className="sr-only">, show {siblingsLabel ?? "related units"}</span>
              </PopoverTrigger>
              <PopoverContent className="shadow-panel w-80 p-2.5" align="start">
                <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                  <p className="text-overline font-bold tracking-wider text-subtle-foreground uppercase">
                    {siblingsLabel ?? "Peer Units in this Jurisdiction"}
                  </p>
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground tabular">
                    {others.length} available
                  </span>
                </div>

                {others.length > 6 && (
                  <div className="mb-2 px-1">
                    <input
                      type="text"
                      placeholder="Quick filter peers…"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    />
                  </div>
                )}

                <ul className="scrollbar-none grid max-h-64 divide-y divide-border/40 overflow-y-auto">
                  {filteredOthers.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={routes.unit(s.slug)}
                        className="flex items-center justify-between rounded-control px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-muted"
                      >
                        <span className="break-words">{s.name}</span>
                        <ChevronRight aria-hidden className="size-3 shrink-0 text-muted-foreground/60" />
                      </Link>
                    </li>
                  ))}
                  {filteredOthers.length === 0 && (
                    <li className="p-3 text-center text-xs text-muted-foreground">
                      No matching units found.
                    </li>
                  )}
                </ul>
              </PopoverContent>
            </Popover>
          ) : (
            <span
              aria-current="page"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-bold",
                isInverse
                  ? "border-white/20 bg-white/20 text-white"
                  : "border-border bg-surface-muted text-foreground",
              )}
            >
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-gold-500" />
              <span className="max-w-[200px] break-words sm:max-w-[280px]">{current.name}</span>
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}

export const SpatialContextRibbon = HierarchyTrail;
