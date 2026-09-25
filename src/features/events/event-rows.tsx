import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { DateBadge } from "@/components/patterns/date-badge";
import type { ChurchEvent } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Events as rows grouped under month headings. */
export function EventRows({ events }: { events: ChurchEvent[] }) {
  const months = new Map<string, ChurchEvent[]>();
  for (const e of events) {
    const key = e.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), e]);
  }
  const monthName = (key: string) =>
    new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${key}-15T00:00:00Z`),
    );

  return (
    <div className="grid gap-8">
      {[...months].map(([key, list]) => (
        <section key={key} aria-labelledby={`month-${key}`} className="grid gap-3">
          <h3 id={`month-${key}`} className="text-overline font-semibold text-subtle-foreground uppercase">
            {monthName(key)}
          </h3>
          <ul className="grid gap-3">
            {list.map((e, i) => (
              <Reveal as="li" key={e.slug} delay={i * 40}>
                <Link
                  href={routes.event(e.slug)}
                  className="group/row flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-card"
                >
                  <DateBadge date={e.date} />
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="font-display text-lg leading-snug font-extrabold group-hover/row:text-highlight">
                      {e.title}
                    </span>
                    <span className="text-sm text-muted-foreground">{e.description}</span>
                    <span className="flex flex-wrap gap-2 text-xs">
                      {e.computed && (
                        <span className="rounded-pill bg-accent-soft px-2 py-0.5 font-semibold text-accent-soft-foreground">
                          Church calendar
                        </span>
                      )}
                      {e.endDate && (
                        <span className="text-muted-foreground">Until {formatLongDate(e.endDate)}</span>
                      )}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0 text-subtle-foreground transition-transform group-hover/row:translate-x-0.5"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
