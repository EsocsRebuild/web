import { ArrowRight, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { getStore } from "@/data/store";
import { routes } from "@/lib/routes";

import { ProductCard } from "./product-card";
import { MoreLink, OrderSteps, ProductRow, ShelfSwatch, productRowItem } from "./store-parts";
import { shelfTheme } from "./store-theme";

/**
 * The church store on Home, in the order a visitor asks: what is it and what do
 * they sell (the store and its shelves), what does it look like (featured items,
 * given the full width so every name sits on one line), and what happens if I
 * order (three steps).
 */
export function StoreTeaser() {
  const store = getStore();
  const all = store.listProducts();
  const products = store
    .listProducts({ featured: true })
    .filter((p) => p.stock !== "sold-out")
    .slice(0, 4);
  if (!products.length) return null;

  const categories = store.listCategories();
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return (
    <section
      aria-labelledby="store-teaser-heading"
      className="border-y border-border bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-wide gap-10 px-gutter">
        {/* The store and its shelves. */}
        <div className="dark relative isolate grid gap-8 overflow-hidden rounded-panel border border-white/10 bg-inverse p-6 text-foreground sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12 lg:p-10">
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(55% 60% at 100% 0%, color-mix(in oklch, var(--color-royal-500) 36%, transparent), transparent 70%), radial-gradient(45% 55% at 0% 100%, color-mix(in oklch, var(--color-gold-500) 14%, transparent), transparent 70%)",
            }}
          />
          <LogoMark className="absolute -right-12 -bottom-16 -z-10 size-64 text-white opacity-[0.05]" />

          <div className="grid content-start gap-5">
            <div className="grid gap-3">
              <p className="flex flex-wrap items-center gap-2 text-overline font-semibold whitespace-nowrap text-highlight uppercase">
                The ESOCS Store
                <span className="rounded-pill border border-highlight/40 px-2 py-0.5 text-[0.625rem] tracking-wider">
                  Preview
                </span>
              </p>
              <h2
                id="store-teaser-heading"
                className="font-display text-display-sm leading-tight font-extrabold text-balance"
              >
                For worship at church and at home
              </h2>
              <p className="max-w-lg text-[0.9375rem] leading-7 text-pretty text-muted-foreground">
                Hymn books, the Holy Bible, white garments and keepsakes of the centenary, from the Order’s
                own store.
              </p>
            </div>
            <ul className="grid gap-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
                <span className="text-pretty">
                  <strong className="font-semibold">No payment online.</strong>{" "}
                  <span className="text-muted-foreground">We call to confirm your order and how to pay.</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
                <span className="text-pretty">
                  <strong className="font-semibold">Collect or delivery.</strong>{" "}
                  <span className="text-muted-foreground">
                    From the National Headquarters, or anywhere in Nigeria.
                  </span>
                </span>
              </li>
            </ul>
            <Button
              asChild
              variant="primary"
              rightIcon={<ArrowRight aria-hidden />}
              className="w-full sm:w-auto sm:justify-self-start"
            >
              <Link href={routes.store()}>Browse all {all.length} items</Link>
            </Button>
          </div>

          <nav aria-label="Store shelves">
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {categories.map((c) => {
                const theme = shelfTheme(c.slug);
                return (
                  <li key={c.slug}>
                    <Link
                      href={routes.store(c.slug)}
                      className="group/shelf flex h-full items-center gap-3 rounded-card border border-white/10 bg-white/4 p-3 transition-colors hover:border-white/25 hover:bg-white/8"
                    >
                      <ShelfSwatch theme={theme} />
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="text-sm leading-snug font-bold whitespace-nowrap">{c.name}</span>
                        <span className="text-xs leading-5 text-muted-foreground">{theme.promise}</span>
                      </span>
                      <ChevronRight
                        aria-hidden
                        className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover/shelf:translate-x-0.5 group-hover/shelf:text-foreground sm:block"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* What it looks like. */}
        <div className="grid gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <div className="grid gap-1">
              <h3 className="font-display text-xl font-extrabold">Featured items</h3>
              <p className="text-sm text-muted-foreground">Chosen for worship this season.</p>
            </div>
            <MoreLink href={routes.store()} className="whitespace-nowrap">
              See the whole store
            </MoreLink>
          </div>
          <ProductRow label="Featured items">
            {products.map((p) => (
              <li key={p.slug} className={productRowItem}>
                <ProductCard product={p} category={names[p.categorySlug]} />
              </li>
            ))}
          </ProductRow>
        </div>

        {/* What happens next. */}
        <div className="grid gap-3">
          <OrderSteps />
          <p className="text-xs leading-5 text-muted-foreground">
            The store is being prepared: items and prices shown are examples, and orders open when it
            launches.
          </p>
        </div>
      </div>
    </section>
  );
}
