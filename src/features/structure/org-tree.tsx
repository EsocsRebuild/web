import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { KindBadge } from "@/components/patterns/kind-badge";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import type { UnitKind } from "@/data/schema/content";
import { routes } from "@/lib/routes";

export interface TreeNode {
  slug: string;
  name: string;
  kind: UnitKind;
  children: TreeNode[];
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
        <span className="truncate font-semibold">{node.name}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <KindBadge kind={node.kind} />
          {total > 0 && <span className="tabular">{total} within</span>}
        </span>
      </span>
    </span>
  );

  if (!node.children.length) {
    return (
      <li className="flex items-center gap-2 pl-7">
        {row}
        <Link
          href={routes.unit(node.slug)}
          className="shrink-0 rounded-control px-3 py-2 text-sm font-semibold text-highlight hover:bg-surface-muted"
        >
          Open<span className="sr-only"> {node.name}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className="relative">
      {/* The link sits beside the summary, never inside it: a summary is already a button. */}
      <Link
        href={routes.unit(node.slug)}
        className="absolute top-2.5 right-1 z-10 rounded-control px-3 py-2 text-sm font-semibold text-highlight hover:bg-surface-muted"
      >
        Open<span className="sr-only"> {node.name}</span>
      </Link>
      <details open={depth === 0} className="group/node">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-control pr-20 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <ChevronRight
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform group-open/node:rotate-90"
          />
          {row}
        </summary>
        <ul className="ml-3 grid border-l border-border pl-3">
          {node.children.map((c) => (
            <OrgTree key={c.slug} node={c} depth={depth + 1} />
          ))}
        </ul>
      </details>
    </li>
  );
}
