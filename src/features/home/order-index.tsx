import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Crown,
  History,
  Landmark,
  Network,
  Route,
  ScrollText,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { Unit } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { RailSearch, YourChurchCard, type ChurchNames } from "./order-index-client";

/*
 * The index of the Order down the left of wide screens, built so nobody gets lost:
 * - it follows the reader down the page, so the way around is always in reach;
 * - it is ordered by what people come for: their own church, then the headquarters,
 *   the church family, the councils, and the story of the Order;
 * - every row says in plain words where it leads (a name and a place, never bare
 *   initials or numbers), and church terms are explained where they appear;
 * - search is the way out at the bottom when the index doesn't have it.
 */

/** The headquarters in the order a member would name them, seat of the Order first. */
const HQ_ORDER = [
  "mount-zion-general-headquarters",
  "national-headquarters",
  "national-headquarters-annex-abuja",
  "memorial-holy-temple",
  "london-cathedral",
];

const HQ_NAMES: Record<string, string> = {
  "mount-zion-general-headquarters": "Mount Zion GHQ",
  "national-headquarters-annex-abuja": "National HQ Annex",
  "memorial-holy-temple": "Memorial Holy Temple",
};

const FAMILY_DETAIL: Record<string, string> = {
  women: "Women’s Affairs",
  youth: "Mount Zion Youth Society",
};

const STORY: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "History of the Order", href: routes.history(), icon: History },
  { label: "The Baba Aladuras", href: routes.leaders(), icon: Crown },
  { label: "Pastoral tours", href: routes.tours(), icon: Route },
  { label: "Ordinations & ranks", href: routes.ordinations(), icon: Sparkles },
  { label: "Words we use", href: routes.glossary(), icon: BookOpen },
];

function Group({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-1.5">
      <h2 id={id} className="px-2 text-overline font-semibold text-subtle-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Tile({ icon: Icon, colour }: { icon: LucideIcon; colour: string }) {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted"
      style={{ color: colour }}
    >
      <Icon className="size-[1.125rem]" />
    </span>
  );
}

const rowClass =
  "group/row flex min-h-12 items-center gap-3 rounded-control px-2 py-1.5 transition-colors hover:bg-surface-muted";

/** One destination: what it is, where it is, and a chevron that says "this goes somewhere". */
function Row({
  href,
  visual,
  label,
  detail,
}: {
  href: string;
  visual: React.ReactNode;
  label: string;
  detail?: string | null;
}) {
  return (
    <li>
      <Link href={href} className={rowClass}>
        {visual}
        <span className="grid min-w-0 flex-1">
          <span className="text-sm leading-snug font-semibold text-foreground/90 group-hover/row:text-foreground">
            {label}
          </span>
          {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        </span>
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-subtle-foreground opacity-0 transition-[opacity,transform] group-hover/row:translate-x-0.5 group-hover/row:opacity-100 group-focus-visible/row:opacity-100"
        />
      </Link>
    </li>
  );
}

export function OrderIndex({
  root,
  headquarters,
  sections,
  cmcs,
  churches,
  reach,
}: {
  root: Unit;
  headquarters: Unit[];
  sections: Unit[];
  cmcs: Unit[];
  churches: ChurchNames;
  /** e.g. "140 churches · 6 countries", so the finder promises something real. */
  reach: string;
}) {
  const rank = (slug: string) => {
    const i = HQ_ORDER.indexOf(slug);
    return i === -1 ? HQ_ORDER.length : i;
  };
  const hqs = [...headquarters].sort((a, b) => rank(a.slug) - rank(b.slug));
  const hq = "var(--color-kind-headquarters)";
  const family = "var(--color-kind-section)";
  const cmc = "var(--color-kind-cmc)";

  return (
    <nav
      aria-label="Find your way around"
      className="hidden xl:sticky xl:top-[calc(var(--spacing-header)+1.5rem)] xl:scrollbar-none xl:grid xl:max-h-[calc(100dvh-var(--spacing-header)-3rem)] xl:content-start xl:gap-5 xl:self-start xl:overflow-y-auto xl:overscroll-contain"
    >
      <YourChurchCard churches={churches} reach={reach} />

      <Group title="Headquarters" id="index-hq">
        <ul>
          {hqs.map((u) => (
            <Row
              key={u.slug}
              href={routes.unit(u.slug)}
              visual={<Tile icon={Landmark} colour={hq} />}
              label={HQ_NAMES[u.slug] ?? u.name}
              detail={u.locality}
            />
          ))}
        </ul>
      </Group>

      <Group title="Church family" id="index-family">
        <ul>
          {sections.map((u) => (
            <Row
              key={u.slug}
              href={routes.unit(u.slug)}
              visual={<Tile icon={UsersRound} colour={family} />}
              label={u.name}
              detail={FAMILY_DETAIL[u.slug] ?? u.tagline}
            />
          ))}
          <Row
            href={routes.sections()}
            visual={<Tile icon={ScrollText} colour={family} />}
            label="Directorates"
            detail="Departments of the Order"
          />
        </ul>
      </Group>

      <Group title="Regional councils" id="index-cmc">
        {/* Twelve numbers mean nothing on their own, so they wait behind a plain-words row. */}
        <details className="group/cmc">
          <summary className={cn(rowClass, "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
            <Tile icon={Network} colour={cmc} />
            <span className="grid min-w-0 flex-1">
              <span className="text-sm leading-snug font-semibold">Church councils</span>
              <span className="text-xs text-muted-foreground">CMC 1 to {cmcs.length}, by region</span>
            </span>
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-subtle-foreground transition-transform group-open/cmc:rotate-180"
            />
          </summary>
          <div className="grid gap-2 px-2 pt-2 pb-1">
            <ul className="grid grid-cols-3 gap-1.5">
              {cmcs.map((u) => {
                const chair = u.leaders.find((l) => l.role === "Chairman");
                return (
                  <li key={u.slug}>
                    <Link
                      href={routes.unit(u.slug)}
                      title={chair ? `${u.name} · Chairman: ${chair.name}` : u.name}
                      className="flex min-h-9 items-center justify-center rounded-control border border-border bg-surface text-xs font-semibold whitespace-nowrap text-foreground/85 tabular transition-colors hover:border-kind-cmc hover:text-foreground"
                    >
                      {u.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs leading-5 text-muted-foreground">
              Each council groups provinces in one region.{" "}
              <Link
                href={routes.glossary("cmc")}
                className="font-semibold text-accent hover:text-accent-hover"
              >
                What is a CMC?
              </Link>
            </p>
          </div>
        </details>
        <ul>
          <Row
            href={routes.structure()}
            visual={<Tile icon={Network} colour="var(--color-kind-province)" />}
            label="How we’re organised"
            detail="From the Order to your branch"
          />
        </ul>
      </Group>

      <Group title="Our story" id="index-story">
        <ul>
          <Row
            href={routes.unit(root.slug)}
            visual={<UnitAvatar name={root.name} kind={root.kind} image={root.avatar} size="sm" />}
            label="Who we are"
            detail="The worldwide Order"
          />
          {STORY.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={cn(rowClass, "min-h-10 py-0.5")}>
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
                >
                  <l.icon className="size-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground/85 group-hover/row:text-foreground">
                  {l.label}
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-subtle-foreground opacity-0 transition-[opacity,transform] group-hover/row:translate-x-0.5 group-hover/row:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Group>

      <RailSearch />
    </nav>
  );
}
