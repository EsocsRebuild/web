import { ChevronRight, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/patterns/section-heading";
import { siteConfig } from "@/config/site";
import { getStore } from "@/data/store";
import { Price, ProductCard, StockLabel } from "@/features/store/product-card";
import { ProductArt } from "@/features/store/product-art";
import { ProductPurchase } from "@/features/store/product-purchase";
import { StorePreviewNotice } from "@/features/store/store-front";
import { routes } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStore()
    .listProducts()
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/store/[slug]">): Promise<Metadata> {
  const product = getStore().getProduct((await params).slug);
  return product
    ? { title: `${product.name} · Store`, description: product.summary, robots: { index: false } }
    : {};
}

export default async function ProductPage({ params }: PageProps<"/store/[slug]">) {
  const store = getStore();
  const product = store.getProduct((await params).slug);
  if (!product) notFound();
  const category = store.getCategory(product.categorySlug);
  const related = store.listRelated(product.slug, 4);

  return (
    <div className="mx-auto grid max-w-wide gap-10 px-gutter py-6 sm:py-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href={routes.store()} className="hover:text-foreground">
              Store
            </Link>
          </li>
          {category && (
            <li className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-4" />
              <Link href={routes.store(category.slug)} className="hover:text-foreground">
                {category.name}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden className="size-4" />
            <span aria-current="page" className="font-semibold text-foreground">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative">
          <ProductArt
            product={product}
            priority
            sizes="(min-width: 1024px) 640px, 100vw"
            className="aspect-square rounded-panel lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 rounded-pill bg-background/90 px-3 py-1 text-xs font-bold tracking-wide uppercase backdrop-blur">
              {product.badge}
            </span>
          )}
        </div>

        <div className="grid content-start gap-6">
          <div className="grid gap-3">
            {category && (
              <p className="text-overline font-semibold text-highlight uppercase">{category.name}</p>
            )}
            <h1 className="font-display text-display-md font-extrabold text-balance">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Price product={product} size="lg" />
              <StockLabel stock={product.stock} />
            </div>
            <p className="font-serif text-xl leading-snug text-muted-foreground italic">{product.summary}</p>
          </div>

          <ProductPurchase product={product} />
          <StorePreviewNotice />

          <div className="grid gap-3 border-t border-border pt-6">
            <h2 className="font-display text-lg font-bold">About this item</h2>
            {product.description.map((p) => (
              <p key={p} className="leading-7 text-muted-foreground">
                {p}
              </p>
            ))}
            {product.details.length > 0 && (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {product.details.map((d) => (
                  <div key={d.label} className="contents">
                    <dt className="text-muted-foreground">{d.label}</dt>
                    <dd className="font-semibold">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <ul className="grid gap-3 border-t border-border pt-6 text-sm">
            <li className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold">Collect</strong> from the{" "}
                {siteConfig.contact.headquarters.name}, {siteConfig.contact.headquarters.address}.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <PackageCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold">Delivery</strong> within Nigeria, arranged with you by the
                store team.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold">No payment online.</strong> The store confirms your order
                and how to pay.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="grid gap-6 border-t border-border pt-10">
          <SectionHeading
            id="related-heading"
            title="You may also like"
            href={routes.store(category?.slug)}
            linkLabel={category ? `More ${category.name.toLowerCase()}` : "The whole store"}
          />
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} category={store.getCategory(p.categorySlug)?.name} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
