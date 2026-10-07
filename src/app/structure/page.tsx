import type { Metadata } from "next";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

import { Bridges } from "@/components/patterns/bridges";
import { GlossaryTerm } from "@/components/patterns/glossary-term";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import type { UnitKind } from "@/data/schema/content";
import { OrgTree, type TreeNode } from "@/features/structure/org-tree";
import { UNIT_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "How we're organised",
  description:
    "From the Holy Order to your house of prayer: headquarters, CMCs, provinces, districts and branches.",
};

const LEVELS: { kind: UnitKind; term: string; text: string }[] = [
  {
    kind: "holy-order",
    term: "holy-order",
    text: "The worldwide Order, led by the Baba Aladura and the Advisory Board.",
  },
  {
    kind: "headquarters",
    term: "seat-of-baba-aladura",
    text: "Seats and national headquarters in Lagos and Abuja, and cathedrals abroad.",
  },
  { kind: "cmc", term: "cmc", text: "Twelve regional councils that group provinces." },
  {
    kind: "province",
    term: "province",
    text: "Provinces and special areas, each with its houses of prayer.",
  },
  { kind: "district", term: "district", text: "District headquarters within a province." },
  { kind: "branch", term: "house-of-prayer", text: "The local church where members worship each week." },
];

const KIND_ORDER: UnitKind[] = [
  "headquarters",
  "cmc",
  "section",
  "directorate",
  "province",
  "special-area",
  "district",
  "branch",
];

export default function StructurePage() {
  const content = getContent();

  const cmcs = content.listUnits({ kind: "cmc" }).sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  const build = (slug: string): TreeNode => {
    const u = content.getUnit(slug)!;
    const kids = content
      .getChildren(slug)
      .sort(
        (a, b) =>
          KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
          a.name.localeCompare(b.name, "en", { numeric: true }),
      );
    return {
      slug,
      name: slug === "esocs" ? "ESOCS Worldwide" : u.name,
      kind: u.kind,
      children: kids.map((k) => build(k.slug)),
    };
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="How we're organised"
        title="From the Holy Order to your house of prayer"
        description="Each level has its own page. Open any of them to see who leads it, what happens there, and the churches within it."
      />

      <section aria-labelledby="levels-heading" className="grid gap-5">
        <SectionHeading id="levels-heading" title="The levels" size="sm" />
        <ol className="grid gap-3 md:grid-cols-3">
          {LEVELS.map((l, i) => (
            <li
              key={l.kind}
              className="grid content-start gap-2 rounded-card border border-border bg-surface p-5"
            >
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase tabular">
                Level {i + 1}
              </span>
              <span className="font-display text-lg font-extrabold">
                <GlossaryTerm id={l.term}>{UNIT_KIND[l.kind].plural}</GlossaryTerm>
              </span>
              <span className="text-sm leading-6 text-muted-foreground">{l.text}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Provinces whose CMC is not yet recorded sit directly under the Holy Order until the church confirms
          it.
        </p>
      </section>

      {/* Dedicated Church Management Councils (CMCs) & Leadership Section */}
      <section aria-labelledby="cmc-heading" className="grid gap-6">
        <SectionHeading
          id="cmc-heading"
          title="Church Management Councils (CMCs)"
          size="sm"
          description="The 12 regional management councils of the Holy Order and their chairmen."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cmcs.map((cmc) => {
            const chairman = cmc.leaders.find((l) => /chairman/i.test(l.role) && !/vice/i.test(l.role));
            const viceChairman = cmc.leaders.find((l) => /vice/i.test(l.role));
            const secretary = cmc.leaders.find((l) => /secretary/i.test(l.role));

            return (
              <div
                key={cmc.slug}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs transition-all duration-300 hover:border-gold-500/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-950/10 px-3 py-1 text-xs font-bold tracking-wider text-royal-900 ring-1 ring-royal-700/20 dark:bg-royal-400/10 dark:text-royal-300">
                      <Shield className="size-3 text-gold-500" />
                      <span>{cmc.name}</span>
                    </span>
                    <span className="text-[0.6875rem] font-bold text-muted-foreground uppercase">
                      Level 3
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {chairman && (
                      <div>
                        <p className="text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase dark:text-gold-400">
                          Chairman
                        </p>
                        <p className="font-display text-sm leading-snug font-bold text-foreground">
                          {chairman.name}
                        </p>
                      </div>
                    )}

                    {viceChairman && (
                      <div>
                        <p className="text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
                          Vice Chairman
                        </p>
                        <p className="text-xs font-semibold text-foreground/90">{viceChairman.name}</p>
                      </div>
                    )}

                    {secretary && (
                      <div>
                        <p className="text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
                          Secretary
                        </p>
                        <p className="text-xs font-semibold text-foreground/90">{secretary.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-border/60 pt-3.5">
                  <Link
                    href={routes.unit(cmc.slug)}
                    className="inline-flex w-full items-center justify-between rounded-xl border border-border/80 bg-surface-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors group-hover:border-gold-500/30 group-hover:bg-surface-muted"
                  >
                    <span>View {cmc.name} Council &amp; Provinces</span>
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="tree-heading" className="grid gap-4">
        <SectionHeading
          id="tree-heading"
          title="The whole Order"
          size="sm"
          description="Expand any level to see what it contains."
        />
        <ul className="grid rounded-panel border border-border bg-surface p-2 sm:p-4">
          <OrgTree node={build("esocs")} />
        </ul>
      </section>

      <Bridges
        items={[
          { href: routes.find(), eyebrow: "Near you", title: "Find a house of prayer" },
          { href: routes.unit("esocs"), eyebrow: "Who we are", title: "The Holy Order" },
        ]}
      />
    </div>
  );
}
