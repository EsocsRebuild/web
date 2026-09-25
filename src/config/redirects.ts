/**
 * Permanent redirects from the legacy esocs.net URLs. Detail pages on the old site
 * used WordPress post IDs (confirmed in its JavaScript bundle), so each ID maps to
 * the new slug exactly. See docs/ux/01-information-architecture.md §5.
 */

export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: true;
}

const LEADERS: Record<number, string> = {
  409: "gabriel-adebowale-ogunyadi",
  414: "josiah-soyemi-olugbusi-ajagungbade",
  416: "samuel-amodu-adewunmi",
  419: "moses-orimolade-tunolase",
  546: "abraham-williams-onanuga",
  672: "godfrey-itse-mene-otubu",
  673: "emmanuel-oludotun-okeyemi",
  722: "lazarus-anuba-onyeleonu",
};

const NEWS: Record<number, string> = {
  333: "news-pre-event-sensitization-and-mobilization",
  393: "news-official-launch-of-centenary-celebration",
};

const ALBUMS: Record<number, string> = {
  861: "children-2025-christmas-party",
  867: "adoption-thanksgiving-service",
  1364: "childrens-day-celebration",
  1461: "st-moses-orimolade-tunolase-annual-memorial-lecture",
  1536: "100th-anniversary-celebration",
};

/** Legacy events carried wrong dates; the church calendar now computes them. */
const EVENTS = [841, 869, 871, 873, 875, 877];

const to = (source: string, destination: string): LegacyRedirect => ({
  source,
  destination,
  permanent: true,
});

export const legacyRedirects: LegacyRedirect[] = [
  to("/about", "/church/esocs"),
  to("/about/history", "/history"),
  to("/about/advisory-board", "/church/esocs/leaders"),
  to("/about/esocs-directorate", "/sections"),
  to("/about/provinces", "/find?kind=province"),
  to("/about/CMCs", "/find?kind=cmc"),
  to("/about/cmcs", "/find?kind=cmc"),
  to("/about/calendar", "/calendar"),
  to("/pastors", "/leaders"),
  ...Object.entries(LEADERS).map(([id, slug]) => to(`/pastors/${id}`, `/leaders/${slug}`)),
  ...Object.entries(NEWS).map(([id, postId]) => to(`/news/${id}`, `/posts/${postId}`)),
  to("/gallery", "/media"),
  ...Object.entries(ALBUMS).map(([id, slug]) => to(`/gallery/${id}`, `/media/albums/${slug}`)),
  ...EVENTS.map((id) => to(`/events/${id}`, "/calendar")),
  to("/giving", "/give"),
  to("/contact-us", "/contact"),
  to("/service-times", "/find"),
  to("/videos", "/media/videos"),
  to("/women", "/church/women"),
  to("/youth", "/church/youth"),
];
