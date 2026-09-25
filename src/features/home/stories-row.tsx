import Link from "next/link";

import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { Unit } from "@/data/schema/content";
import { routes } from "@/lib/routes";

/** Key pages at a glance, scrolling sideways on phones. */
export function StoriesRow({ units }: { units: Unit[] }) {
  return (
    <nav
      aria-label="Explore the church"
      className="-mx-gutter scrollbar-none overflow-x-auto px-gutter sm:mx-0 sm:px-0"
    >
      <ul className="flex snap-x gap-4 pb-1">
        {units.map((u) => (
          <li key={u.slug} className="snap-start">
            <Link
              href={routes.unit(u.slug)}
              className="group/story flex w-20 flex-col items-center gap-2 text-center"
            >
              <span className="rounded-panel p-[3px] ring-2 ring-accent/70 transition-transform duration-200 group-hover/story:scale-105">
                <UnitAvatar name={u.name} kind={u.kind} image={u.avatar} size="lg" />
              </span>
              <span className="line-clamp-2 text-xs leading-tight font-semibold">{shortName(u)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function shortName(u: Unit) {
  if (u.slug === "esocs") return "ESOCS Worldwide";
  return u.name
    .replace(/^National Headquarters Annex, /, "")
    .replace(/ House of Prayer$/, "")
    .replace(/^Mount Zion General Headquarters$/, "Mount Zion GHQ");
}
