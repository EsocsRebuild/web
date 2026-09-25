import type { MetadataRoute } from "next";

import { getContent } from "@/data/content";
import { moreNav, primaryNav } from "@/config/navigation";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const content = getContent();
  const paths = [
    ...primaryNav.map((n) => n.href),
    ...moreNav.flatMap((g) => g.items.map((i) => i.href)),
    routes.calendar(),
    ...content.listUnits().map((u) => routes.unit(u.slug)),
    ...content
      .getFeed({ limit: 1000 })
      .items.filter((p) => !p.gallerySlug)
      .map((p) => routes.post(p.id)),
    ...content.listPeople().map((p) => routes.leader(p.slug)),
    ...content.listGalleries().map((g) => routes.album(g.slug)),
    ...content.listTours().map((t) => routes.tour(t.slug)),
    ...content.listEvents().map((e) => routes.event(e.slug)),
  ];
  return [...new Set(paths.map((p) => p.split("?")[0]))].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/church/") ? 0.8 : 0.6,
  }));
}
