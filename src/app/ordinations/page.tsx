import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Bridges } from "@/components/patterns/bridges";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { EmptyState } from "@/components/patterns/states";
import { Timeline } from "@/components/patterns/timeline";
import { GLOSSARY } from "@/config/glossary";
import { getContent } from "@/data/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Ordinations & ranks",
  description: "The ranks and titles of the Holy Order, and ordinations recorded by year.",
};

export default function OrdinationsPage() {
  const ordinations = getContent().listOrdinations();
  const ranks = GLOSSARY.filter((g) => g.group === "Ranks and titles");

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Ordinations & ranks"
        title="Called to serve"
        description="The titles the Holy Order confers, and the ordinations recorded so far."
      />

      <section aria-labelledby="ranks-heading" className="grid gap-5">
        <SectionHeading
          id="ranks-heading"
          title="Ranks and titles"
          description="Shown alphabetically until the church confirms the order of seniority."
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {[...ranks]
            .sort((a, b) => a.term.localeCompare(b.term))
            .map((r) => (
              <li
                key={r.id}
                id={r.id}
                className="grid content-start gap-2 rounded-card border border-border bg-surface p-5"
              >
                <span className="font-display text-lg font-extrabold">{r.term}</span>
                <span className="text-sm leading-6 text-muted-foreground">{r.text}</span>
                {!r.confirmed && (
                  <span className="text-xs font-semibold text-warning">
                    Awaiting the church&apos;s definition
                  </span>
                )}
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="ceremonies-heading" className="grid gap-5">
        <SectionHeading id="ceremonies-heading" title="Ordinations" />
        <Timeline
          entries={ordinations.map((o) => ({ key: o.slug, date: o.date, title: o.title, meta: o.summary }))}
        />
        <EmptyState compact icon={Sparkles} title="More ordinations are being added">
          Annual ordination lists will appear here by year as the church publishes them.
        </EmptyState>
      </section>

      <Bridges
        items={[
          { href: routes.unit("esocs", "leaders"), eyebrow: "Who leads what", title: "The Advisory Board" },
          { href: routes.glossary(), eyebrow: "Church terms", title: "Glossary" },
        ]}
      />
    </div>
  );
}
