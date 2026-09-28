import type { Metadata } from "next";

import { Bridges } from "@/components/patterns/bridges";
import { getContent } from "@/data/content";
import { unitBridges } from "@/features/units/bridges";
import { IntroCard } from "@/features/units/intro-card";
import { getUnitContext } from "@/features/units/unit-context";
import { UnitHeader } from "@/features/units/unit-header";
import { UnitTabs } from "@/features/units/unit-tabs";
import { UNIT_KIND } from "@/lib/kinds";

export const dynamicParams = false;

export function generateStaticParams() {
  return getContent()
    .listUnits()
    .map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: LayoutProps<"/church/[slug]">): Promise<Metadata> {
  const { unit } = getUnitContext((await params).slug);
  return {
    title: unit.name,
    description:
      unit.tagline ??
      unit.about[0] ??
      `${UNIT_KIND[unit.kind].label} of the Eternal Sacred Order of the Cherubim & Seraphim.`,
  };
}

export default async function UnitLayout({ params, children }: LayoutProps<"/church/[slug]">) {
  const ctx = getUnitContext((await params).slug);
  const { unit, ancestors, parent, siblings, children: kids, tabs } = ctx;
  const siblingsLabel =
    parent && parent.slug !== "esocs"
      ? `Also in ${parent.name}`
      : `Other ${UNIT_KIND[unit.kind].plural.toLowerCase()}`;

  return (
    <div className="pb-8">
      <UnitHeader
        unit={unit}
        ancestors={ancestors}
        siblings={siblings.filter((s) => s.kind === unit.kind)}
        siblingsLabel={siblingsLabel}
      />
      <div className="mx-auto mt-6 grid max-w-wide gap-8 px-gutter lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail-right)]">
        <div className="grid min-w-0 content-start gap-6">
          <UnitTabs slug={unit.slug} tabs={tabs} />
          {children}
        </div>
        <aside
          aria-label={`About ${unit.name}`}
          className="grid content-start gap-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start"
        >
          <IntroCard unit={unit} parent={parent} childCount={kids.length} />
        </aside>
      </div>
      <div className="mx-auto mt-14 max-w-wide px-gutter">
        <Bridges items={unitBridges(unit)} />
      </div>
    </div>
  );
}
