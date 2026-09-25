import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Unit } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * "You are here" in the church: ESOCS › CMC 9 › Diobu Province › Diobu HQ.
 * The last crumb opens the page's siblings, so moving across is one tap.
 */
export function HierarchyTrail({
  ancestors,
  current,
  siblings = [],
  siblingsLabel,
  className,
  tone = "default",
}: {
  ancestors: Pick<Unit, "slug" | "name">[];
  current: Pick<Unit, "slug" | "name">;
  siblings?: Pick<Unit, "slug" | "name">[];
  siblingsLabel?: string;
  className?: string;
  tone?: "default" | "inverse";
}) {
  const muted =
    tone === "inverse" ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const others = siblings.filter((s) => s.slug !== current.slug);

  return (
    <nav aria-label="Where this page sits in the church" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
        {ancestors.map((a) => (
          <li key={a.slug} className="flex items-center gap-1">
            <Link
              href={routes.unit(a.slug)}
              className={cn("rounded-sm font-medium transition-colors", muted)}
            >
              {a.slug === "esocs" ? "ESOCS" : a.name}
            </Link>
            <ChevronRight aria-hidden className={cn("size-3.5 opacity-60", muted)} />
          </li>
        ))}
        <li className="flex items-center">
          {others.length ? (
            <Popover>
              <PopoverTrigger
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded-sm font-semibold",
                  tone === "inverse" ? "text-white" : "text-foreground",
                )}
              >
                <span aria-current="page">{current.name}</span>
                <ChevronDown aria-hidden className="size-3.5" />
                <span className="sr-only">, show {siblingsLabel ?? "related pages"}</span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <p className="px-2 pt-1 pb-2 text-overline font-semibold text-subtle-foreground uppercase">
                  {siblingsLabel ?? "Related pages"}
                </p>
                <ul className="grid max-h-72 overflow-y-auto">
                  {others.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={routes.unit(s.slug)}
                        className="block rounded-control px-2 py-2 text-sm hover:bg-surface-muted"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          ) : (
            <span
              aria-current="page"
              className={cn("font-semibold", tone === "inverse" ? "text-white" : "text-foreground")}
            >
              {current.name}
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
