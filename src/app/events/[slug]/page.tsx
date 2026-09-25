import { CalendarDays, Landmark } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bridges } from "@/components/patterns/bridges";
import { DateBadge } from "@/components/patterns/date-badge";
import { RailCard } from "@/components/shell/rails";
import { getContent } from "@/data/content";
import { AddToCalendar } from "@/features/events/add-to-calendar";
import { EventRows } from "@/features/events/event-rows";
import { RsvpControl, ShareButton } from "@/features/social/actions";
import { formatDate, formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return getContent()
    .listEvents()
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = getContent().getEvent((await params).slug);
  return event
    ? { title: event.title, description: `${formatLongDate(event.date)}. ${event.description}` }
    : {};
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const content = getContent();
  const event = content.getEvent((await params).slug);
  if (!event) notFound();
  const host = content.getUnit(event.unitSlug)!;
  const related = content
    .listEvents({ from: event.date })
    .filter((e) => e.slug !== event.slug)
    .slice(0, 3);

  return (
    <article className="mx-auto grid max-w-5xl gap-10 px-gutter py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <DateBadge date={event.date} className="size-20 [&>span:nth-child(2)]:text-3xl" />
        <div className="grid gap-2">
          {event.computed && (
            <p className="text-overline font-semibold text-highlight uppercase">Church calendar</p>
          )}
          <h1 className="font-display text-display-md font-extrabold text-balance">{event.title}</h1>
          <p className="text-lg text-muted-foreground">
            {formatDate(`${event.date}T12:00:00Z`)}
            {event.endDate && ` to ${formatDate(`${event.endDate}T12:00:00Z`)}`}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-6">
          <p className="max-w-prose text-[1.0625rem] leading-8">{event.description}</p>
          {event.computed && (
            <p className="max-w-prose rounded-card bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
              This date is worked out from the church calendar. Your house of prayer will announce service
              times for the day.
            </p>
          )}
          <Link
            href={routes.unit(host.slug)}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold hover:text-highlight"
          >
            <Landmark aria-hidden className="size-4" /> Kept across{" "}
            {host.slug === "esocs" ? "the whole Order" : host.name}
          </Link>
        </div>
        <aside
          aria-label="Take part"
          className="grid content-start gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
        >
          <RailCard title="Will you be there?">
            <div className="grid gap-3">
              <RsvpControl eventSlug={event.slug} title={event.title} />
              <AddToCalendar
                fileName={event.slug}
                entry={{
                  uid: event.slug,
                  title: event.title,
                  description: event.description,
                  start: event.date,
                  end: event.endDate,
                  path: routes.event(event.slug),
                }}
              />
              <ShareButton title={event.title} path={routes.event(event.slug)} className="w-full" />
            </div>
          </RailCard>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="after-heading" className="grid gap-4">
          <h2 id="after-heading" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <CalendarDays aria-hidden className="size-5 text-highlight" /> After this
          </h2>
          <EventRows events={related} />
        </section>
      )}

      <Bridges
        items={[
          {
            href: routes.calendar(event.date.slice(0, 7)),
            eyebrow: "Church calendar",
            title: "See the whole month",
          },
          { href: routes.find(), eyebrow: "Near you", title: "Find a house of prayer" },
        ]}
      />
    </article>
  );
}
