import { Info } from "lucide-react";

import { LogoMark } from "@/components/icons/logo";
import { BackButton } from "@/components/ui/back-button";
import type { ProductCategory } from "@/data/schema/store";
import { getStore } from "@/data/store";
import { cn } from "@/lib/utils";

import { ProductShelf } from "./product-shelf";
import { OrderSteps, ShelfTiles } from "./store-parts";

/** Said on every store page until the admin app is connected and the store opens. */
export function StorePreviewNotice({ className }: { className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-card border border-warning/25 bg-warning-soft px-4 py-3 text-sm leading-6",
        className,
      )}
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
      <span>
        <strong className="font-semibold">Store preview.</strong> The church store is being prepared: the
        items and prices shown are examples, and online orders open when the store launches.
      </span>
    </p>
  );
}

function StoreHero({ category }: { category: ProductCategory | null }) {
  return (
    <div className="dark relative isolate overflow-hidden rounded-panel bg-inverse px-6 py-12 text-foreground sm:px-10 sm:py-16">
      <div
        aria-hidden
        className="parallax-layer absolute inset-x-0 -inset-y-20 -z-10"
        style={
          {
            "--parallax-shift": "14%",
            backgroundImage:
              "radial-gradient(50% 80% at 85% 20%, color-mix(in oklch, var(--color-royal-500) 40%, transparent), transparent 70%), radial-gradient(35% 60% at 10% 100%, color-mix(in oklch, var(--color-gold-500) 16%, transparent), transparent 70%)",
          } as React.CSSProperties
        }
      />
      <LogoMark
        aria-hidden
        className="parallax-layer absolute -right-8 -bottom-20 -z-10 size-80 text-white opacity-[0.06]"
      />
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        <div className="grid max-w-2xl gap-3">
          <div className="mb-1">
            <BackButton href="/" label="Back to Home" />
          </div>
          <p className="text-overline font-semibold text-highlight uppercase">The ESOCS Store</p>
          <h1 className="font-display text-display-lg font-extrabold text-balance">
            {category ? category.name : "For worship at church and at home"}
          </h1>
          <p className="font-serif text-xl leading-snug text-muted-foreground italic sm:text-2xl">
            {category
              ? category.description
              : "Hymn books, the Holy Bible, white garments and keepsakes of the centenary."}
          </p>
        </div>
        <OrderSteps tone="dark" layout="stack" />
      </div>
    </div>
  );
}

/** The store's front: its header, the preview notice, categories and the shelf. */
export function StoreFront({ category }: { category: ProductCategory | null }) {
  const store = getStore();
  const categories = store.listCategories();
  const all = store.listProducts();
  const counts = Object.fromEntries(
    categories.map((c) => [c.slug, all.filter((p) => p.categorySlug === c.slug).length]),
  );
  return (
    <div className="mx-auto grid max-w-wide gap-8 px-gutter py-6 sm:py-8">
      <StoreHero category={category} />
      <StorePreviewNotice />
      <ShelfTiles
        categories={categories}
        counts={counts}
        total={all.length}
        active={category?.slug ?? null}
      />
      <ProductShelf
        products={store.listProducts({ category: category?.slug })}
        categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.name]))}
      />
    </div>
  );
}
