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
        {parentName && <span className="text-xs text-subtle-foreground">{parentName}</span>}
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
  const isChairman = /chairman/i.test(leader.role) && !/vice/i.test(leader.role);
  const body = (
    <div className="flex items-center gap-3.5">
      <span
        className={cn(
          "relative inline-flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-sm font-bold shadow-xs transition-all",
          isChairman
            ? "bg-royal-950 text-gold-300 ring-2 ring-gold-400/50"
            : "bg-surface-sunken text-foreground/80 ring-1 ring-border",
        )}
      >
        {portrait ? (
          <Image src={portrait.url} alt="" fill sizes="52px" className="object-cover object-top" />
        ) : (
          <span aria-hidden>{initials(leader.name)}</span>
        )}
      </span>
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="inline-flex w-fit max-w-full items-center gap-1 truncate rounded-full bg-gold-400/10 px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase ring-1 ring-gold-400/30 dark:text-gold-300">
          {leader.role}
        </span>
        <span className="font-display text-sm leading-snug font-bold text-balance text-foreground">
          {leader.name}
        </span>
      </span>
    </div>
  );
  const base =
    "flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs transition-all duration-300";
  return leader.personSlug ? (
    <Link
      href={routes.leader(leader.personSlug)}
      className={cn(base, "hover:border-gold-500/40 hover:bg-surface-muted/50 hover:shadow-md", className)}
    >
      {body}
    </Link>
  ) : (
    <div className={cn(base, "hover:border-border-strong hover:shadow-xs", className)}>{body}</div>
  );
}
