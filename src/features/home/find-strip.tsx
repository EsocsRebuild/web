import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const QUICK = ["Lagos", "Port Harcourt", "Abuja", "Ibadan", "Awka", "London", "United States"];

/** "Find a house of prayer": a real form, so it works before JavaScript loads. */
export function FindStrip({ pageCount }: { pageCount: number }) {
  return (
    <section aria-labelledby="find-strip-title" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-wide gap-4 px-gutter py-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
        <div>
          <h2 id="find-strip-title" className="font-display text-xl font-extrabold">
            Find a house of prayer
          </h2>
          <p className="text-sm text-muted-foreground">
            {pageCount} churches, provinces and headquarters worldwide
          </p>
        </div>
        <div className="grid gap-3">
          <form action={routes.find()} role="search" className="flex gap-2">
            <label htmlFor="find-strip-q" className="sr-only">
              Town, province or church name
            </label>
            <div className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle-foreground"
              />
              <input
                id="find-strip-q"
                name="q"
                type="search"
                placeholder="Town, province or church name"
                className="h-12 w-full rounded-pill border border-input bg-background pr-4 pl-12 text-base transition-[border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-pill">
              Search
            </Button>
          </form>
          <ul className="flex flex-wrap gap-2" aria-label="Popular places">
            {QUICK.map((q) => (
              <li key={q}>
                <Link
                  href={routes.find({ q })}
                  className="inline-flex min-h-8 items-center rounded-pill bg-surface-muted px-3 text-xs font-semibold text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
