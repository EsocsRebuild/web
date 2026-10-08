import type { Metadata } from "next";
import { ArrowRight, Building2, Shield, Users } from "lucide-react";
import Link from "next/link";

import { Bridges } from "@/components/patterns/bridges";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Church Management Councils (CMCs) · ESOCS Worldwide",
  description:
    "The 12 regional Church Management Councils (CMCs) of the Eternal Sacred Order of the Cherubim & Seraphim worldwide, their leadership, chairmen, and provinces.",
};

export default function CmcsPage() {
  const content = getContent();

  const cmcs = content.listUnits({ kind: "cmc" }).sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Regional Councils"
        title="Church Management Councils (CMCs)"
        description="The 12 regional executive councils governing provinces, districts, and houses of prayer across ESOCS Worldwide."
      />

      <section aria-labelledby="cmcs-grid-heading" className="grid gap-6">
        <SectionHeading
          id="cmcs-grid-heading"
          title="All 12 CMCs & Chairmen"
          size="sm"
          description="Explore each regional council, its executive leadership, and member churches."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cmcs.map((cmc) => {
            const chairman = cmc.leaders.find((l) => /chairman/i.test(l.role) && !/vice/i.test(l.role));
            const viceChairman = cmc.leaders.find((l) => /vice/i.test(l.role));
            const secretary = cmc.leaders.find((l) => /secretary/i.test(l.role));
            const descendantCount = content.getDescendantCount(cmc.slug);

            return (
              <div
                key={cmc.slug}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-gold-500/40 hover:bg-surface-muted/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-950/10 px-3.5 py-1 text-xs font-bold tracking-wider text-royal-900 ring-1 ring-royal-700/20 dark:bg-royal-400/10 dark:text-royal-300">
                      <Shield className="size-3.5 text-gold-500" />
                      <span>{cmc.name}</span>
                    </span>
                    <span className="text-xs font-bold tracking-wider text-gold-800 uppercase dark:text-gold-400">
                      Level 3 Council
                    </span>
                  </div>

                  {/* Leadership Roster */}
                  <div className="mt-5 space-y-4">
                    {chairman ? (
                      <div className="rounded-xl border border-gold-500/20 bg-gold-400/5 p-3.5">
                        <div className="flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase dark:text-gold-400">
                          <Users className="size-3 text-gold-500" />
                          <span>Chairman</span>
                        </div>
                        <p className="mt-1 font-display text-base font-bold text-foreground">
                          {chairman.name}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border/60 bg-surface-muted/40 p-3.5">
                        <p className="text-xs text-muted-foreground italic">Chairman to be announced</p>
                      </div>
                    )}

                    <div className="grid gap-2 text-xs">
                      {viceChairman && (
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface/80 p-2.5">
                          <span className="font-semibold text-muted-foreground">Vice Chairman</span>
                          <span className="text-right font-bold text-foreground">{viceChairman.name}</span>
                        </div>
                      )}
                      {secretary && (
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface/80 p-2.5">
                          <span className="font-semibold text-muted-foreground">Secretary</span>
                          <span className="text-right font-bold text-foreground">{secretary.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3.5 text-accent" />
                      <span>Churches &amp; Provinces</span>
                    </span>
                    <span className="font-bold text-foreground">{descendantCount} within</span>
                  </div>

                  <Link
                    href={routes.unit(cmc.slug)}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-linear-to-r from-royal-800 via-royal-900 to-royal-950 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    <span>Explore {cmc.name} Council Page</span>
                    <ArrowRight className="size-3.5 text-gold-300 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Bridges
        items={[
          {
            href: routes.structure(),
            eyebrow: "How we're organised",
            title: "View All 6 Levels of the Order",
          },
          { href: routes.find(), eyebrow: "Near you", title: "Find a local House of Prayer" },
        ]}
      />
    </div>
  );
}
