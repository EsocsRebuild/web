import { MapPin, Phone, Users } from "lucide-react";
import Link from "next/link";

import { RailCard } from "@/components/shell/rails";
import { siteConfig } from "@/config/site";
import type { Unit } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { COUNTRY_NAME, UNIT_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

/** Kinds that are physical places, where missing contact details are worth explaining. */
const PLACE_KINDS = new Set(["headquarters", "province", "special-area", "district", "branch"]);

/** The page at a glance: where, who, how to reach it. */
export function IntroCard({
  unit,
  parent,
  childCount,
}: {
  unit: Unit;
  parent: Unit | null;
  childCount: number;
}) {
  const phones = unit.phones.length
    ? unit.phones.map((n) => ({
        number: n,
        display: n.replace(/^\+234(\d{3})(\d{3})(\d{4})$/, "+234 $1 $2 $3"),
      }))
    : [];
  const where = unit.address ?? unit.locality;

  return (
    <RailCard title="At a glance">
      <dl className="grid gap-4 text-sm">
        {unit.about[0] && (
          <div>
            <dt className="sr-only">About</dt>
            <dd className="line-clamp-4 leading-6 text-muted-foreground">{unit.about[0]}</dd>
          </div>
        )}
        {where && (
          <div className="flex gap-2.5">
            <dt>
              <MapPin aria-label="Address" className="mt-0.5 size-4 text-muted-foreground" />
            </dt>
            <dd>
              {where}
              {unit.country && unit.country !== "NG" && (
                <span className="block text-muted-foreground">{COUNTRY_NAME[unit.country]}</span>
              )}
            </dd>
          </div>
        )}
        {phones.map((p) => (
          <div key={p.number} className="flex gap-2.5">
            <dt>
              <Phone aria-label="Phone" className="mt-0.5 size-4 text-muted-foreground" />
            </dt>
            <dd>
              <a href={`tel:${p.number}`} className="font-semibold tabular hover:text-highlight">
                {p.display}
              </a>
            </dd>
          </div>
        ))}
        {childCount > 0 && (
          <div className="flex gap-2.5">
            <dt>
              <Users aria-label="Includes" className="mt-0.5 size-4 text-muted-foreground" />
            </dt>
            <dd>
              <Link href={routes.unit(unit.slug, "branches")} className="font-semibold hover:text-highlight">
                {childCount} {childCount === 1 ? "page" : "pages"} in this{" "}
                {UNIT_KIND[unit.kind].label.toLowerCase()}
              </Link>
            </dd>
          </div>
        )}
        {unit.established && (
          <div>
            <dt className="text-xs text-subtle-foreground">
              {unit.kind === "holy-order" ? "Founded" : "Dedicated"}
            </dt>
            <dd className="font-semibold">{formatLongDate(unit.established)}</dd>
          </div>
        )}
        {parent && (
          <div>
            <dt className="text-xs text-subtle-foreground">Part of</dt>
            <dd>
              <Link href={routes.unit(parent.slug)} className="font-semibold hover:text-highlight">
                {parent.slug === "esocs" ? "ESOCS Worldwide" : parent.name}
              </Link>
            </dd>
          </div>
        )}
        {!where && !phones.length && PLACE_KINDS.has(unit.kind) && (
          <div className="rounded-control bg-surface-muted p-3 text-xs leading-5 text-muted-foreground">
            Contact details for this page are being gathered. For now, call the general line on{" "}
            <a
              href={`tel:${siteConfig.contact.phones[0].number}`}
              className="font-semibold text-foreground tabular"
            >
              {siteConfig.contact.phones[0].display}
            </a>
            .
          </div>
        )}
      </dl>
    </RailCard>
  );
}
