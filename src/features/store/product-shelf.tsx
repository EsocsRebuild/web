"use client";

import * as React from "react";

import type { Product } from "@/data/schema/store";

import { ProductCard } from "./product-card";

const SORTS = {
  featured: {
    label: "Featured",
    compare: (a: Product, b: Product) => Number(b.featured) - Number(a.featured),
  },
  "price-asc": {
    label: "Price: low to high",
    compare: (a: Product, b: Product) => a.price.amount - b.price.amount,
  },
  "price-desc": {
    label: "Price: high to low",
    compare: (a: Product, b: Product) => b.price.amount - a.price.amount,
  },
  name: { label: "Name", compare: (a: Product, b: Product) => a.name.localeCompare(b.name) },
} as const;

type SortKey = keyof typeof SORTS;

/** The product grid with its count and sort. Sold-out items always sit at the end. */
export function ProductShelf({
  products,
  categoryNames,
}: {
  products: Product[];
  categoryNames: Record<string, string>;
}) {
  const [sort, setSort] = React.useState<SortKey>("featured");
  const sorted = React.useMemo(
    () =>
      products
        .map((p, i) => ({ p, i }))
        .sort(
          (a, b) =>
            Number(a.p.stock === "sold-out") - Number(b.p.stock === "sold-out") ||
            SORTS[sort].compare(a.p, b.p) ||
            a.i - b.i,
        )
        .map(({ p }) => p),
    [products, sort],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 cursor-pointer rounded-pill border border-input bg-surface pr-8 pl-4 text-sm font-semibold outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
          >
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p, i) => (
          <li key={p.slug}>
            <ProductCard product={p} category={categoryNames[p.categorySlug]} priority={i < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
