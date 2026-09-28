import type { Money, Product, ProductOption } from "./schema/store";

/**
 * Store arithmetic in one place, shared by the bag, the checkout and the order
 * adapter, so a price can never disagree between screens. Pure and isomorphic.
 */

export interface BagLine {
  productSlug: string;
  /** The chosen size or style; null for products without options. */
  optionId: string | null;
  quantity: number;
}

export interface PricedLine {
  line: BagLine;
  product: Product;
  option: ProductOption | null;
  unit: Money;
  total: Money;
  /** False when the product or the chosen option has sold out since it was added. */
  available: boolean;
}

export interface PricedBag {
  lines: PricedLine[];
  subtotal: Money;
  /** Items that can be ordered (sold-out lines excluded). */
  count: number;
}

export const MAX_QUANTITY = 20;

const money = (amount: number): Money => ({ amount, currency: "NGN" });

export function optionFor(product: Product, optionId: string | null): ProductOption | null {
  if (!product.option) return null;
  return product.option.values.find((v) => v.id === optionId) ?? null;
}

export function isAvailable(product: Product, option: ProductOption | null) {
  if (product.stock === "sold-out") return false;
  if (product.option) return option !== null && option.stock !== "sold-out";
  return true;
}

/**
 * Prices the bag against the current catalogue. Lines for products that no
 * longer exist, or options that no longer exist, are dropped; sold-out lines are
 * kept (so the member can see what changed) but not counted in the subtotal.
 */
export function priceBag(lines: BagLine[], catalogue: ReadonlyMap<string, Product>): PricedBag {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = catalogue.get(line.productSlug);
    if (!product) continue;
    const option = optionFor(product, line.optionId);
    if (product.option && !option) continue;
    const quantity = Math.min(Math.max(1, Math.floor(line.quantity)), MAX_QUANTITY);
    priced.push({
      line: { ...line, quantity },
      product,
      option,
      unit: product.price,
      total: money(product.price.amount * quantity),
      available: isAvailable(product, option),
    });
  }
  const orderable = priced.filter((l) => l.available);
  return {
    lines: priced,
    subtotal: money(orderable.reduce((sum, l) => sum + l.total.amount, 0)),
    count: orderable.reduce((sum, l) => sum + l.line.quantity, 0),
  };
}

/** Same product and option means the same line. */
export const lineKey = (line: Pick<BagLine, "productSlug" | "optionId">) =>
  `${line.productSlug}:${line.optionId ?? ""}`;
