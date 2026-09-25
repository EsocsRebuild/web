import { ArrowRight, CalendarHeart, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { LeaderCard, UnitCard } from "@/components/patterns/cards";
import { DateBadge } from "@/components/patterns/date-badge";
import { SectionHeading } from "@/components/patterns/section-heading";
import { Timeline } from "@/components/patterns/timeline";
import { getContent } from "@/data/content";
import type { Unit } from "@/data/schema/content";
import { formatLongDate, formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";

import { SECTION_STORY } from "./section-stories";

const prose = "grid max-w-prose gap-4 text-[1.0625rem] leading-8 text-foreground/85";

/** Who we are: identity, values, the shepherd, the worldwide network. */
export function HolyOrderOverview() {
  const content = getContent();
  const org = content.getOrganisation();
  const current = content.listPeople().at(-1)!;
  const message = content.getPost("message-new-year-2026");
  const counts = [
    { label: "Headquarters", kind: "headquarters" as const },
    { label: "CMCs", kind: "cmc" as const },
    { label: "Provinces & special areas", kind: ["province", "special-area"] as const },
    { label: "Directorates", kind: "directorate" as const },
  ].map((c) => ({ ...c, n: content.listUnits({ kind: [c.kind].flat() }).length }));

  return (
    <div className="grid gap-12">
      <section aria-labelledby="who-heading" className="grid gap-5">
        <SectionHeading
          id="who-heading"
          eyebrow="Who we are"
          title="A Pentecostal Order of prayer, since 1925"
        />
        <div className={prose}>
          <p>{org.summary}</p>
          <p>
            <strong className="text-foreground">Our vision:</strong> {org.vision}
          </p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="grid gap-5">
        <SectionHeading
          id="values-heading"
          eyebrow="Core values"
          title="FLOSH"
          description="The five values the Order lives by."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {org.coreValues.map((v, i) => (
            <Reveal
              as="li"
              key={v.letter}
              delay={i * 60}
              className="grid gap-1 rounded-card border border-border bg-surface p-4"
            >
              <span aria-hidden className="font-display text-5xl leading-none font-extrabold text-highlight">
                {v.letter}
              </span>
              <span className="font-semibold">{v.value}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="shepherd-heading"
        className="dark grid gap-5 overflow-hidden rounded-panel bg-inverse p-6 text-foreground sm:p-8"
      >
        <p className="text-overline font-semibold text-highlight uppercase">Baba Aladura &amp; Prelate</p>
        <h2 id="shepherd-heading" className="font-display text-display-sm font-extrabold">
          His Most Eminence, {current.honorific} {current.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          The {content.listPeople().length}th in the line from the founder · {formatTenure(current.tenure)}
        </p>
        {message && (
          <blockquote className="relative border-l-2 border-highlight pl-5 text-lg leading-8 text-foreground/90">
            <Quote aria-hidden className="absolute -top-1 -left-8 hidden size-5 text-highlight sm:block" />
            {message.body[0]}
          </blockquote>
        )}
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          {message && (
            <Link
              href={routes.post(message.id)}
              className="inline-flex items-center gap-1 text-highlight hover:underline"
            >
              Read the New Year message <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
          <Link href={routes.leader(current.slug)} className="inline-flex items-center gap-1 hover:underline">
            His biography <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="network-heading" className="grid gap-5">
        <SectionHeading
          id="network-heading"
          eyebrow="Worldwide"
          title="The network"
          href={routes.unit("esocs", "branches")}
          linkLabel="See every page"
        />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {counts.map((c) => (
            <li key={c.label}>
              <Link
                href={routes.find({ kind: [c.kind].flat()[0] })}
                className="grid gap-1 rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <span className="font-display text-3xl font-extrabold tabular">{c.n}</span>
                <span className="text-sm font-semibold">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Figures count the pages recorded on this site so far; the full directory of provinces and branches
          is being added.
        </p>
      </section>
    </div>
  );
}

/** Women and Youth: a hook, their calling, the people, their milestones, what's next. */
export function SectionOverview({ unit }: { unit: Unit }) {
  const content = getContent();
  const story = SECTION_STORY[unit.slug];
  const milestones = content
    .listPostsForUnit(unit.slug, { includeUndated: true })
    .filter((p) => p.kind === "milestone");
  const mothersDay =
    unit.slug === "women" ? content.listEvents().find((e) => e.slug.startsWith("mothers-day")) : null;

  return (
    <div className="grid gap-12">
      {story && (
        <Reveal as="figure" className="grid gap-3 rounded-panel bg-accent-soft p-6 sm:p-8">
          <Quote aria-hidden className="size-7 text-highlight" />
          <blockquote className="font-display text-display-sm leading-tight font-extrabold text-balance text-accent-soft-foreground">
            {story.hook}
          </blockquote>
          <figcaption className="text-sm font-semibold text-muted-foreground">{story.source}</figcaption>
        </Reveal>
      )}

      {mothersDay && (
        <Link
          href={routes.event(mothersDay.slug)}
          className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
        >
          <DateBadge date={mothersDay.date} />
          <span className="grid gap-0.5">
            <span className="text-overline font-semibold text-highlight uppercase">Next celebration</span>
            <span className="font-display text-lg font-extrabold">{mothersDay.title}</span>
            <span className="text-sm text-muted-foreground">
              {formatLongDate(mothersDay.date)} · the fourth Sunday after Ash Wednesday
            </span>
          </span>
          <CalendarHeart aria-hidden className="ml-auto hidden size-6 text-highlight sm:block" />
        </Link>
      )}

      <section aria-labelledby="calling-heading" className="grid gap-5">
        <SectionHeading id="calling-heading" eyebrow={unit.tagline ?? undefined} title="Our calling" />
        <div className={prose}>
          {unit.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {story && story.programmes.length > 0 && (
        <section aria-labelledby="programmes-heading" className="grid gap-5">
          <SectionHeading id="programmes-heading" title="Take part" />
          <ul className="grid gap-3 md:grid-cols-3">
            {story.programmes.map((p, i) => (
              <Reveal
                as="li"
                key={p.title}
                delay={i * 70}
                className="grid content-start gap-2 rounded-card border border-border bg-surface p-5"
              >
                <h3 className="font-display text-lg font-extrabold">{p.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {unit.leaders.length > 0 && (
        <section aria-labelledby="people-heading" className="grid gap-5">
          <SectionHeading
            id="people-heading"
            title={unit.slug === "women" ? "The Mothers who lead" : "Who leads"}
          />
          <ul className="grid gap-2 sm:grid-cols-2">
            {unit.leaders.map((l) => (
              <li key={l.name}>
                <LeaderCard leader={l} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {milestones.length > 0 && (
        <section aria-labelledby="milestones-heading" className="grid gap-5">
          <SectionHeading
            id="milestones-heading"
            title="Milestones"
            description="Moments that shaped this part of the church family."
          />
          <Timeline
            entries={[...milestones]
              .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))
              .map((m) => ({ key: m.id, date: m.date, title: m.title, href: routes.post(m.id) }))}
          />
        </section>
      )}
    </div>
  );
}

/** Provinces, CMCs, branches, HQs and directorates: their story before their feed. */
export function LocalOverview({ unit, childUnits }: { unit: Unit; childUnits: Unit[] }) {
  const content = getContent();
  const dedications = content
    .listPostsForUnit(unit.slug)
    .filter((p) => p.kind === "dedication")
    .sort((a, b) => a.date!.localeCompare(b.date!));
  const own = dedications.find((d) => d.tags[0] === unit.slug);

  return (
    <div className="grid gap-10">
      {(unit.about.length > 0 || own) && (
        <section aria-labelledby="story-heading" className="grid gap-4">
          <h2 id="story-heading" className="sr-only">
            About {unit.name}
          </h2>
          {own && (
            <Link
              href={routes.post(own.id)}
              className="group/ded flex items-start gap-4 rounded-card bg-accent-soft p-5"
            >
              <DateBadge date={own.date!} />
              <span className="grid gap-1">
                <span className="text-overline font-semibold text-highlight uppercase">Dedicated</span>
                <span className="font-semibold text-accent-soft-foreground group-hover/ded:underline">
                  {own.body[0]}
                </span>
              </span>
            </Link>
          )}
          {unit.about.length > 0 && unit.kind === "directorate" ? (
            <div className={prose}>
              {unit.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            unit.about.map((p, i) => (
              <p key={i} className="max-w-prose leading-7 text-muted-foreground">
                {p}
              </p>
            ))
          )}
        </section>
      )}

      {childUnits.length > 0 && (
        <section aria-labelledby="children-heading" className="grid gap-4">
          <SectionHeading
            id="children-heading"
            size="sm"
            title={unit.kind === "cmc" ? "Provinces in this CMC" : "Houses of prayer"}
            href={childUnits.length > 4 ? routes.unit(unit.slug, "branches") : undefined}
            linkLabel={`All ${childUnits.length}`}
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {childUnits.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <UnitCard unit={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {dedications.length > 1 && (
        <section aria-labelledby="dedications-heading" className="grid gap-4">
          <SectionHeading
            id="dedications-heading"
            size="sm"
            title="Dedications"
            description="Houses of prayer dedicated here, in order."
          />
          <Timeline
            entries={dedications.map((d) => ({
              key: d.id,
              date: d.date,
              title: d.title,
              href: routes.post(d.id),
            }))}
          />
        </section>
      )}

      {unit.kind === "headquarters" && unit.cover && (
        <div className="relative aspect-video overflow-hidden rounded-panel">
          <Image src={unit.cover.url} alt={unit.cover.alt} fill sizes="680px" className="object-cover" />
        </div>
      )}
    </div>
  );
}
