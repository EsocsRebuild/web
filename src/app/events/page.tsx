import { CalendarDays, CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { EmptyState } from "@/components/patterns/states";
import { Bridges } from "@/components/patterns/bridges";
import { Button } from "@/components/ui/button";
import { getContent } from "@/data/content";
import type { ChurchEvent } from "@/data/schema/content";
import { EventRows } from "@/features/events/event-rows";
import { apiClient } from "@/lib/api-client";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Events",
  description: "What's coming across the Order: church calendar observances and events.",
};

const plusDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export default async function EventsPage() {
  const content = getContent();
  const today = new Date().toISOString().slice(0, 10);
  let backendOccurrences: ChurchEvent[] = [];

  try {
    const res = await apiClient.get<
      Array<{
        id: string;
        eventId: string;
        title: string;
        type: string;
        startsAt: string;
        endsAt: string;
        status: string;
        location?: string | null;
      }>
    >("/public/events?days=365");
    if (Array.isArray(res.data)) {
      backendOccurrences = res.data.map((o) => ({
        slug: `event-${o.id}`,
        title: o.title,
        description: o.location ? `Location: ${o.location}` : "Church Event",
        date: o.startsAt.slice(0, 10),
        endDate: o.endsAt ? o.endsAt.slice(0, 10) : undefined,
        startTime: o.startsAt.length >= 16 ? o.startsAt.slice(11, 16) : null,
        kind: o.type.toLowerCase() === "service" ? ("service" as const) : ("programme" as const),
        unitSlug: "esocs",
        image: null,
        computed: false,
      }));
    }
  } catch {
    // Offline fallback
  }

  const rawCalendar = content.listEvents({ from: today, to: plusDays(today, 365) });
  const allEvents = [...rawCalendar, ...backendOccurrences].sort((a, b) => a.date.localeCompare(b.date));
  const thisWeek = allEvents.filter((e) => e.date <= plusDays(today, 7));
  const year = allEvents;

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Events"
        title="What's coming"
        description="The church calendar is worked out from the rules the Order keeps (Easter, Lent, ESOCS Mother's and Father's Day), so the dates are always right."
        actions={
          <Button asChild variant="outline" leftIcon={<CalendarRange />}>
            <Link href={routes.calendar()}>Month view</Link>
          </Button>
        }
      />

      <section aria-labelledby="week-heading" className="grid gap-4">
        <SectionHeading id="week-heading" title="This week" size="sm" />
        {thisWeek.length ? (
          <EventRows events={thisWeek} />
        ) : (
          <EmptyState compact icon={CalendarDays} title="Nothing this week">
            See what&apos;s coming in the church calendar below.
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="calendar-heading" className="grid gap-4">
        <SectionHeading
          id="calendar-heading"
          title="The next twelve months"
          size="sm"
          href={routes.calendar()}
          linkLabel="Month view"
        />
        <EventRows events={year} />
      </section>

      <Bridges
        items={[
          { href: routes.tours(), eyebrow: "The shepherd among his flock", title: "Pastoral tours" },
          { href: routes.find(), eyebrow: "Near you", title: "Find a house of prayer" },
        ]}
      />
    </div>
  );
}
