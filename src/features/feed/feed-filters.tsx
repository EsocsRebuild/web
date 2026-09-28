import Link from "next/link";

import { postKinds, type PostKind } from "@/data/schema/content";
import { POST_KIND } from "@/lib/kinds";
import { cn } from "@/lib/utils";

export function parseKind(value: string | string[] | undefined): PostKind | null {
  const v = Array.isArray(value) ? value[0] : value;
  return postKinds.includes(v as PostKind) ? (v as PostKind) : null;
}

/** Filter chips kept in the URL (`?type=`), so a filtered feed can be shared and survives refresh. */
export function FeedFilters({
  basePath,
  active,
  available,
  className,
}: {
  basePath: string;
  active: PostKind | null;
  /** Only kinds that have posts are offered. */
  available: PostKind[];
  className?: string;
}) {
  const chip =
    "inline-flex min-h-10 shrink-0 items-center rounded-pill border px-4 text-sm font-semibold transition-colors";
  const options: (PostKind | null)[] = [null, ...postKinds.filter((k) => available.includes(k))];

  return (
    <nav
      aria-label="Filter posts"
      className={cn("-mx-gutter scrollbar-none overflow-x-auto px-gutter sm:mx-0 sm:px-0", className)}
    >
      <ul className="flex gap-2">
        {options.map((kind) => {
          const selected = kind === active;
          return (
            <li key={kind ?? "all"}>
              <Link
                href={kind ? `${basePath}?type=${kind}` : basePath}
                scroll={false}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  chip,
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {kind ? POST_KIND[kind].plural : "All"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
