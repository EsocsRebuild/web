import Link from "next/link";

import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { Unit } from "@/data/schema/content";
import { FollowButton } from "@/features/social/actions";
import { UNIT_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

export function PagesToFollow({ units }: { units: Unit[] }) {
  return (
    <ul className="grid gap-3">
      {units.map((u) => (
        <li key={u.slug} className="flex items-center gap-3">
          <Link href={routes.unit(u.slug)} tabIndex={-1} aria-hidden>
            <UnitAvatar name={u.name} kind={u.kind} image={u.avatar} size="sm" />
          </Link>
          <span className="grid min-w-0 flex-1">
            <Link
              href={routes.unit(u.slug)}
              className="truncate text-sm font-semibold hover:underline hover:underline-offset-4"
            >
              {u.slug === "esocs" ? "ESOCS Worldwide" : u.name}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              {u.tagline ?? UNIT_KIND[u.kind].label}
            </span>
          </span>
          <FollowButton
            slug={u.slug}
            name={u.slug === "esocs" ? "ESOCS Worldwide" : u.name}
            size="sm"
            className="min-w-0 px-3"
          />
        </li>
      ))}
    </ul>
  );
}
