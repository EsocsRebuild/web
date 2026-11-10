import { ArrowRight, HandHeart } from "lucide-react";
import Link from "next/link";

import type { Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";

/** Seeds of Love: the church's own appeal. */
export function GiveAppeal({ appeal }: { appeal: Organisation["givingAppeal"] }) {
  return (
    <section
      aria-labelledby="give-heading"
      className="bg-surface-raised relative isolate overflow-hidden rounded-panel border border-border/80 p-8 shadow-sm sm:p-12"
    >
      <div className="grid max-w-2xl gap-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
          <HandHeart className="size-3.5" />
          Kingdom Stewardship
        </span>

        <h2
          id="give-heading"
          className="font-display text-[clamp(1.75rem,1.4rem+1.6vw,2.75rem)] leading-[1.15] font-extrabold tracking-tight text-balance text-foreground"
        >
          {appeal.title}
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{appeal.body}</p>

        {/* Giving Pillars */}
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
          <div className="rounded-card border border-border bg-surface p-3.5">
            <span className="text-xs font-bold text-foreground">Centenary Monument</span>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">Cathedral & historical archives</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-3.5">
            <span className="text-xs font-bold text-foreground">Global Missions</span>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">Church planting & outreach</p>
          </div>
          <div className="col-span-2 rounded-card border border-border bg-surface p-3.5 sm:col-span-1">
            <span className="text-xs font-bold text-foreground">Benevolence & Care</span>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">Welfare for the vulnerable</p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href={routes.give()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-royal-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-royal-800 dark:bg-gold-400 dark:text-royal-950 dark:hover:bg-gold-300"
          >
            <span>Plant a Seed of Love</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
