import "server-only";

import { getContent } from "@/data/content";
import type { FeedQuery } from "@/data/repositories";
import type { Post, Unit } from "@/data/schema/content";

import type { FeedItem, FeedPage, UnitRef } from "./types";

const ref = (u: Unit): UnitRef => ({ slug: u.slug, name: u.name, kind: u.kind, avatar: u.avatar });

export function resolvePost(post: Post): FeedItem {
  const content = getContent();
  const publisher = content.getUnit(post.unitSlug);
  if (!publisher) throw new Error(`Post ${post.id} has unknown publisher ${post.unitSlug}`);
  return {
    post,
    publisher: ref(publisher),
    tagged: post.tags.flatMap((slug) => {
      const u = content.getUnit(slug);
      return u ? [ref(u)] : [];
    }),
  };
}

export function getFeedPage(query: FeedQuery): FeedPage {
  const page = getContent().getFeed(query);
  return { items: page.items.map(resolvePost), nextCursor: page.nextCursor };
}
