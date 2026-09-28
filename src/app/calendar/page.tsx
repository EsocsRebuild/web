import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { getContent } from "@/data/content";
import { EventRows } from "@/features/events/event-rows";
import { MonthGrid } from "@/features/events/month-grid";

export const metadata: Metadata = {
  title: "Church calendar",
  description: "Month by month: Lent, Holy Week, Easter, ESOCS Mother's and Father's Day, Christmas.",
};

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const raw = (await searchParams).month;
  const today = new Date().toISOString().slice(0, 10);
  const month = typeof raw === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : today.slice(0, 7);
  const lastDay = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0))
    .toISOString()
    .slice(0, 10);
  // Include observances that started earlier but are still running this month.
  const events = getContent().listEvents({ from: `${month}-01`, to: lastDay });

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-gutter py-10">
      <PageIntro
        eyebrow="Church calendar"
        title="Month by month"
        description="Dates are worked out from the church calendar rules."
      />
      <MonthGrid month={month} events={events} today={today} />
      <div className="md:hidden">
        {events.length ? (
          <EventRows events={events.filter((e) => e.date.startsWith(month) || e.endDate)} />
        ) : (
          <p className="text-muted-foreground">No observances this month.</p>
        )}
      </div>
    </div>
  );
}
