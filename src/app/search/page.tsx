import { CalendarDays, FileText, Landmark, SearchX, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/patterns/page-intro";
import { EmptyState } from "@/components/patterns/states";
import { getContent } from "@/data/content";
import { buildSearchIndex, type SearchKind } from "@/features/search/index-builder";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

const GROUPS: { kind: SearchKind; title: string; icon: typeof Landmark }[] = [
  { kind: "page", title: "Churches and pages", icon: Landmark },
  { kind: "person", title: "People", icon: UserRound },
  { kind: "post", title: "News and stories", icon: FileText },
  { kind: "event", title: "Events", icon: CalendarDays },
];

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const results = terms.length
    ? buildSearchIndex(getContent()).filter((e) => {
        const hay = norm(`${e.title} ${e.subtitle} ${e.keywords}`);
        return terms.every((t) => hay.includes(t));
      })
    : [];

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-gutter py-10">
      <PageIntro eyebrow="Search" title={q ? `Results for “${q}”` : "Search ESOCS"} />
      <form role="search" action="/search" className="flex gap-2">
        <label htmlFor="search-q" className="sr-only">
          Search
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Churches, people, news and events"
          className="h-12 flex-1 rounded-pill border border-input bg-surface px-5 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button
          type="submit"
          className="h-12 cursor-pointer rounded-pill bg-foreground px-6 font-semibold text-background"
        >
          Search
        </button>
      </form>

      {q && results.length === 0 && (
        <EmptyState icon={SearchX} title={`Nothing matches “${q}”`}>
          Try a town, a province, or part of a name.
        </EmptyState>
      )}

      {GROUPS.map(({ kind, title, icon: Icon }) => {
        const list = results.filter((r) => r.kind === kind);
        if (!list.length) return null;
        return (
          <section key={kind} aria-labelledby={`r-${kind}`} className="grid gap-3">
            <h2 id={`r-${kind}`} className="flex items-center gap-2 font-display text-lg font-extrabold">
              <Icon aria-hidden className="size-5 text-highlight" /> {title}
              <span className="text-sm font-semibold text-muted-foreground tabular">{list.length}</span>
            </h2>
            <ul className="grid divide-y divide-border rounded-card border border-border bg-surface">
              {list.slice(0, 30).map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="grid gap-0.5 px-5 py-3.5 hover:bg-surface-muted">
                    <span className="font-semibold">{r.title}</span>
                    {r.subtitle && <span className="text-sm text-muted-foreground">{r.subtitle}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
