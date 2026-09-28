import { z } from "zod";

import type { StoreRepository } from "../../repositories";
import { productCategorySchema, productSchema, type Product } from "../../schema/store";

import { sampleCategories, sampleProducts } from "./catalogue";

/**
 * The store catalogue from the sample seed, validated when it loads so a bad
 * entry fails the build rather than the shelf. The admin app's adapter replaces
 * this file and implements the same contract.
 */
export function createSeedStoreRepository(
  source: { categories: unknown; products: unknown } = {
    categories: sampleCategories,
    products: sampleProducts,
  },
): StoreRepository {
  const categories = z.array(productCategorySchema).parse(source.categories);
  const products = z.array(productSchema).parse(source.products);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const seen = new Set<string>();
  for (const p of products) {
    if (seen.has(p.slug)) throw new Error(`Duplicate product slug: ${p.slug}`);
    seen.add(p.slug);
    if (!categorySlugs.has(p.categorySlug)) {
      throw new Error(`Product ${p.slug} is in unknown category ${p.categorySlug}`);
    }
    const optionIds = p.option?.values.map((v) => v.id) ?? [];
    if (new Set(optionIds).size !== optionIds.length) throw new Error(`Duplicate option on ${p.slug}`);
  }

  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return {
    listCategories: () => categories,
    getCategory: (slug) => categories.find((c) => c.slug === slug) ?? null,
    listProducts: (query = {}) =>
      products.filter(
        (p) =>
          (!query.category || p.categorySlug === query.category) &&
          (query.featured === undefined || p.featured === query.featured),
      ),
    getProduct: (slug) => bySlug.get(slug) ?? null,
    listRelated: (slug, limit = 4) => {
      const product = bySlug.get(slug);
      if (!product) return [];
      const rank = (p: Product) => (p.categorySlug === product.categorySlug ? 0 : p.featured ? 1 : 2);
      return products
        .filter((p) => p.slug !== slug)
        .map((p, i) => ({ p, i }))
        .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
        .slice(0, limit)
        .map(({ p }) => p);
    },
  };
}
