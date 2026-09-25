import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { GLOSSARY, type GlossaryEntry } from "@/config/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Church terms explained: Baba Aladura, CMC, provinces, ranks and more.",
};

const GROUPS: GlossaryEntry["group"][] = [
  "Leadership",
  "Structure",
  "Ranks and titles",
  "Life of the church",
];

export default function GlossaryPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Glossary"
        title="Church terms, explained"
        description="The words the Holy Order uses, in plain English. Entries marked as awaiting a definition show only what the church's records say."
      />
      {GROUPS.map((group) => (
        <section key={group} aria-labelledby={`g-${group}`} className="grid gap-4">
          <h2 id={`g-${group}`} className="font-display text-xl font-extrabold">
            {group}
          </h2>
          <dl className="grid divide-y divide-border rounded-panel border border-border bg-surface">
            {GLOSSARY.filter((g) => g.group === group).map((g) => (
              <div
                key={g.id}
                id={g.id}
                className="grid scroll-mt-28 gap-1 px-5 py-4 target:bg-accent-soft sm:grid-cols-[14rem_1fr] sm:gap-6"
              >
                <dt className="font-semibold">{g.term}</dt>
                <dd className="grid gap-1 text-muted-foreground">
                  <span className="leading-7">{g.text}</span>
                  {!g.confirmed && (
                    <span className="text-xs font-semibold text-warning">
                      Awaiting the church&apos;s definition
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
