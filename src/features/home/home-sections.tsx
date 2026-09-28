import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { LogoMark } from "@/components/icons/logo";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { RailCard } from "@/components/shell/rails";
import { siteConfig } from "@/config/site";
import type { Organisation, Person, Unit } from "@/data/schema/content";
import { successionLabel } from "@/features/history/ordinal";
import { formatTenure } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Names short enough for a seal's caption or an index line. */
export function shortName(u: Unit) {
  if (u.slug === "esocs") return "ESOCS Worldwide";
  return u.name
    .replace(/^National Headquarters Annex, /, "")
    .replace(/ House of Prayer$/, "")
    .replace(/^Mount Zion General Headquarters$/, "Mount Zion GHQ");
}

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group/more inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover"
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover/more:translate-x-0.5" />
    </Link>
  );
}

/* Centre: the pages, then the chronicle -------------------------------- */

/** Every level of the Order as a seal, so a visitor sees the family before reading a word. */
export function SealsRow({ units }: { units: Unit[] }) {
  return (
    <section
      aria-labelledby="seals-heading"
      className="rounded-panel border border-border bg-surface px-4 pt-3 pb-4 sm:px-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="seals-heading" className="font-display text-[0.9375rem] font-bold">
          Pages of the Order
        </h2>
        <More href={routes.structure()}>How we’re organised</More>
      </div>
      <ul className="-mx-4 mt-2 scrollbar-none flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 sm:-mx-5 sm:scroll-px-5 sm:px-5">
        {units.map((u) => (
          <li key={u.slug} className="snap-start">
            <Link
              href={routes.unit(u.slug)}
              className="group/seal flex w-[5.25rem] flex-col items-center gap-2 rounded-card py-1 text-center"
            >
              <UnitAvatar
                name={u.name}
                kind={u.kind}
                image={u.avatar}
                size="lg"
                className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/seal:-translate-y-0.5"
              />
              <span className="text-xs leading-tight font-semibold text-balance text-foreground/85 group-hover/seal:text-foreground">
                {shortName(u)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Right: the watchword and prayer ------------------------------------- */

/** The year's watchword, set like scripture on a plate of the Order's navy. */
export function WatchwordPlate({ watchword }: { watchword: Organisation["watchword"] }) {
  return (
    <figure className="dark relative isolate overflow-hidden rounded-panel border border-white/10 bg-inverse px-6 pt-5 pb-6 text-foreground">
      <LogoMark className="absolute -right-6 -bottom-8 -z-10 size-36 text-white opacity-[0.06]" />
      <figcaption className="text-overline font-semibold text-highlight uppercase">Our watchword</figcaption>
      <blockquote className="mt-3 font-serif text-[1.5rem] leading-[1.25] text-balance italic">
        {watchword.text}
      </blockquote>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span aria-hidden className="h-px w-6 bg-gold-400/70" />
        {watchword.reference}
      </p>
    </figure>
  );
}

export function PrayerCard() {
  return (
    <RailCard title="Prayer and counsel">
      <ul className="grid gap-3 text-sm">
        {siteConfig.contact.phones.map((p) => (
          <li key={p.number} className="grid">
            <span className="text-xs text-muted-foreground">{p.label}</span>
            <a href={`tel:${p.number}`} className="font-semibold tabular hover:text-accent">
              {p.display}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <More href={routes.prayer()}>Send a private prayer request</More>
      </div>
    </RailCard>
  );
}

/* After the chronicle: the line of succession --------------------------- */

/** 1925 → today as a line: each shepherd hangs from a gold thread at the year they began. */
export function Succession({ people }: { people: Person[] }) {
  return (
    <section aria-labelledby="succession-heading" className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-wide gap-8 px-gutter py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="grid max-w-xl gap-2">
            <h2 id="succession-heading" className="font-display text-display-sm font-extrabold">
              The line of succession
            </h2>
            <p className="text-[0.9375rem] leading-7 text-muted-foreground">
              From Saint Moses Orimolade Tunolase to His Most Eminence today:{" "}
              <span className="font-serif text-[1.0625rem] italic">
                {people.length} shepherds of the Holy Order.
              </span>
            </p>
          </div>
          <More href={routes.history()}>Read the history</More>
        </div>

        <ol className="-mx-gutter scrollbar-none flex snap-x scroll-px-gutter overflow-x-auto px-gutter pb-2">
          {people.map((p, i) => (
            <li key={p.slug} className="relative w-44 shrink-0 snap-start pr-5">
              <div aria-hidden className="relative flex h-6 items-center">
                {i < people.length - 1 && (
                  <span className="absolute top-1/2 right-0 left-0 h-px bg-gold-400/60" />
                )}
                <span className="relative size-2.5 rounded-full bg-gold-500 ring-4 ring-surface" />
              </div>
              <Link href={routes.leader(p.slug)} className="group/leader mt-2 grid gap-2.5">
                <span className="text-sm font-semibold text-highlight tabular">{p.tenure.from}</span>
                <span className="relative block aspect-[4/5] overflow-hidden rounded-card bg-surface-sunken">
                  {p.portrait && (
                    <SmartImage
                      image={{ ...p.portrait, alt: "" }}
                      fill
                      frame={{ width: 4, height: 5 }}
                      sizes="176px"
                      quality={60}
                      className="object-cover object-top grayscale-[40%] transition-[filter,transform] duration-500 group-hover/leader:scale-[1.03] group-hover/leader:grayscale-0"
                    />
                  )}
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm leading-snug font-semibold group-hover/leader:text-accent">
                    {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {successionLabel(p.order)} · <span className="tabular">{formatTenure(p.tenure)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
