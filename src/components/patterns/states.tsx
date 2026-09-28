import { CloudOff, type LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Nothing here yet. The copy tells the story of what will appear and offers a
 * next step, rather than an apologetic blank.
 */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-border-strong text-center",
        compact ? "gap-2 px-5 py-6" : "gap-3 px-6 py-12",
        className,
      )}
    >
      {Icon && (
        <span className="mb-1 inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
          <Icon aria-hidden className="size-6" />
        </span>
      )}
      <p className={cn("font-display font-bold text-balance", compact ? "text-base" : "text-lg")}>{title}</p>
      {children && <div className="max-w-md text-sm leading-6 text-muted-foreground">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this",
  children = "Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  children?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-danger-soft px-6 py-10 text-center",
        className,
      )}
    >
      <CloudOff aria-hidden className="size-7 text-danger" />
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex h-10 cursor-pointer items-center rounded-control bg-foreground px-4 text-sm font-semibold text-background"
        >
          Try again
        </button>
      )}
    </div>
  );
}
