"use client";

import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { EmptyState } from "@/components/patterns/states";
import { Button } from "@/components/ui/button";
import { lineKey, priceBag } from "@/data/pricing";
import type { Product } from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { bag, useBagLines, useHydrated } from "./bag-store";
import { formatMoney } from "./money";
import { ProductArt } from "./product-art";
import { QuantityStepper } from "./quantity-stepper";

/** Fulfilment is arranged with the member after ordering, so no fee is invented here. */
export function OrderSummary({
  subtotal,
  count,
  children,
  className,
}: {
  subtotal: string;
  count: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="summary-heading"
      className={cn("grid gap-4 rounded-panel border border-border bg-surface p-5 sm:p-6", className)}
    >
      <h2 id="summary-heading" className="font-display text-lg font-bold">
        Order summary
      </h2>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Items ({count})</dt>
          <dd className="font-semibold tabular">{subtotal}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Collection or delivery</dt>
          <dd className="text-right text-muted-foreground">Confirmed with you</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt className="font-semibold">Subtotal</dt>
          <dd className="font-display text-xl font-bold tabular">{subtotal}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}

export function BagLoading() {
  return (
    <div role="status" aria-label="Loading your bag" className="grid gap-3">
      {[0, 1].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-panel bg-surface-muted" />
      ))}
    </div>
  );
}

/** The bag: every line priced against the current catalogue, editable in place. */
export function BagView({ catalogue }: { catalogue: Product[] }) {
  const lines = useBagLines();
  const hydrated = useHydrated();
  const bySlug = React.useMemo(() => new Map(catalogue.map((p) => [p.slug, p])), [catalogue]);
  const priced = priceBag(lines, bySlug);
  const hasUnavailable = priced.lines.some((l) => !l.available);

  if (!hydrated) return <BagLoading />;

  if (!priced.lines.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        action={
          <Button asChild>
            <Link href={routes.store()}>Browse the store</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Hymn books, garments and centenary keepsakes are waiting in the store.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
      <ul
        aria-label="Items in your bag"
        className="grid divide-y divide-border rounded-panel border border-border bg-surface"
      >
        {priced.lines.map(({ line, product, option, total, available }) => {
          const key = lineKey(line);
          return (
            <li key={key} className="flex gap-4 p-4 sm:p-5">
              <Link href={routes.product(product.slug)} tabIndex={-1} aria-hidden className="shrink-0">
                <ProductArt product={product} sizes="96px" className="size-20 rounded-card sm:size-24" />
              </Link>
              <div className="grid min-w-0 flex-1 gap-2">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="grid min-w-0 gap-0.5">
                    <Link href={routes.product(product.slug)} className="font-semibold hover:underline">
                      {product.name}
                    </Link>
                    {option && (
                      <span className="text-sm text-muted-foreground">
                        {product.option?.name}: {option.label}
                      </span>
                    )}
                    {!available && (
                      <span className="text-sm font-semibold text-danger">Sold out since you added it</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-display font-bold tabular",
                      !available && "text-muted-foreground line-through",
                    )}
                  >
                    {formatMoney(total)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(q) => bag.setQuantity(key, q)}
                    label={`Quantity of ${product.name}`}
                    disabled={!available}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 />}
                    onClick={() => bag.remove(key)}
                    aria-label={`Remove ${product.name} from your bag`}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <OrderSummary
        subtotal={formatMoney(priced.subtotal)}
        count={priced.count}
        className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
      >
        {hasUnavailable && (
          <p role="alert" className="rounded-card bg-danger-soft px-3 py-2 text-sm">
            Remove the sold-out items to continue.
          </p>
        )}
        {hasUnavailable || priced.count === 0 ? (
          <Button size="lg" fullWidth disabled rightIcon={<ArrowRight />}>
            Continue to checkout
          </Button>
        ) : (
          <Button asChild size="lg" fullWidth rightIcon={<ArrowRight />}>
            <Link href={routes.checkout()}>Continue to checkout</Link>
          </Button>
        )}
        <Link
          href={routes.store()}
          className="text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Keep shopping
        </Link>
      </OrderSummary>
    </div>
  );
}
