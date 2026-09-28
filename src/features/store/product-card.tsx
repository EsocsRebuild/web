import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Product, StockStatus } from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { formatMoney } from "./money";
import { ProductArt } from "./product-art";
import { shelfTheme } from "./store-theme";

const STOCK_LABEL: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Only a few left",
  "sold-out": "Sold out",
};

export function StockLabel({ stock, className }: { stock: StockStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap",
        stock === "in-stock" && "text-success",
        stock === "low-stock" && "text-warning",
        stock === "sold-out" && "text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STOCK_LABEL[stock]}
    </span>
  );
}

export function Price({
  product,
  size = "md",
}: {
  product: Pick<Product, "price" | "compareAt">;
  size?: "md" | "lg";
}) {
  return (
    <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
      <span className={cn("font-display font-bold tabular", size === "lg" ? "text-2xl" : "text-base")}>
        {formatMoney(product.price)}
      </span>
      {product.compareAt && (
        <span className="text-sm text-muted-foreground tabular line-through">
          <span className="sr-only">Was </span>
          {formatMoney(product.compareAt)}
        </span>
      )}
    </span>
  );
}

/**
 * A product on the shelf, built to be understood at a glance: its picture in its
 * shelf's colours, which shelf it is from, its name, one line about it, its price,
 * and a plain "View" that says the card opens. The whole card is the link, and the
 * link's name is the product's name alone.
 */
export function ProductCard({
  product,
  category,
  priority,
  className,
}: {
  product: Product;
  /** The shelf's name, e.g. "Garments". */
  category?: string;
  priority?: boolean;
  className?: string;
}) {
  const soldOut = product.stock === "sold-out";
  const theme = shelfTheme(product.categorySlug);
  return (
    <article
      className={cn(
        "group/product @container relative flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <ProductArt
          product={product}
          priority={priority}
          className={cn(
            "aspect-[5/4] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/product:scale-[1.04]",
            soldOut && "opacity-60 grayscale",
          )}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {product.badge ? (
            <span className="rounded-pill bg-background/90 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide whitespace-nowrap text-foreground uppercase shadow-sm backdrop-blur">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
          {product.stock !== "in-stock" && (
            <StockLabel
              stock={product.stock}
              className="rounded-pill bg-background/90 px-2.5 py-1 text-[0.6875rem] whitespace-nowrap shadow-sm backdrop-blur"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <p className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-muted-foreground">
            <theme.icon aria-hidden className="size-3.5 text-highlight" />
            {category}
          </p>
        )}
        <h3 className="font-display text-[0.9375rem] leading-snug font-bold @min-[18rem]:text-base">
          <Link
            href={routes.product(product.slug)}
            className="outline-none group-hover/product:text-accent after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-sm leading-6 text-pretty text-muted-foreground">{product.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Price product={product} />
          <span
            aria-hidden
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-pill bg-surface-muted pr-2.5 pl-3.5 text-xs font-bold whitespace-nowrap text-foreground transition-colors group-hover/product:bg-accent group-hover/product:text-accent-foreground"
          >
            {soldOut ? "See item" : "View"}
            <ArrowRight className="size-3.5 transition-transform group-hover/product:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
