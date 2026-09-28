import { describe, expect, it } from "vitest";

import { createSeedStoreRepository } from "./adapters/seed-store/repository";
import { isAvailable, lineKey, optionFor, priceBag } from "./pricing";

const catalogue = new Map(
  createSeedStoreRepository()
    .listProducts()
    .map((p) => [p.slug, p]),
);

describe("priceBag", () => {
  it("prices lines in kobo and totals the orderable ones", () => {
    const bag = priceBag(
      [
        { productSlug: "esocs-hymn-book-english", optionId: null, quantity: 2 },
        { productSlug: "white-prayer-gown", optionId: "m", quantity: 1 },
      ],
      catalogue,
    );
    expect(bag.subtotal).toEqual({ amount: (2 * 5000 + 25000) * 100, currency: "NGN" });
    expect(bag.count).toBe(3);
  });

  it("keeps sold-out lines visible but out of the total", () => {
    const bag = priceBag(
      [
        { productSlug: "crest-lapel-pin", optionId: null, quantity: 1 },
        { productSlug: "white-prayer-gown", optionId: "xxl", quantity: 1 },
      ],
      catalogue,
    );
    expect(bag.lines).toHaveLength(2);
    expect(bag.lines.every((l) => !l.available)).toBe(true);
    expect(bag.subtotal.amount).toBe(0);
    expect(bag.count).toBe(0);
  });

  it("drops unknown products and options, and clamps quantities", () => {
    const bag = priceBag(
      [
        { productSlug: "gone", optionId: null, quantity: 1 },
        { productSlug: "white-prayer-gown", optionId: "tiny", quantity: 1 },
        { productSlug: "holy-bible-kjv", optionId: null, quantity: 99 },
      ],
      catalogue,
    );
    expect(bag.lines).toHaveLength(1);
    expect(bag.lines[0].line.quantity).toBe(20);
  });
});

describe("helpers", () => {
  it("needs an option for products that have them", () => {
    const gown = catalogue.get("white-prayer-gown")!;
    expect(isAvailable(gown, null)).toBe(false);
    expect(isAvailable(gown, optionFor(gown, "m"))).toBe(true);
    expect(lineKey({ productSlug: "a", optionId: null })).not.toBe(
      lineKey({ productSlug: "a", optionId: "m" }),
    );
  });
});
