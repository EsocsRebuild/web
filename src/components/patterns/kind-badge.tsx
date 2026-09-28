import type { UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { cn } from "@/lib/utils";

/** The kind of a page as quiet text behind a dot in its colour; the dot carries the colour, the words stay readable. */
export function KindBadge({ kind, className }: { kind: UnitKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-2 rounded-full ring-2 ring-current/10"
        style={{ backgroundColor: UNIT_KIND[kind].colour }}
      />
      {UNIT_KIND[kind].label}
    </span>
  );
}
