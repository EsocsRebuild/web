import type { ImageRef, Post, UnitKind } from "@/data/schema/content";

export interface UnitRef {
  slug: string;
  name: string;
  kind: UnitKind;
  avatar: ImageRef | null;
}

/** A post resolved for display: who published it and which pages it touches. */
export interface FeedItem {
  post: Post;
  publisher: UnitRef;
  tagged: UnitRef[];
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}
