import type { Metadata } from "next";

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
              <span className="text-xs font-bold text-muted-foreground tabular">Level {i + 1}</span>
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
