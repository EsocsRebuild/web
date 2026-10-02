import { getContent } from "@/data/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

import { AnnouncementsClient, type AnnouncementItem } from "./announcements-client";

/** The announcement ticker under the top bar or in hero footer, built from live content only. */
export function Announcements({ variant = "bar" }: { variant?: "bar" | "hero" }) {
  const content = getContent();
  const org = content.getOrganisation();
  const next = content.listEvents().slice(0, 2);
  const latest = content.getFeed({ limit: 1 }).items[0];

  const items: AnnouncementItem[] = [
    {
      id: "watchword",
      category: "watchword",
      label: "Watchword",
      title: org.watchword.text,
      subtitle: org.watchword.reference,
    },
    ...next.map((e) => ({
      id: e.slug,
      category: "event" as const,
      label: "Coming up",
      title: e.title,
      subtitle: formatLongDate(e.date),
      href: routes.event(e.slug),
    })),
    ...(latest
      ? [
          {
            id: latest.id,
            category: "latest" as const,
            label: "Latest",
            title: latest.title,
            href: routes.post(latest.id),
          },
        ]
      : []),
    {
      id: "find",
      category: "worldwide",
      label: "Worldwide",
      title: "Find a house of prayer near you",
      subtitle: "Over 500 parishes",
      href: routes.find(),
    },
  ];

  return <AnnouncementsClient items={items} variant={variant} />;
}
