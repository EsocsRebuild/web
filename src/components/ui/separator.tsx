import { cn } from "@/lib/utils";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  /** `ornament` centres a small cross between two rules. */
  variant?: "solid" | "ornament";
  className?: string;
}

export function Separator({ orientation = "horizontal", variant = "solid", className }: SeparatorProps) {
  if (orientation === "vertical") {
    return <span role="separator" aria-orientation="vertical" className={cn("w-px self-stretch bg-border", className)} />;
  }
  if (variant === "ornament") {
    return (
      <div role="separator" className={cn("flex items-center gap-4 text-highlight", className)}>
        <span className="h-px flex-1 bg-border" />
        <svg aria-hidden viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
          <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7z" />
        </svg>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }
  return <hr className={cn("h-px border-0 bg-border", className)} />;
}
