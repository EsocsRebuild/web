import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Cover } from "@/components/patterns/cover";
import { SectionHeading } from "@/components/patterns/section-heading";
import { Button } from "@/components/ui/button";
import type { Organisation, Person, Unit } from "@/data/schema/content";
import { FollowButton } from "@/features/social/actions";
import { successionLabel } from "@/features/history/ordinal";
import { formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";
import { initials } from "@/lib/utils";

/** Women and Youth, each with its own story and a way in. */
export function SectionsFeature({ sections }: { sections: Unit[] }) {
  return (
    <section aria-labelledby="family-heading" className="grid gap-6">
      <SectionHeading
        id="family-heading"
        eyebrow="Our church family"
        title="Every generation has a place"
        href={routes.sections()}
        linkLabel="All sections"
      />
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((s, i) => (
          <Reveal key={s.slug} delay={i * 80}>
            <article className="group/section relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-panel text-white">
              <Cover
                image={s.cover}
                kind={s.kind}
                className="absolute inset-0 -z-10 transition-transform duration-700 group-hover/section:scale-[1.03]"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/25 to-transparent"
              />
              <div className="grid gap-3 p-6 sm:p-8">
                <p className="text-overline font-semibold text-white/80 uppercase">{s.tagline}</p>
                <h3 className="font-display text-display-sm font-extrabold">
                  <Link href={routes.unit(s.slug)} className="after:absolute after:inset-0">
                    {s.name}
                  </Link>
                </h3>
                {s.about[0] && (
                  <p className="line-clamp-2 max-w-md text-sm leading-6 text-white/85">{s.about[0]}</p>
                )}
                <div className="relative z-10 mt-1 flex items-center gap-3">
                  <FollowButton slug={s.slug} name={s.name} size="sm" tone="inverse" />
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    Explore <ArrowRight aria-hidden className="size-4" />
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** 1925 → today, as a line of the leaders who carried the Order. */
export function HistoryTeaser({ people }: { people: Person[] }) {
  return (
    <section aria-labelledby="history-heading" className="grid gap-6">
      <SectionHeading
        id="history-heading"
        eyebrow="1925 → today"
        title={`A century carried by ${people.length} shepherds`}
        description="From Saint Moses Orimolade Tunolase to His Most Eminence today."
        href={routes.history()}
        linkLabel="Read the history"
      />
      <ol className="-mx-gutter scrollbar-none flex snap-x gap-4 overflow-x-auto px-gutter pb-2">
        {people.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={i * 50} className="w-40 shrink-0 snap-start">
            <Link href={routes.leader(p.slug)} className="group/leader grid gap-2">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-card bg-surface-sunken">
                {p.portrait ? (
                  <Image
                    src={p.portrait.url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover object-top grayscale-[35%] transition-[filter,transform] duration-500 group-hover/leader:scale-[1.03] group-hover/leader:grayscale-0"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-display text-3xl font-extrabold text-muted-foreground"
                  >
                    {initials(p.name)}
                  </span>
                )}
                <span className="absolute top-2 left-2 rounded-pill bg-black/60 px-2 py-0.5 text-[0.6875rem] font-bold text-white tabular">
                  {successionLabel(p.order)}
                </span>
              </span>
              <span className="text-sm leading-snug font-semibold group-hover/leader:text-highlight">
                {p.name}
              </span>
              <span className="text-xs text-muted-foreground tabular">{formatTenure(p.tenure)}</span>
            </Link>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/** Seeds of Love: the church's own appeal. */
export function GiveAppeal({ appeal }: { appeal: Organisation["givingAppeal"] }) {
  return (
    <section
      aria-labelledby="give-heading"
      className="dark relative isolate overflow-hidden rounded-panel bg-inverse text-foreground"
    >
      {appeal.image && (
        <Image
          src={appeal.image.url}
          alt=""
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="-z-20 object-cover opacity-40"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-inverse via-inverse/85 to-inverse/30"
      />
      <div className="grid max-w-2xl gap-4 p-8 sm:p-12">
        <p className="text-overline font-semibold text-highlight uppercase">Give</p>
        <h2 id="give-heading" className="font-display text-display-md font-extrabold">
          {appeal.title}
        </h2>
        <p className="text-lg leading-8 text-muted-foreground">{appeal.body}</p>
        <div>
          <Button asChild size="lg" variant="accent">
            <Link href={routes.give()}>Plant a seed of love</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
