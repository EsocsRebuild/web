import { ArrowRight, HandHeart } from "lucide-react";
import Link from "next/link";

import type { Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";

/** Seeds of Love: the church's own appeal. */
export function GiveAppeal({ appeal }: { appeal: Organisation["givingAppeal"] }) {
  return (
    <section
      aria-labelledby="give-heading"
      className="bg-surface-raised relative isolate overflow-hidden rounded-panel border border-border/80 p-8 shadow-sm sm:p-12 lg:p-14"
    >
      <div className="grid max-w-2xl gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-crimson-700/30 bg-crimson-800/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson-700 uppercase shadow-xs dark:text-crimson-300">
          <HandHeart className="size-3.5" />
          Kingdom Stewardship
        </span>

        <h2
          id="give-heading"
          className="font-display text-[clamp(1.85rem,1.4rem+1.8vw,3rem)] leading-[1.12] font-extrabold tracking-tight text-balance text-foreground"
        >
          {appeal.title}
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{appeal.body}</p>

        {/* Giving Pillars */}
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
          <div className="rounded-card border border-border bg-surface p-4">
            <span className="text-sm font-bold text-foreground">Centenary Monument</span>
            <p className="mt-1 text-xs text-muted-foreground">Cathedral & historical archives</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <span className="text-sm font-bold text-foreground">Global Missions</span>
            <p className="mt-1 text-xs text-muted-foreground">Church planting & outreach</p>
          </div>
          <div className="col-span-2 rounded-card border border-border bg-surface p-4 sm:col-span-1">
            <span className="text-sm font-bold text-foreground">Benevolence & Care</span>
            <p className="mt-1 text-xs text-muted-foreground">Welfare for the vulnerable</p>
          </div>
        </div>

        <div className="pt-3">
          <Link
            href={routes.give()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-crimson-800 px-7 text-sm font-bold text-white shadow-md transition-all hover:bg-crimson-900 hover:shadow-lg dark:bg-crimson-700 dark:hover:bg-crimson-600"
          >
            <span>Plant a Seed of Love</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
