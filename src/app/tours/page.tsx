import { Route } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Bridges } from "@/components/patterns/bridges";
import { PageIntro } from "@/components/patterns/page-intro";
import { EmptyState } from "@/components/patterns/states";
import { getContent } from "@/data/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Pastoral tours",
  description: "Where His Most Eminence has visited, dedicated and blessed, year by year.",
};

export default function ToursPage() {
  const content = getContent();
  const tours = content.listTours();

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Pastoral tours"
        title="The shepherd among his flock"
        description="Every house of prayer and headquarters His Most Eminence has dedicated, year by year, each linked to its church."
      />

      <EmptyState icon={Route} title="The next tour will appear here" compact>
        When the Baba Aladura&apos;s itinerary is announced, each stop will be listed with its date and
        church, so you can follow along.
      </EmptyState>

      <ol className="grid gap-4 sm:grid-cols-2">
        {tours.map((t, i) => {
          const places = [
            ...new Set(
              t.visits.map((v) => content.getUnit(v.unitSlug)?.locality?.split(",")[0]).filter(Boolean),
            ),
          ];
          return (
            <Reveal as="li" key={t.slug} delay={(i % 2) * 70}>
              <Link
                href={routes.tour(t.slug)}
                className="group/tour grid h-full gap-3 rounded-panel border border-border bg-surface p-6 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-lift"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-display-sm font-extrabold tabular">{t.year}</span>
                  <span className="text-sm font-semibold text-muted-foreground tabular">
                    {t.visits.length} {t.visits.length === 1 ? "visit" : "visits"}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatLongDate(t.visits[0].date)} to {formatLongDate(t.visits.at(-1)!.date)}
                </span>
                <span className="line-clamp-2 text-sm font-semibold group-hover/tour:text-highlight">
                  {places.join(" · ")}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>

      <Bridges
        items={[
          { href: routes.history(), eyebrow: "1925 → today", title: "The history of the Order" },
          { href: routes.events(), eyebrow: "What's coming", title: "Events" },
        ]}
      />
    </div>
  );
}
