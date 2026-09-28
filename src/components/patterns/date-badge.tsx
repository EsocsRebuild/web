import { dateParts } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Calendar-leaf date: month over day, for events and dated lists. */
export function DateBadge({
  date,
  className,
  size = "md",
}: {
  date: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { day, month, weekday } = dateParts(`${date.slice(0, 10)}T12:00:00Z`);
  return (
    <span
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-control border border-border bg-surface text-center leading-none",
        size === "md" ? "size-16 gap-1" : "size-12 gap-0.5",
        className,
      )}
    >
      <span className="text-[0.6875rem] font-bold tracking-wider text-highlight">{month}</span>
      <span className={cn("font-display font-extrabold tabular", size === "md" ? "text-2xl" : "text-lg")}>
        {day}
      </span>
      {size === "md" && <span className="text-[0.625rem] text-muted-foreground">{weekday}</span>}
    </span>
  );
}
