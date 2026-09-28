import type { ContentRepository } from "@/data/repositories";
import { formatLongDate } from "@/lib/format";
import { POST_KIND, UNIT_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

export type SearchKind = "page" | "person" | "post" | "event";

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Extra words that should match (locality, parent, role). */
  keywords: string;
}

/** A compact index of everything findable, served as static JSON and loaded on demand. */
export function buildSearchIndex(content: ContentRepository): SearchEntry[] {
  const units = content.listUnits();
  const byslug = new Map(units.map((u) => [u.slug, u]));

  const pages: SearchEntry[] = units.map((u) => {
    const parent = u.parentSlug ? byslug.get(u.parentSlug) : null;
    return {
      kind: "page",
      title: u.name,
      subtitle: [UNIT_KIND[u.kind].label, u.locality, parent && parent.slug !== "esocs" ? parent.name : null]
        .filter(Boolean)
        .join(" · "),
      href: routes.unit(u.slug),
      keywords: [u.address, u.locality, parent?.name, ...u.leaders.map((l) => l.name)]
        .filter(Boolean)
        .join(" "),
    };
  });

  const people: SearchEntry[] = content.listPeople().map((p) => ({
    kind: "person",
    title: `${p.honorific} ${p.name}`,
    subtitle: `${p.designation} · ${p.tenure.from} – ${p.tenure.to ?? "present"}`,
    href: routes.leader(p.slug),
    keywords: "Baba Aladura",
  }));

  const posts: SearchEntry[] = content.getFeed({ limit: 1000 }).items.map((p) => ({
    kind: "post",
    title: p.title,
    subtitle: `${POST_KIND[p.kind].label}${p.date ? ` · ${formatLongDate(p.date)}` : ""}`,
    href: p.gallerySlug ? routes.album(p.gallerySlug) : routes.post(p.id),
    keywords: p.tags
      .map((t) => byslug.get(t)?.name)
      .filter(Boolean)
      .join(" "),
  }));

  const events: SearchEntry[] = content.listEvents().map((e) => ({
    kind: "event",
    title: e.title,
    subtitle: formatLongDate(e.date),
    href: routes.event(e.slug),
    keywords: e.description,
  }));

  return [...pages, ...people, ...posts, ...events];
}
