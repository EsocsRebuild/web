import type { MetadataRoute } from "next";

import { mainNav } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...mainNav.flatMap((i) => [i.href, ...(i.children?.map((c) => c.href) ?? [])])];
  return [...new Set(paths)].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
