import { describe, expect, it } from "vitest";

import { sampleCategories, sampleProducts } from "./catalogue";
import { createSeedStoreRepository } from "./repository";

describe("seed store catalogue", () => {
  const store = createSeedStoreRepository();

  it("validates and puts every product in a known category", () => {
    const categories = new Set(store.listCategories().map((c) => c.slug));
    expect(store.listProducts().length).toBe(sampleProducts.length);
    for (const p of store.listProducts()) expect(categories.has(p.categorySlug)).toBe(true);
  });

  it("filters by category and by featured", () => {
    expect(store.listProducts({ category: "garments" }).every((p) => p.categorySlug === "garments")).toBe(
      true,
    );
    expect(store.listProducts({ featured: true }).every((p) => p.featured)).toBe(true);
    expect(store.getCategory("nope")).toBeNull();
  });

  it("offers related products from the same category first", () => {
    const related = store.listRelated("esocs-hymn-book-english", 3);
    expect(related.map((p) => p.slug)).not.toContain("esocs-hymn-book-english");
    expect(related[0].categorySlug).toBe("books");
  });

  it("rejects bad data at load: duplicates, unknown categories and false reductions", () => {
    const first = sampleProducts[0];
    expect(() =>
      createSeedStoreRepository({ categories: sampleCategories, products: [first, first] }),
    ).toThrow(/Duplicate product/);
    expect(() =>
      createSeedStoreRepository({
        categories: sampleCategories,
        products: [{ ...first, categorySlug: "missing" }],
      }),
    ).toThrow(/unknown category/);
    expect(() =>
      createSeedStoreRepository({
        categories: sampleCategories,
        products: [{ ...first, compareAt: { amount: 1, currency: "NGN" } }],
      }),
    ).toThrow();
  });
});
