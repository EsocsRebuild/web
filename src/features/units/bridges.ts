import "server-only";

import type { Bridge } from "@/components/patterns/bridges";
import { getContent } from "@/data/content";
import type { Unit } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

/** "Continue the story" for a page: up to its parent, across to siblings, onward to context. */
export function unitBridges(unit: Unit): Bridge[] {
  const content = getContent();
  const parent = unit.parentSlug ? content.getUnit(unit.parentSlug) : null;
  const siblings = parent ? content.getChildren(parent.slug).filter((s) => s.slug !== unit.slug) : [];
  const out: Bridge[] = [];

  if (parent && parent.slug !== "esocs") {
    out.push({
      href: routes.unit(parent.slug),
      eyebrow: `Its ${UNIT_KIND[parent.kind].label.toLowerCase()}`,
      title: parent.name,
    });
  }

  switch (unit.kind) {
    case "holy-order":
      out.push(
        {
          href: routes.history(),
          eyebrow: "Our story",
          title: "1925 to today",
          description: "How the Order grew, era by era.",
        },
        {
          href: routes.leaders(),
          eyebrow: "The succession",
          title: "The Baba Aladuras",
          description: "From the founder to His Most Eminence today.",
        },
        { href: routes.find(), eyebrow: "Near you", title: "Find a house of prayer" },
      );
      break;
    case "section":
      for (const s of content.listUnits({ kind: "section" }).filter((s) => s.slug !== unit.slug)) {
        out.push({
          href: routes.unit(s.slug),
          eyebrow: "Our church family",
          title: s.name,
          description: s.tagline ?? undefined,
        });
      }
      out.push({ href: routes.sections(), eyebrow: "How the Order serves", title: "Directorates" });
      break;
    case "directorate":
      out.push({ href: routes.sections(), eyebrow: "How the Order serves", title: "All directorates" });
      out.push({
        href: routes.unit("esocs", "leaders"),
        eyebrow: "Who leads what",
        title: "The Advisory Board",
      });
      break;
    case "headquarters":
      out.push(
        ...siblings
          .filter((s) => s.kind === "headquarters")
          .slice(0, 2)
          .map((s) => ({ href: routes.unit(s.slug), eyebrow: "Headquarters", title: s.name })),
      );
      out.push({ href: routes.history(), eyebrow: "Our story", title: "1925 to today" });
      break;
    case "cmc":
      out.push({
        href: routes.unit("esocs", "leaders"),
        eyebrow: "Who leads what",
        title: "The Advisory Board",
      });
      out.push({ href: routes.find({ kind: "cmc" }), eyebrow: "Regional councils", title: "All CMCs" });
      break;
    default:
      out.push(
        ...siblings.slice(0, 2).map((s) => ({
          href: routes.unit(s.slug),
          eyebrow: parent && parent.slug !== "esocs" ? `Also in ${parent.name}` : UNIT_KIND[s.kind].label,
          title: s.name,
        })),
      );
      out.push({ href: routes.find(), eyebrow: "Near you", title: "Find another house of prayer" });
  }
  return out.slice(0, 3);
}
