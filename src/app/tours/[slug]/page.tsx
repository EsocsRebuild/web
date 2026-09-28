import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KindBadge } from "@/components/patterns/kind-badge";
import { getContent } from "@/data/content";
import { DateBadge } from "@/components/patterns/date-badge";
import { routes } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getContent()
    .listTours()
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const t = getContent().getTour((await params).slug);
  return t ? { title: t.title } : {};
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const content = getContent();
  const tours = content.listTours();
  const { slug } = await params;
  const i = tours.findIndex((t) => t.slug === slug);
  if (i < 0) notFound();
  const tour = tours[i];
  const newer = tours[i - 1];
  const older = tours[i + 1];

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-gutter py-10">
      <header className="grid gap-3">
        <Link
          href={routes.tours()}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" /> All tours
        </Link>
        <p className="text-overline font-semibold text-highlight uppercase">
          Pastoral visits · {tour.visits.length} stops
        </p>
        <h1 className="font-display text-display-lg font-extrabold">{tour.year}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Houses of prayer and headquarters dedicated by His Most Eminence, Baba Aladura Dr. D. D. L.
          Bob-Manuel, in {tour.year}.
        </p>
      </header>

      <ol className="relative grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-8 before:w-px before:bg-border">
        {tour.visits.map((v) => {
          const unit = content.getUnit(v.unitSlug);
          return (
            <li key={v.postId} className="relative flex gap-4">
              <DateBadge date={v.date} className="relative z-10" />
              <div className="grid flex-1 gap-2 rounded-card border border-border bg-surface p-4">
                <Link
                  href={routes.post(v.postId)}
                  className="leading-snug font-semibold hover:text-highlight"
                >
                  {v.summary}
                </Link>
                {unit && (
                  <Link
                    href={routes.unit(unit.slug)}
                    className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <KindBadge kind={unit.kind} />
                    {unit.name}
                    {unit.locality && ` · ${unit.locality}`}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <nav aria-label="Other years" className="grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
        {older ? (
          <Link
            href={routes.tour(older.slug)}
            className="grid gap-1 rounded-card border border-border p-5 hover:border-border-strong"
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ArrowLeft aria-hidden className="size-4" /> Earlier
            </span>
            <span className="font-display text-lg font-extrabold">{older.year}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            href={routes.tour(newer.slug)}
            className="grid gap-1 rounded-card border border-border p-5 text-right hover:border-border-strong"
          >
            <span className="inline-flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
              Later <ArrowRight aria-hidden className="size-4" />
            </span>
            <span className="font-display text-lg font-extrabold">{newer.year}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
