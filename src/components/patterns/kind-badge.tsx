import type { UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { cn } from "@/lib/utils";

export function KindBadge({ kind, className }: { kind: UnitKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        color: `color-mix(in oklch, ${UNIT_KIND[kind].colour} 80%, var(--foreground))`,
        backgroundColor: `color-mix(in oklch, ${UNIT_KIND[kind].colour} 14%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: UNIT_KIND[kind].colour }}
      />
      {UNIT_KIND[kind].label}
    </span>
  );
}
