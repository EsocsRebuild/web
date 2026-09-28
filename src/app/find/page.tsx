import { Globe2, Network } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { UnitCard } from "@/components/patterns/cards";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { unitKinds, type UnitKind } from "@/data/schema/content";
import { FindExplorer, type FinderUnit } from "@/features/find/find-explorer";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Find a Church",
  description: "Find an ESOCS house of prayer, province or headquarters, in Nigeria and around the world.",
};

export default async function FindPage({ searchParams }: PageProps<"/find">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const content = getContent();
  const all = content.listUnits().filter((u) => u.kind !== "holy-order");
  const names = new Map(content.listUnits().map((u) => [u.slug, u.name]));

  const units: FinderUnit[] = all.map((u) => ({
    slug: u.slug,
    name: u.name,
    kind: u.kind,
    locality: u.locality,
    address: u.address,
    country: u.country,
    parentName: u.parentSlug && u.parentSlug !== "esocs" ? (names.get(u.parentSlug) ?? null) : null,
  }));
  const kind = unitKinds.includes(one(sp.kind) as UnitKind) ? (one(sp.kind) as UnitKind) : null;
  const country = /^[A-Z]{2}$/.test(one(sp.country)) ? one(sp.country) : null;
  const international = all.filter(
    (u) =>
      u.country &&
      u.country !== "NG" &&
      ["branch", "headquarters", "province", "special-area"].includes(u.kind),
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Find a Church"
        title="There's a house of prayer near you"
        description="Search by town, province or name. Every result opens its page, with directions where an address is recorded."
      />
      <FindExplorer units={units} initial={{ q: one(sp.q).slice(0, 80), kind, country }} />

      <section aria-labelledby="world-heading" className="grid gap-4">
        <SectionHeading
          id="world-heading"
          eyebrow="Worldwide"
          title="Beyond Nigeria"
          description="Congregations and provinces in the United Kingdom, the United States, Canada and Belgium."
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {international.map((u) => (
            <li key={u.slug}>
              <UnitCard unit={u} />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={routes.structure()}
          className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 hover:border-border-strong"
        >
          <Network aria-hidden className="size-7 text-highlight" />
          <span className="grid">
            <span className="font-display text-lg font-extrabold">How we&apos;re organised</span>
            <span className="text-sm text-muted-foreground">From the Holy Order to your house of prayer</span>
          </span>
        </Link>
        <p className="flex items-start gap-4 rounded-card bg-surface-muted p-5 text-sm leading-6 text-muted-foreground">
          <Globe2 aria-hidden className="mt-0.5 size-6 shrink-0 text-muted-foreground" />
          The full directory of provinces and branches is being added. A map view will appear once locations
          are confirmed.
        </p>
      </div>
    </div>
  );
}
