import { notFound } from "next/navigation";

import { UnitCard } from "@/components/patterns/cards";
import { SectionHeading } from "@/components/patterns/section-heading";
import type { UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { childTabLabel, getUnitContext, hasTab, staticParamsForTab } from "@/features/units/unit-context";

const ORDER: UnitKind[] = [
  "headquarters",
  "cmc",
  "section",
  "directorate",
  "province",
  "special-area",
  "district",
  "branch",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return staticParamsForTab("branches");
}

export default async function UnitBranchesPage({ params }: PageProps<"/church/[slug]">) {
  const ctx = getUnitContext((await params).slug);
  if (!hasTab(ctx, "branches")) notFound();
  const { unit, children } = ctx;

  const groups = ORDER.map((kind) => ({
    kind,
    units: children
      .filter((c) => c.kind === kind)
      .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true })),
  })).filter((g) => g.units.length);

  return (
    <div className="grid gap-10">
      <SectionHeading
        title={childTabLabel(unit)}
        description={`${children.length} ${children.length === 1 ? "page" : "pages"} recorded within ${unit.slug === "esocs" ? "ESOCS Worldwide" : unit.name}.`}
      />
      {groups.map((g) => (
        <section key={g.kind} aria-labelledby={`group-${g.kind}`} className="grid gap-4">
          <h2
            id={`group-${g.kind}`}
            className="flex items-baseline gap-2 font-display text-lg font-extrabold"
          >
            {UNIT_KIND[g.kind].plural}
            <span className="text-sm font-semibold text-muted-foreground tabular">{g.units.length}</span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {g.units.map((c) => (
              <li key={c.slug}>
                <UnitCard unit={c} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
