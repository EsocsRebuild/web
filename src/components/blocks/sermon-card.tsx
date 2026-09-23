import { Play } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Media } from "@/components/ui/media";
import { formatDuration, formatShortDate } from "@/lib/format";

export interface SermonCardProps {
  title: string;
  href: string;
  speaker: string;
  date: Date | string;
  series?: string;
  scripture?: string;
  durationSeconds?: number;
  thumbnail?: string | null;
}

export function SermonCard({ title, href, speaker, date, series, scripture, durationSeconds, thumbnail }: SermonCardProps) {
  return (
    <Card variant="plain" className="h-full">
      <div className="relative">
        <Media src={thumbnail} alt="" aspect="aspect-video" zoomOnCardHover sizes="(min-width: 1024px) 30vw, 80vw" className="rounded-card" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-control bg-royal-950/80 px-2 py-1 text-xs font-semibold text-white">
          <Play aria-hidden className="size-3 fill-current" />
          {durationSeconds ? formatDuration(durationSeconds) : "Watch"}
        </span>
      </div>
      <div className="pt-5">
        {series && <p className="text-xs font-semibold text-highlight">{series}</p>}
        <h3 className="mt-0.5 text-lg leading-snug font-semibold tracking-tight">
          <Link href={href} className="after:absolute after:inset-0 hover:text-highlight">
            {title}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {speaker} · {formatShortDate(date)}
          {scripture && <> · {scripture}</>}
        </p>
      </div>
    </Card>
  );
}
