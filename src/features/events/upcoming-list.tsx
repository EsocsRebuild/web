import Link from "next/link";

import { DateBadge } from "@/components/patterns/date-badge";
import type { ChurchEvent } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function UpcomingList({ events, className }: { events: ChurchEvent[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {events.map((e) => (
        <li key={e.slug}>
          <Link href={routes.event(e.slug)} className="group/event flex items-center gap-3 rounded-control">
            <DateBadge date={e.date} size="sm" />
            <span className="grid min-w-0">
              <span className="truncate text-sm font-semibold group-hover/event:text-highlight">
                {e.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {e.endDate
                  ? `Until ${formatLongDate(e.endDate)}`
                  : e.computed
                    ? "Church calendar"
                    : formatLongDate(e.date)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
