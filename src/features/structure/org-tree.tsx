import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

import { KindBadge } from "@/components/patterns/kind-badge";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { UnitKind } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface TreeNode {
  slug: string;
  name: string;
  kind: UnitKind;
  children: TreeNode[];
}

/** "Open" beside each level; a compact arrow on phones, the word on wider screens. */
function OpenLink({ slug, name, className }: { slug: string; name: string; className?: string }) {
  return (
    <Link
      href={routes.unit(slug)}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-control text-sm font-semibold text-highlight hover:bg-surface-muted sm:size-auto sm:px-3 sm:py-2",
        className,
      )}
    >
      <ArrowRight aria-hidden className="size-4 sm:hidden" />
      <span className="max-sm:sr-only">Open</span>
      <span className="sr-only"> {name}</span>
    </Link>
  );
}

const count = (n: TreeNode): number => n.children.reduce((sum, c) => sum + 1 + count(c), 0);

/**
 * The organisation as an expandable tree, built on native <details> so it works
 * with keyboard and screen readers without script. The first level starts open.
 */
export function OrgTree({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const total = count(node);
  const row = (
    <span className="flex min-h-12 flex-1 items-center gap-3 py-1.5">
      <UnitAvatar name={node.name} kind={node.kind} size="sm" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="font-semibold text-pretty [overflow-wrap:anywhere]">{node.name}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <KindBadge kind={node.kind} />
          {total > 0 && <span className="tabular">{total} within</span>}
        </span>
      </span>
    </span>
  );

  if (!node.children.length) {
    return (
      <li className="flex items-center gap-1 pl-7 sm:gap-2">
        {row}
        <OpenLink slug={node.slug} name={node.name} className="shrink-0" />
      </li>
    );
  }

  return (
    <li className="relative">
      {/* The link sits beside the summary, never inside it: a summary is already a button. */}
      <OpenLink
        slug={node.slug}
        name={node.name}
        className="absolute top-1 right-0 z-10 sm:top-2.5 sm:right-1"
      />
      <details open={depth === 0} className="group/node">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-control pr-11 hover:bg-surface-muted sm:pr-20 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform group-open/node:rotate-90"
          />
          {row}
        </summary>
        <ul className="ml-2 grid grid-cols-1 border-l border-border pl-1.5 sm:ml-3 sm:pl-3">
          {node.children.map((c) => (
            <OrgTree key={c.slug} node={c} depth={depth + 1} />
          ))}
        </ul>
      </details>
    </li>
  );
}
