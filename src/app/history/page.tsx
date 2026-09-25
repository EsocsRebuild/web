import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Bridges } from "@/components/patterns/bridges";
import { PageIntro } from "@/components/patterns/page-intro";
import { Timeline } from "@/components/patterns/timeline";
import { getContent } from "@/data/content";
import { EraRail } from "@/features/history/era-rail";
import { successionLabel } from "@/features/history/ordinal";
import { formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "History",
  description: "The Eternal Sacred Order of the Cherubim & Seraphim from 1925 to today, era by era.",
};

export default function HistoryPage() {
  const content = getContent();
  const people = content.listPeople();
  const posts = content.listPostsForUnit("esocs", { includeUndated: true });

  return (
    <div className="mx-auto grid max-w-wide gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="1925 → today"
        title="A century, by God's endless mercies"
        description={`The story of the Holy Order told through the ${people.length} shepherds who have led it, from Saint Moses Orimolade Tunolase to His Most Eminence today.`}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <EraRail
          eras={people.map((p) => ({
            id: p.slug,
            label: p.name.split(" ").slice(-1)[0],
            years: formatTenure(p.tenure),
          }))}
        />

        <div className="grid gap-20">
          {people.map((p) => {
            const era = posts.filter((m) => m.personSlug === p.slug && m.kind === "milestone");
            const dedications = posts.filter((m) => m.personSlug === p.slug && m.kind === "dedication");
            return (
              <section
                key={p.slug}
                id={p.slug}
                aria-labelledby={`${p.slug}-name`}
                className="grid scroll-mt-28 gap-6"
              >
                <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-end">
                  <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-panel bg-surface-sunken md:w-full">
                    {p.portrait ? (
                      <Image
                        src={p.portrait.url}
                        alt={p.portrait.alt}
                        fill
                        sizes="200px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold text-muted-foreground"
                      >
                        {initials(p.name)}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <p className="text-overline font-semibold text-highlight uppercase">
                      {successionLabel(p.order)} · <span className="tabular">{formatTenure(p.tenure)}</span>
                    </p>
                    <h2
                      id={`${p.slug}-name`}
                      className="font-display text-display-sm font-extrabold text-balance"
                    >
                      {p.honorific} {p.name}
                    </h2>
                    <p className="text-muted-foreground">{p.designation}</p>
                  </div>
                </div>
                <div className="grid max-w-prose gap-4 text-[1.0625rem] leading-8 text-foreground/85">
                  {p.bio.slice(0, 2).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <Link
                  href={routes.leader(p.slug)}
                  className="inline-flex w-fit items-center gap-1.5 font-semibold text-highlight hover:underline"
                >
                  Read the full biography <ArrowRight aria-hidden className="size-4" />
                </Link>
                {era.length > 0 && (
                  <div className="grid gap-3">
                    <h3 className="text-overline font-semibold text-subtle-foreground uppercase">
                      In these years
                    </h3>
                    <Timeline
                      entries={[...era]
                        .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))
                        .map((m) => ({ key: m.id, date: m.date, title: m.title, href: routes.post(m.id) }))}
                    />
                  </div>
                )}
                {dedications.length > 0 && (
                  <Link
                    href={routes.tours()}
                    className="flex w-fit items-center gap-3 rounded-card bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-soft-foreground hover:underline"
                  >
                    {dedications.length} houses of prayer and headquarters dedicated. Follow the pastoral
                    visits
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <Bridges
        items={[
          { href: routes.leaders(), eyebrow: "The succession", title: "The Baba Aladuras" },
          { href: routes.unit("esocs"), eyebrow: "Today", title: "Who we are" },
          { href: routes.find(), eyebrow: "Near you", title: "Find a house of prayer" },
        ]}
      />
    </div>
  );
}
