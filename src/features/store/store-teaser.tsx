import { ArrowRight, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { getStore } from "@/data/store";
import { routes } from "@/lib/routes";

import { ProductCard } from "./product-card";
import { MoreLink, OrderSteps, ShelfSwatch } from "./store-parts";
import { shelfTheme } from "./store-theme";

/**
 * The church store on Home. Left, the store's shelves as a way in ("what do they
 * sell?"); right, four featured items ("what does it look like?"), then how
 * ordering works ("what happens if I tap?"), so nobody has to guess.
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
  const count = (slug: string) => all.filter((p) => p.categorySlug === slug).length;

  return (
    <section
      aria-labelledby="store-teaser-heading"
      className="border-y border-border bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-wide gap-8 px-gutter lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-10">
        {/* The way in: the store and its shelves. */}
        <div className="dark relative isolate flex flex-col gap-6 overflow-hidden rounded-panel border border-white/10 bg-inverse p-6 text-foreground sm:p-7">
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(60% 45% at 100% 0%, color-mix(in oklch, var(--color-royal-500) 38%, transparent), transparent 70%), radial-gradient(50% 40% at 0% 100%, color-mix(in oklch, var(--color-gold-500) 16%, transparent), transparent 70%)",
            }}
          />
          <LogoMark className="absolute -right-10 -bottom-12 -z-10 size-52 text-white opacity-[0.05]" />

          <div className="grid gap-2.5">
            <p className="flex flex-wrap items-center gap-2 text-overline font-semibold text-highlight uppercase">
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
            <p className="text-sm leading-6 text-muted-foreground">
              Hymn books, the Holy Bible, white garments and keepsakes of the centenary, from the Order’s own
              store.
            </p>
          </div>

          <nav aria-label="Store shelves">
            <ul className="grid gap-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={routes.store(c.slug)}
                    className="group/shelf -mx-2 flex items-center gap-3 rounded-card p-2 transition-colors hover:bg-white/[0.06]"
                  >
                    <ShelfSwatch theme={shelfTheme(c.slug)} className="size-10" />
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate text-sm font-bold">{c.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {count(c.slug)} items · {shelfTheme(c.slug).promise}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/shelf:translate-x-0.5 group-hover/shelf:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="mt-auto grid gap-2.5 border-t border-white/10 pt-5 text-sm">
            <li className="flex items-start gap-2.5">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
              <span>
                <strong className="font-semibold">No payment online.</strong>{" "}
                <span className="text-muted-foreground">We call to confirm your order and how to pay.</span>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
              <span>
                <strong className="font-semibold">Collect or delivery.</strong>{" "}
                <span className="text-muted-foreground">
                  From the National Headquarters, or anywhere in Nigeria.
                </span>
              </span>
            </li>
          </ul>

          <Button asChild variant="primary" fullWidth rightIcon={<ArrowRight aria-hidden />}>
            <Link href={routes.store()}>Browse all {all.length} items</Link>
          </Button>
        </div>

        {/* What it looks like, and what happens next. */}
        <div className="grid min-w-0 content-start gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <div className="grid gap-1">
              <h3 className="font-display text-xl font-extrabold">Featured items</h3>
              <p className="text-sm text-muted-foreground">Chosen for worship this season.</p>
            </div>
            <MoreLink href={routes.store()}>See the whole store</MoreLink>
          </div>

          <ul className="-mx-gutter scrollbar-none flex snap-x scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p.slug} className="w-[72%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={p} category={names[p.categorySlug]} />
              </li>
            ))}
          </ul>

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
