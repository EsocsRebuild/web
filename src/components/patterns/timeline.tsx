import Link from "next/link";
import * as React from "react";

import { Reveal } from "@/components/motion/reveal";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TimelineEntry {
  key: string;
  date: string | null;
  title: string;
  href?: string;
  meta?: React.ReactNode;
}

/** Dated entries on a rail, oldest first by default: history reads forwards. */
export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string }) {
  return (
    <ol className={cn("relative grid gap-5 border-l border-border pl-6", className)}>
      {entries.map((e, i) => (
        <Reveal as="li" key={e.key} delay={Math.min(i, 6) * 40} className="relative">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[1.8rem] size-2.5 rounded-full border-2 border-background bg-highlight ring-1 ring-border"
          />
          {e.date && (
            <time dateTime={e.date} className="text-xs font-semibold text-highlight tabular">
              {formatLongDate(e.date)}
            </time>
          )}
          <p className="mt-0.5 leading-snug font-semibold text-balance">
            {e.href ? (
              <Link href={e.href} className="hover:text-highlight hover:underline hover:underline-offset-4">
                {e.title}
              </Link>
            ) : (
              e.title
            )}
          </p>
          {e.meta && <div className="mt-1 text-sm text-muted-foreground">{e.meta}</div>}
        </Reveal>
      ))}
    </ol>
  );
}
