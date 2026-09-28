"use server";

import { postKinds, type PostKind } from "@/data/schema/content";

import { getFeedPage } from "./resolve";
import type { FeedPage } from "./types";

/** Next page of a feed, for "Show more". Inputs are validated: this is a public endpoint. */
export async function loadFeedPage(input: {
  cursor: string;
  kind?: string | null;
  unitSlug?: string | null;
  includeDescendants?: boolean;
  excludeIds?: string[];
}): Promise<FeedPage> {
  const cursor = /^[0-9a-z]{1,6}$/.test(input.cursor) ? input.cursor : null;
  const kind = postKinds.includes(input.kind as PostKind) ? (input.kind as PostKind) : undefined;
  const unitSlug = input.unitSlug && /^[a-z0-9-]{1,96}$/.test(input.unitSlug) ? input.unitSlug : undefined;
  const excludeIds = (input.excludeIds ?? []).filter((id) => /^[a-z0-9-]{1,96}$/.test(id)).slice(0, 5);
  return getFeedPage({
    cursor,
    kind,
    unitSlug,
    includeDescendants: !!input.includeDescendants,
    excludeIds,
    limit: 10,
  });
}
