import { CalendarDays, CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { EmptyState } from "@/components/patterns/states";
import { Bridges } from "@/components/patterns/bridges";
import { Button } from "@/components/ui/button";
import { getContent } from "@/data/content";
import { EventRows } from "@/features/events/event-rows";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Events",
  description: "What's coming across the Order: church calendar observances and events.",
};

const plusDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export default function EventsPage() {
  const content = getContent();
  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = content.listEvents({ from: today, to: plusDays(today, 7) });
  const year = content.listEvents({ from: today, to: plusDays(today, 365) });

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
