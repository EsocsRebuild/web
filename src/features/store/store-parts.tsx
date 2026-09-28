import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

import type { ProductCategory } from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { ORDER_STEPS, shelfTheme, type ShelfTheme } from "./store-theme";

/** A shelf's icon on its own colours: the same swatch as its products' pictures. */
export function ShelfSwatch({ theme, className }: { theme: ShelfTheme; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex size-11 shrink-0 items-center justify-center rounded-card border", className)}
      style={{
        backgroundColor: theme.plate,
        backgroundImage: `radial-gradient(70% 70% at 50% 40%, ${theme.glow}, transparent 75%)`,
        borderColor: theme.ring,
        color: theme.ink,
      }}
    >
      <theme.icon className="size-5" strokeWidth={1.6} />
    </span>
  );
}

/**
 * How buying works, in three numbered steps. Said up front so nobody wonders what
 * happens after "Add to bag": there is no online payment, the store team calls.
 */
export function OrderSteps({
  tone = "light",
  layout = "row",
  className,
}: {
  tone?: "light" | "dark";
  layout?: "row" | "stack";
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`order-steps-${tone}-${layout}`}
      className={cn(
        "grid gap-4 rounded-panel border p-5",
        tone === "light" ? "border-border bg-surface-muted/60" : "border-white/10 bg-white/[0.04]",
        className,
      )}
    >
      <h2
        id={`order-steps-${tone}-${layout}`}
        className="text-overline font-semibold text-subtle-foreground uppercase"
      >
        How ordering works
      </h2>
      <ol className={cn("grid gap-4", layout === "row" && "sm:grid-cols-3 sm:gap-6")}>
        {ORDER_STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold tabular",
                tone === "light" ? "bg-royal-900 text-gold-100" : "bg-gold-300 text-royal-950",
              )}
            >
              {i + 1}
            </span>
            <span className="grid gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-bold">
                <step.icon aria-hidden className="size-4 text-highlight" />
                {step.title}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The store's shelves as big, labelled tiles: the shelf's own colours, its name,
 * what it's for and how many items it holds. "Everything" comes first.
 */
export function ShelfTiles({
  categories,
  counts,
  total,
  active,
  className,
}: {
  categories: ProductCategory[];
  counts: Record<string, number>;
  total: number;
  /** The shelf being shown; `null` is everything. `undefined` marks none as current. */
  active?: string | null;
  className?: string;
}) {
  const items = [
    { slug: null, name: "Everything", promise: "The whole store", count: total },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      promise: shelfTheme(c.slug).promise,
      count: counts[c.slug] ?? 0,
    })),
  ];
  return (
    <nav
      aria-label="Store categories"
      className={cn("-mx-gutter scrollbar-none overflow-x-auto px-gutter", className)}
    >
      <ul className="flex snap-x gap-3 lg:grid lg:grid-cols-5">
        {items.map((c) => {
          const current = active !== undefined && c.slug === active;
          return (
            <li key={c.slug ?? "all"} className="w-[13.5rem] shrink-0 snap-start lg:w-auto">
              <Link
                href={routes.store(c.slug ?? undefined)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group/shelf flex h-full items-center gap-3 rounded-panel border bg-surface p-3 pr-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5",
                  current
                    ? "border-foreground shadow-[inset_0_0_0_1px_var(--color-foreground)]"
                    : "border-border hover:border-border-strong",
                )}
              >
                {c.slug ? (
                  <ShelfSwatch theme={shelfTheme(c.slug)} />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-card border border-border bg-surface-muted text-foreground"
                  >
                    <LayoutGrid className="size-5" strokeWidth={1.6} />
                  </span>
                )}
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-bold">{c.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {c.count} {c.count === 1 ? "item" : "items"} · {c.promise}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A plain "see more" link with an arrow. */
export function MoreLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/more inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground hover:text-highlight",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover/more:translate-x-0.5" />
    </Link>
  );
}
