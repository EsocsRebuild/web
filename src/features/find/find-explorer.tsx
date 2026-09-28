"use client";

import { MapPin, Navigation, Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { KindBadge } from "@/components/patterns/kind-badge";
import { EmptyState } from "@/components/patterns/states";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { UnitKind } from "@/data/schema/content";
import { COUNTRY_NAME, FINDER_KINDS, UNIT_KIND } from "@/lib/kinds";
import { directionsUrl, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface FinderUnit {
  slug: string;
  name: string;
  kind: UnitKind;
  locality: string | null;
  address: string | null;
  country: string | null;
  parentName: string | null;
}

export interface FinderQuery {
  q: string;
  kind: UnitKind | null;
  country: string | null;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function filterUnits(units: FinderUnit[], { q, kind, country }: FinderQuery) {
  const terms = normalise(q).split(" ").filter(Boolean);
  return units.filter((u) => {
    if (kind && u.kind !== kind && !(kind === "province" && u.kind === "special-area")) return false;
    if (country && u.country !== country) return false;
    if (!terms.length) return true;
    const hay = normalise(
      [u.name, u.locality, u.address, u.parentName, u.country ? COUNTRY_NAME[u.country] : ""].join(" "),
    );
    return terms.every((t) => hay.includes(t));
  });
}

/** Search-as-you-type directory. Filters live in the URL, so any search can be shared. */
export function FindExplorer({ units, initial }: { units: FinderUnit[]; initial: FinderQuery }) {
  const [query, setQuery] = React.useState(initial);
  const deferred = React.useDeferredValue(query);
  const results = React.useMemo(() => filterUnits(units, deferred), [units, deferred]);

  // Mirror the filters into the address bar without a server round trip.
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.kind) params.set("kind", query.kind);
    if (query.country) params.set("country", query.country);
    const qs = params.toString();
    const id = window.setTimeout(
      () => window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname),
      250,
    );
    return () => window.clearTimeout(id);
  }, [query]);

  const kinds = FINDER_KINDS.filter((k) => k !== "special-area" && units.some((u) => u.kind === k));
  const countries = [...new Set(units.map((u) => u.country).filter((c): c is string => !!c))].sort((a, b) =>
    a === "NG" ? -1 : b === "NG" ? 1 : (COUNTRY_NAME[a] ?? a).localeCompare(COUNTRY_NAME[b] ?? b),
  );
  const chip =
    "inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-pill border px-4 text-sm font-semibold transition-colors";
  const on = "border-foreground bg-foreground text-background";
  const off = "border-border bg-surface text-muted-foreground hover:text-foreground";
  const shown = results.slice(0, 60);

  return (
    <div className="grid gap-6">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="find-q" className="sr-only">
          Town, province or church name
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-subtle-foreground"
        />
        <input
          id="find-q"
          type="search"
          autoComplete="off"
          value={query.q}
          onChange={(e) => setQuery((q) => ({ ...q, q: e.target.value }))}
          placeholder="Town, province or church name"
          className="h-14 w-full rounded-pill border border-input bg-surface pr-12 pl-14 text-lg shadow-card transition-[border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        {query.q && (
          <button
            type="button"
            onClick={() => setQuery((q) => ({ ...q, q: "" }))}
            className="absolute top-1/2 right-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <div className="grid gap-3">
        <div
          role="group"
          aria-label="Kind of page"
          className="-mx-gutter scrollbar-none flex gap-2 overflow-x-auto px-gutter sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            aria-pressed={!query.kind}
            onClick={() => setQuery((q) => ({ ...q, kind: null }))}
            className={cn(chip, !query.kind ? on : off)}
          >
            Everything
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={query.kind === k}
              onClick={() => setQuery((q) => ({ ...q, kind: q.kind === k ? null : k }))}
              className={cn(chip, query.kind === k ? on : off)}
            >
              {k === "province" ? "Provinces & special areas" : UNIT_KIND[k].plural}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Country"
          className="-mx-gutter scrollbar-none flex gap-2 overflow-x-auto px-gutter sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            aria-pressed={!query.country}
            onClick={() => setQuery((q) => ({ ...q, country: null }))}
            className={cn(chip, "min-h-9 text-xs", !query.country ? on : off)}
          >
            All countries
          </button>
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={query.country === c}
              onClick={() => setQuery((q) => ({ ...q, country: q.country === c ? null : c }))}
              className={cn(chip, "min-h-9 text-xs", query.country === c ? on : off)}
            >
              {COUNTRY_NAME[c] ?? c}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {results.length === 0
          ? "No matches"
          : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
        {results.length > shown.length &&
          `, showing the first ${shown.length}. Narrow your search to see more.`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query.q ? `No house of prayer matches “${query.q}”` : "Nothing matches these filters"}
        >
          Try a town or province name, or clear the filters. If a church is missing, tell the media team on{" "}
          <Link
            href={routes.contact()}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            the contact page
          </Link>
          .
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((u) => {
            const where = u.address ?? u.locality;
            return (
              <li
                key={u.slug}
                className="flex items-start gap-3.5 rounded-card border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-card"
              >
                <UnitAvatar name={u.name} kind={u.kind} size="md" />
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <Link
                    href={routes.unit(u.slug)}
                    className="leading-snug font-semibold text-balance hover:text-highlight"
                  >
                    {u.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <KindBadge kind={u.kind} />
                    {where && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden className="size-3.5" />
                        {where}
                      </span>
                    )}
                  </div>
                  {u.parentName && <span className="text-xs text-subtle-foreground">In {u.parentName}</span>}
                </div>
                {where && (u.kind === "branch" || u.kind === "district" || u.kind === "headquarters") && (
                  <a
                    href={directionsUrl(
                      [where, u.country ? COUNTRY_NAME[u.country] : ""].filter(Boolean).join(", "),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    aria-label={`Directions to ${u.name}`}
                  >
                    <Navigation className="size-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
