import { describe, expect, it } from "vitest";

// The test checks redirect targets against real content, so it reads the seed directly.
// eslint-disable-next-line no-restricted-imports
import { buildSeedGraph } from "@/data/adapters/seed/build";

import { legacyRedirects } from "./redirects";

const graph = buildSeedGraph();

describe("legacy redirects", () => {
  it("has one rule per source", () => {
    const sources = legacyRedirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("points every detail redirect at content that exists", () => {
    const exists: Record<string, (slug: string) => boolean> = {
      leaders: (slug) => graph.people.some((p) => p.slug === slug),
      posts: (id) => graph.posts.some((p) => p.id === id),
      church: (slug) => graph.units.some((u) => u.slug === slug),
      albums: (slug) => graph.galleries.some((g) => g.slug === slug),
    };
    for (const { source, destination } of legacyRedirects) {
      const parts = destination.split("?")[0].split("/").filter(Boolean);
      // "/media/albums/x" checks the album; "/leaders/x", "/posts/x", "/church/x[/tab]" check the entity.
      const [section, slug] = parts[0] === "media" ? parts.slice(1) : parts;
      if (!slug || !exists[section]) continue;
      expect(exists[section](slug), `${source} → ${destination}`).toBe(true);
    }
  });

  it("covers every legacy leader, news item and album", () => {
    expect(legacyRedirects.filter((r) => r.source.startsWith("/pastors/"))).toHaveLength(
      graph.people.length - 1,
    );
    expect(legacyRedirects.filter((r) => r.source.startsWith("/gallery/"))).toHaveLength(
      graph.galleries.length,
    );
    expect(legacyRedirects.filter((r) => r.source.startsWith("/news/"))).toHaveLength(
      graph.posts.filter((p) => p.kind === "news").length,
    );
  });
});
