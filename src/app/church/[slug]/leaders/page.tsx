import { notFound } from "next/navigation";

import { LeaderCard } from "@/components/patterns/cards";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { getUnitContext, hasTab, staticParamsForTab } from "@/features/units/unit-context";

export const dynamicParams = false;

export function generateStaticParams() {
  return staticParamsForTab("leaders");
}

export default async function UnitLeadersPage({ params }: PageProps<"/church/[slug]">) {
  const ctx = getUnitContext((await params).slug);
  if (!hasTab(ctx, "leaders")) notFound();
  const { unit } = ctx;
  const people = getContent().listPeople();

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={unit.slug === "esocs" ? "The Advisory Board" : `${unit.name} Leadership`}
        description={
          unit.slug === "esocs"
            ? "The governing council of the Holy Order, chaired by His Most Eminence, in the order the church lists them."
            : `Executive leaders, chairmen, and officers of ${unit.name}.`
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {unit.leaders.map((l) => (
          <li key={`${l.name}-${l.role}`}>
            <LeaderCard
              leader={l}
              portrait={l.personSlug ? people.find((p) => p.slug === l.personSlug)?.portrait : null}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
