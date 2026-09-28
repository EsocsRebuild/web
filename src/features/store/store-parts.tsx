import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

import type { ProductCategory } from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { ORDER_STEPS, shelfTheme, type ShelfTheme } from "./store-theme";

/*
 * Product cards are never narrower than 17rem, so the longest name ("White altar
 * candles, pack of 12") sits on one line: each column count only starts once the
 * page has room for it (1 on phones, 2 from sm, 3 from lg, 4 from xl).
 */
export const SHELF_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/**
 * A short row of products (featured, related): a swipeable row on phones, then a
 * grid showing only as many as fill it whole: four, three, or two by two.
 */
export function ProductRow({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <ul
      aria-label={label}
      className="-mx-gutter scrollbar-none flex snap-x scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4 lg:[&>li:nth-child(n+4)]:hidden xl:[&>li:nth-child(n+4)]:block"
    >
      {children}
    </ul>
  );
}

export const productRowItem = "w-[17.5rem] shrink-0 snap-start sm:w-auto";

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
      <ol className={cn("grid gap-4", layout === "row" && "md:grid-cols-3 md:gap-6")}>
        {ORDER_STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold tabular",
                tone === "light" ? "bg-royal-900 text-gold-100" : "bg-gold-300 text-royal-950",
              )}
            >
              {i + 1}
            </span>
            <span className="grid gap-0.5 pt-1">
              <span className="text-sm font-bold whitespace-nowrap">{step.title}</span>
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
    { slug: null, name: "Everything", count: total },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: counts[c.slug] ?? 0,
    })),
  ];
  return (
    <nav
      aria-label="Store categories"
      className={cn("-mx-gutter scrollbar-none overflow-x-auto px-gutter", className)}
    >
      <ul className="flex snap-x gap-3 min-[88rem]:grid min-[88rem]:grid-cols-5">
        {items.map((c) => {
          const current = active !== undefined && c.slug === active;
          return (
            <li key={c.slug ?? "all"} className="w-[15.5rem] shrink-0 snap-start min-[88rem]:w-auto">
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
                  <span className="text-sm font-bold whitespace-nowrap">{c.name}</span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground">
                    {c.count} {c.count === 1 ? "item" : "items"}
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
