import Link from "next/link";
import * as React from "react";

import { railShortcuts } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { MyChurchShortcut } from "./my-church";

/**
 * Three-column page frame for feed-style pages. The left rail shows from 1280px,
 * the right rail from 1024px (it drops below the content on smaller screens).
 */
export function PageColumns({
  children,
  right,
  left = true,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  left?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-wide gap-8 px-gutter py-6 lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail-right)] lg:py-8",
        left && "xl:grid-cols-[var(--spacing-rail-left)_minmax(0,1fr)_var(--spacing-rail-right)]",
        className,
      )}
    >
      {left && <LeftRail />}
      <div className="min-w-0">{children}</div>
      {right && (
        <aside
          aria-label="More on this page"
          className="grid content-start gap-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start"
        >
          {right}
        </aside>
      )}
    </div>
  );
}

function LeftRail() {
  return (
    <nav
      aria-label="Shortcuts"
      className="hidden content-start gap-1 xl:sticky xl:top-[calc(var(--spacing-header)+1.5rem)] xl:grid xl:self-start"
    >
      <MyChurchShortcut />
      <p className="px-3 pt-4 pb-1 text-overline font-semibold text-subtle-foreground uppercase">Shortcuts</p>
      {railShortcuts.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <item.icon aria-hidden className="size-[1.125rem]" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

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
    <section className={cn("rounded-card border border-border bg-surface p-5", className)} aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
