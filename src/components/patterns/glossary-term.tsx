import Link from "next/link";
import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { glossaryEntry } from "@/config/glossary";
import { routes } from "@/lib/routes";

/** A church term with a dotted underline; tap or click for its meaning. */
export function GlossaryTerm({ id, children }: { id: string; children?: React.ReactNode }) {
  const entry = glossaryEntry(id);
  if (!entry) return <>{children}</>;
  return (
    <Popover>
      <PopoverTrigger className="cursor-help underline decoration-highlight decoration-dotted decoration-2 underline-offset-4">
        {children ?? entry.term}
      </PopoverTrigger>
      <PopoverContent className="grid gap-2">
        <p className="font-display font-extrabold">{entry.term}</p>
        <p className="leading-6 text-muted-foreground">{entry.text}</p>
        {!entry.confirmed && <p className="text-xs text-warning">Awaiting the church&apos;s definition.</p>}
        <Link
          href={routes.glossary(entry.id)}
          className="text-sm font-semibold text-highlight hover:underline"
        >
          All church terms
        </Link>
      </PopoverContent>
    </Popover>
  );
}
