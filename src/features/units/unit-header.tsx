import { CalendarCheck, MapPin, Navigation } from "lucide-react";

import { Cover } from "@/components/patterns/cover";
import { HierarchyTrail } from "@/components/patterns/hierarchy-trail";
import { KindBadge } from "@/components/patterns/kind-badge";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { Button } from "@/components/ui/button";
import type { Unit } from "@/data/schema/content";
import { FollowButton, ShareButton } from "@/features/social/actions";
import { MyChurchButton } from "@/features/social/my-church-button";
import { formatLongDate } from "@/lib/format";
import { COUNTRY_NAME } from "@/lib/kinds";
import { directionsUrl, routes } from "@/lib/routes";

const LOCAL_KINDS = new Set(["branch", "district", "headquarters"]);

/** Identity hero for every page: cover, avatar, name, place in the church, actions. */
export function UnitHeader({
  unit,
  ancestors,
  siblings,
  siblingsLabel,
}: {
  unit: Unit;
  ancestors: Unit[];
  siblings: Unit[];
  siblingsLabel: string;
}) {
  const where = unit.address ?? unit.locality;
  const isLocal = LOCAL_KINDS.has(unit.kind);
  const displayName = unit.name;

  return (
    <header className="mx-auto max-w-wide px-gutter pt-4 sm:pt-6">
      <Cover
        image={unit.cover}
        kind={unit.kind}
        priority
        kenBurns
        className={
          unit.cover ? "aspect-[16/9] rounded-panel sm:aspect-[21/8]" : "h-36 rounded-panel sm:h-52 lg:h-60"
        }
      />
      {/* Only the avatar overlaps the cover; everything readable sits on the page background. */}
      <div className="relative z-10 grid gap-4 px-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:px-6">
        <UnitAvatar
          name={unit.name}
          kind={unit.kind}
          image={unit.avatar}
          size="xl"
          className="-mt-14 shadow-lift ring-4 ring-background sm:-mt-16"
        />
        <div className="grid gap-5 sm:pt-4 lg:flex lg:items-end lg:justify-between">
          <div className="grid min-w-0 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={unit.kind} />
              {unit.established && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarCheck aria-hidden className="size-3.5" />
                  {unit.kind === "holy-order" ? "Founded" : "Dedicated"} {formatLongDate(unit.established)}
                </span>
              )}
            </div>
            <h1 className="font-display text-display-md font-extrabold text-balance">{displayName}</h1>
            {unit.tagline && <p className="text-muted-foreground">{unit.tagline}</p>}
            {where && (
              <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  {where}
                  {unit.country &&
                    unit.country !== "NG" &&
                    !where.includes(COUNTRY_NAME[unit.country]) &&
                    `, ${COUNTRY_NAME[unit.country]}`}
                </span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isLocal && where && (
              <Button asChild variant="accent" leftIcon={<Navigation />}>
                <a
                  href={directionsUrl(
                    [where, unit.country ? COUNTRY_NAME[unit.country] : ""].filter(Boolean).join(", "),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions
                </a>
              </Button>
            )}
            {(unit.kind === "branch" || unit.kind === "district") && (
              <MyChurchButton slug={unit.slug} name={unit.name} />
            )}
            <FollowButton slug={unit.slug} name={unit.name} />
            <ShareButton title={unit.name} path={routes.unit(unit.slug)} iconOnly />
          </div>
        </div>
      </div>
      {ancestors.length > 0 && (
        <HierarchyTrail
          ancestors={ancestors}
          current={unit}
          siblings={siblings}
          siblingsLabel={siblingsLabel}
          className="mt-5 px-1 sm:px-6"
        />
      )}
    </header>
  );
}
