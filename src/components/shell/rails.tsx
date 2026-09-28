import * as React from "react";

import { cn } from "@/lib/utils";

/** A titled card for the right rail. */
export function RailCard({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-panel border border-border bg-surface p-5", className)}
      aria-label={title}
    >
      <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
        <h2 className="font-display text-[0.9375rem] font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
