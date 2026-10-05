"use client";

import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isAvailable, optionFor } from "@/data/pricing";
import type { Product } from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { bag, useBagLines } from "./bag-store";
import { QuantityStepper } from "./quantity-stepper";

/**
 * Choosing a size, a quantity and adding to the bag. Sizes that have sold out
 * stay visible but cannot be chosen; nothing is added until a size is picked.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const [optionId, setOptionId] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const lines = useBagLines();
  const option = optionFor(product, optionId);
  const soldOut = product.stock === "sold-out";
  const inBag = lines.filter((l) => l.productSlug === product.slug).reduce((sum, l) => sum + l.quantity, 0);

  const add = () => {
    if (product.option && !option) {
      setError(`Please choose a ${product.option.name.toLowerCase()}.`);
      return;
    }
    if (!isAvailable(product, option)) return;
    bag.add({ productSlug: product.slug, optionId: option?.id ?? null, quantity });
    setError(null);
    toast.success(`${product.name}${option ? `, ${option.label}` : ""} is in your bag`, {
      action: { label: "View bag", onClick: () => router.push(routes.bag()) },
    });
  };

  return (
    <div className="grid gap-5">
      {product.option && (
        <fieldset className="grid gap-3" aria-describedby={error ? "option-error" : undefined}>
          <legend className="mb-3 flex w-full items-center justify-between text-sm font-semibold">
            {product.option.name}
            {option && <span className="font-normal text-muted-foreground">{option.label}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.option.values.map((v) => {
              const gone = v.stock === "sold-out";
              const chosen = v.id === optionId;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "relative inline-flex min-h-11 min-w-14 cursor-pointer items-center justify-center rounded-control border px-4 text-sm font-semibold transition-colors",
                    "has-focus-visible:ring-2 has-focus-visible:ring-ring/40",
                    chosen
                      ? "border-foreground bg-foreground text-background"
                      : "border-border-strong bg-surface hover:border-foreground",
                    gone &&
                      "cursor-not-allowed border-dashed text-muted-foreground line-through hover:border-border-strong",
                  )}
                >
                  <input
                    type="radio"
                    name={`option-${product.slug}`}
                    value={v.id}
                    checked={chosen}
                    disabled={gone}
                    onChange={() => {
                      setOptionId(v.id);
                      setError(null);
                    }}
                    className="sr-only"
                  />
                  {v.label}
                  {gone && <span className="sr-only"> (sold out)</span>}
                  {v.stock === "low-stock" && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 size-2.5 rounded-full bg-warning ring-2 ring-background"
                    />
                  )}
                  {v.stock === "low-stock" && <span className="sr-only"> (only a few left)</span>}
                </label>
              );
            })}
          </div>
          {error && (
            <p id="option-error" role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={`Quantity of ${product.name}`}
          disabled={soldOut}
        />
        <Button
          size="lg"
          className="min-w-52 flex-1 rounded-pill sm:flex-none"
          disabled={soldOut || (!!option && option.stock === "sold-out")}
          onClick={add}
          leftIcon={<ShoppingBag />}
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </Button>
      </div>

      {inBag > 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <Check aria-hidden className="size-4 text-success" />
          {inBag} in your bag.
          <Link href={routes.bag()} className="font-semibold text-accent hover:underline">
            View bag
          </Link>
        </p>
      )}
    </div>
  );
}
