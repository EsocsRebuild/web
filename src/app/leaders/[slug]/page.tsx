import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Timeline } from "@/components/patterns/timeline";
import { getContent } from "@/data/content";
import { successionLabel } from "@/features/history/ordinal";
import { ShareButton } from "@/features/social/actions";
import { formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";
import { initials } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return getContent()
    .listPeople()
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/leaders/[slug]">): Promise<Metadata> {
  const p = getContent().getPerson((await params).slug);
  return p ? { title: `${p.honorific} ${p.name}`, description: p.bio[0]?.slice(0, 180) } : {};
}

export default async function LeaderPage({ params }: PageProps<"/leaders/[slug]">) {
  const content = getContent();
  const people = content.listPeople();
  const { slug } = await params;
  const i = people.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const p = people[i];
  const prev = people[i - 1];
  const next = people[i + 1];
  const milestones = content
    .listPostsForUnit("esocs", { includeUndated: true })
    .filter((m) => m.personSlug === p.slug && m.kind === "milestone")
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));

  return (
    <article className="mx-auto grid max-w-6xl gap-12 px-gutter py-10">
      <header className="grid gap-8 md:grid-cols-[18rem_minmax(0,1fr)] md:items-end">
        <div className="relative aspect-[4/5] w-full max-w-72 overflow-hidden rounded-panel bg-surface-sunken shadow-lift">
          {p.portrait ? (
            <Image
              src={p.portrait.url}
              alt={p.portrait.alt}
              fill
              priority
              sizes="288px"
              className="object-cover object-top"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-display text-6xl font-extrabold text-muted-foreground"
            >
              {initials(p.name)}
            </span>
          )}
        </div>
        <div className="grid gap-3">
          <p className="text-overline font-semibold text-highlight uppercase">
            {successionLabel(p.order)} · <span className="tabular">{formatTenure(p.tenure)}</span>
          </p>
          <h1 className="font-display text-display-lg font-extrabold text-balance">
            {p.honorific} {p.name}
          </h1>
          <p className="text-lg text-muted-foreground">{p.designation}</p>
          <div>
            <ShareButton title={`${p.honorific} ${p.name}`} path={routes.leader(p.slug)} />
          </div>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid max-w-prose content-start gap-5 text-[1.125rem] leading-8 text-foreground/90">
          {p.bio.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        {milestones.length > 0 && (
          <aside
            aria-labelledby="tenure-heading"
            className="grid content-start gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start"
          >
            <h2 id="tenure-heading" className="font-display text-lg font-extrabold">
              In his years
            </h2>
            <Timeline
              entries={milestones.map((m) => ({
                key: m.id,
                date: m.date,
                title: m.title,
                href: routes.post(m.id),
              }))}
            />
          </aside>
        )}
      </div>

      <nav aria-label="The succession" className="grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={routes.leader(prev.slug)}
            className="group/prev grid gap-1 rounded-card border border-border p-5 hover:border-border-strong"
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ArrowLeft
                aria-hidden
                className="size-4 transition-transform group-hover/prev:-translate-x-0.5"
              />{" "}
              Before
            </span>
            <span className="font-display text-lg font-extrabold">{prev.name}</span>
            <span className="text-sm text-muted-foreground tabular">{formatTenure(prev.tenure)}</span>
          </Link>
        ) : (
          <Link
            href={routes.history()}
            className="grid gap-1 rounded-card border border-border p-5 hover:border-border-strong"
          >
            <span className="text-sm text-muted-foreground">Where it began</span>
            <span className="font-display text-lg font-extrabold">The history of the Order</span>
          </Link>
        )}
        {next ? (
          <Link
            href={routes.leader(next.slug)}
            className="group/next grid gap-1 rounded-card border border-border p-5 text-right hover:border-border-strong"
          >
            <span className="inline-flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
              After{" "}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover/next:translate-x-0.5"
              />
            </span>
            <span className="font-display text-lg font-extrabold">{next.name}</span>
            <span className="text-sm text-muted-foreground tabular">{formatTenure(next.tenure)}</span>
          </Link>
        ) : (
          <Link
            href={routes.unit("esocs")}
            className="grid gap-1 rounded-card border border-border p-5 text-right hover:border-border-strong"
          >
            <span className="text-sm text-muted-foreground">Today</span>
            <span className="font-display text-lg font-extrabold">Who we are</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
