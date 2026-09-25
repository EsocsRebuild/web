import type { Metadata } from "next";

import { Bridges } from "@/components/patterns/bridges";
import { UnitCard } from "@/components/patterns/cards";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { SectionsFeature } from "@/features/home/story-sections";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Our church family",
  description: "Women, Youth and the directorates that serve the Holy Order.",
};

export default function SectionsPage() {
  const content = getContent();
  const sections = content.listUnits({ kind: "section" });
  const directorates = content.listUnits({ kind: "directorate" });

  return (
    <div className="mx-auto grid max-w-wide gap-14 px-gutter py-10">
      <PageIntro
        eyebrow="Our church family"
        title="How the Order serves"
        description="Women and Youth have their own pages and community. Directorates carry the work of the Holy Order, each led by a Director."
      />
      <SectionsFeature sections={sections} />
      <section aria-labelledby="directorates-heading" className="grid gap-5">
        <SectionHeading
          id="directorates-heading"
          eyebrow="Directorates"
          title="The work of the Holy Order"
          description={`${directorates.length} directorates, each with its remit and Director.`}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {directorates.map((d) => (
            <li key={d.slug}>
              <UnitCard unit={d} parentName={d.leaders[0]?.name} />
            </li>
          ))}
        </ul>
      </section>
      <Bridges
        items={[
          { href: routes.unit("esocs", "leaders"), eyebrow: "Who leads what", title: "The Advisory Board" },
          { href: routes.structure(), eyebrow: "The levels", title: "How we're organised" },
        ]}
      />
    </div>
  );
}
