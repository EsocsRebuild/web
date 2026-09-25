import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Bridges } from "@/components/patterns/bridges";
import { PageIntro } from "@/components/patterns/page-intro";
import { getContent } from "@/data/content";
import { successionLabel } from "@/features/history/ordinal";
import { formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Baba Aladuras",
  description: "The succession of the Holy Order, from the founder Saint Moses Orimolade Tunolase to today.",
};

export default function LeadersPage() {
  const people = getContent().listPeople();
  return (
    <div className="mx-auto grid max-w-wide gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="The succession"
        title="The Baba Aladuras"
        description={`${people.length} shepherds have led the Holy Order since 1925. Each profile tells the story of a life and an era.`}
      />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p, i) => {
          const current = p.tenure.to === null;
          return (
            <Reveal
              as="li"
              key={p.slug}
              delay={(i % 3) * 70}
              className={cn(current && "sm:col-span-2 lg:col-span-3")}
            >
              <Link
                href={routes.leader(p.slug)}
                className={cn(
                  "group/leader grid h-full overflow-hidden rounded-panel border border-border bg-surface transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-lift",
                  current && "dark bg-inverse text-foreground md:grid-cols-[18rem_1fr]",
                )}
              >
                <span
                  className={cn(
                    "relative block aspect-[4/3] overflow-hidden bg-surface-sunken",
                    current && "md:aspect-auto md:min-h-72",
                  )}
                >
                  {p.portrait ? (
                    <Image
                      src={p.portrait.url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 400px, 100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover/leader:scale-[1.03]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center font-display text-5xl font-extrabold text-muted-foreground"
                    >
                      {initials(p.name)}
                    </span>
                  )}
                </span>
                <span className="grid content-end gap-1.5 p-5 sm:p-6">
                  <span className="text-overline font-semibold text-highlight uppercase">
                    {current ? "Today · " : ""}
                    {successionLabel(p.order)}
                  </span>
                  <span
                    className={cn(
                      "font-display leading-tight font-extrabold text-balance",
                      current ? "text-display-sm" : "text-xl",
                    )}
                  >
                    {p.honorific} {p.name}
                  </span>
                  <span className="text-sm text-muted-foreground tabular">{formatTenure(p.tenure)}</span>
                  {current && (
                    <span className="mt-2 line-clamp-3 max-w-xl leading-7 text-muted-foreground">
                      {p.bio[0]}
                    </span>
                  )}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
      <Bridges
        items={[
          { href: routes.history(), eyebrow: "1925 → today", title: "The history of the Order" },
          { href: routes.unit("esocs", "leaders"), eyebrow: "Who leads what", title: "The Advisory Board" },
        ]}
      />
    </div>
  );
}
