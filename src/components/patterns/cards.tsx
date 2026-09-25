import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ImageRef, Leader, Unit } from "@/data/schema/content";
import { COUNTRY_NAME } from "@/lib/kinds";
import { routes } from "@/lib/routes";
import { cn, initials } from "@/lib/utils";

import { KindBadge } from "./kind-badge";
import { UnitAvatar } from "./unit-avatar";

/** A page in a list or grid: avatar, name, kind, where it is, where it sits. */
export function UnitCard({
  unit,
  parentName,
  className,
}: {
  unit: Unit;
  parentName?: string | null;
  className?: string;
}) {
  const where = unit.locality ?? (unit.country ? COUNTRY_NAME[unit.country] : null);
  return (
    <Link
      href={routes.unit(unit.slug)}
      className={cn(
        "group/unit flex h-full items-start gap-3.5 rounded-card border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-card",
        className,
      )}
    >
      <UnitAvatar name={unit.name} kind={unit.kind} image={unit.avatar} size="md" />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="leading-snug font-semibold text-balance group-hover/unit:text-highlight">
          {unit.name}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <KindBadge kind={unit.kind} />
          {where && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden className="size-3.5" />
              {where}
            </span>
          )}
        </span>
        {parentName && <span className="truncate text-xs text-subtle-foreground">{parentName}</span>}
      </span>
      <ArrowRight
        aria-hidden
        className="mt-1 size-4 shrink-0 text-subtle-foreground transition-transform group-hover/unit:translate-x-0.5"
      />
    </Link>
  );
}

/** A person holding a role. Links to their profile when they have one. */
export function LeaderCard({
  leader,
  portrait,
  className,
}: {
  leader: Leader;
  portrait?: ImageRef | null;
  className?: string;
}) {
  const body = (
    <>
      <span className="relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-sunken font-display text-sm font-bold text-muted-foreground">
        {portrait ? (
          <Image src={portrait.url} alt="" fill sizes="48px" className="object-cover object-top" />
        ) : (
          <span aria-hidden>{initials(leader.name)}</span>
        )}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className="leading-snug font-semibold text-balance">{leader.name}</span>
        <span className="text-sm leading-5 text-muted-foreground">{leader.role}</span>
      </span>
    </>
  );
  const base = "flex items-start gap-3 rounded-card p-3";
  return leader.personSlug ? (
    <Link
      href={routes.leader(leader.personSlug)}
      className={cn(base, "transition-colors hover:bg-surface-muted", className)}
    >
      {body}
    </Link>
  ) : (
    <div className={cn(base, className)}>{body}</div>
  );
}
