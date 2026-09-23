import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Media } from "@/components/ui/media";
import { dateParts, formatTime } from "@/lib/format";

export interface EventCardProps {
  title: string;
  href: string;
  start: Date | string;
  location?: string;
  category?: string;
  image?: string | null;
}

export function EventCard({ title, href, start, location, category, image }: EventCardProps) {
  const { day, month, weekday } = dateParts(start);
  const iso = new Date(start).toISOString();
  return (
    <Card variant="plain" className="h-full">
      <Media
        src={image}
        alt=""
        zoomOnCardHover
        sizes="(min-width: 1024px) 30vw, 80vw"
        className="rounded-card"
      />
      <div className="flex gap-4 pt-5">
        <time
          dateTime={iso}
          className="flex w-12 shrink-0 flex-col items-center border-r border-border pr-4 text-center"
        >
          <span className="text-xs font-semibold text-highlight">{month}</span>
          <span className="font-display text-3xl leading-none font-medium tabular-nums">{day}</span>
        </time>
        <div className="min-w-0">
          {category && <p className="text-xs font-semibold text-muted-foreground">{category}</p>}
          <h3 className="mt-0.5 text-lg leading-snug font-semibold tracking-tight">
            <Link href={href} className="after:absolute after:inset-0 hover:text-highlight">
              {title}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {weekday}, {formatTime(start)}
            {location && <> · {location}</>}
          </p>
        </div>
      </div>
    </Card>
  );
}
