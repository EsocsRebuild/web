import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { ChurchEvent } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shiftMonth(month: string, by: number) {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 7);
}

/**
 * A month of the church calendar. Multi-day observances (Lent) shade every day
 * they cover. On phones the grid gives way to the list beneath it.
 */
export function MonthGrid({ month, events, today }: { month: string; events: ChurchEvent[]; today: string }) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= daysInMonth ? `${month}-${String(day).padStart(2, "0")}` : null;
  });

  const on = (iso: string) => events.filter((e) => e.date === iso);
  const within = (iso: string) => events.find((e) => e.endDate && e.date < iso && iso <= e.endDate);
  const title = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    first,
  );

  return (
    <section aria-labelledby="month-title" className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="month-title" className="font-display text-display-sm font-extrabold">
          {title}
        </h2>
        <div className="flex gap-2">
          <Link
            href={routes.calendar(shiftMonth(month, -1))}
            scroll={false}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Link
            href={routes.calendar(shiftMonth(month, 1))}
            scroll={false}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-panel border border-border bg-border md:block">
        <div role="row" className="grid grid-cols-7 gap-px">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              className="bg-surface-muted px-3 py-2 text-xs font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} aria-hidden className="min-h-28 bg-surface-muted/60" />;
            const dayEvents = on(iso);
            const span = within(iso);
            return (
              <div
                key={iso}
                className={cn(
                  "grid min-h-28 content-start gap-1 bg-surface p-2",
                  span && "bg-accent-soft/60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular",
                    iso === today && "bg-foreground text-background",
                  )}
                >
                  {Number(iso.slice(8))}
                </span>
                {dayEvents.map((e) => (
                  <Link
                    key={e.slug}
                    href={routes.event(e.slug)}
                    className="line-clamp-2 rounded-control bg-accent-soft px-1.5 py-1 text-xs leading-tight font-semibold text-accent-soft-foreground hover:underline"
                  >
                    {e.title}
                  </Link>
                ))}
                {span && !dayEvents.length && Number(iso.slice(8)) === 1 && (
                  <span className="text-[0.6875rem] text-muted-foreground">
                    {span.title.split(" · ")[1] ?? span.title} continues
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
