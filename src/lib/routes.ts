/**
 * Every URL in the platform, built in one place so components never hand-write
 * paths. Labels and URLs are provisional until the P1 tree test confirms them.
 */

export const unitTabs = ["about", "branches", "leaders", "photos", "events"] as const;
export type UnitTab = (typeof unitTabs)[number];

const enc = encodeURIComponent;

function withQuery(path: string, query: Record<string, string | undefined | null>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const routes = {
  home: () => "/",

  // Find a Church
  find: (query: { q?: string; kind?: string; country?: string; view?: "list" | "map" } = {}) =>
    withQuery("/find", query),
  structure: () => "/structure",
  unit: (slug: string, tab?: UnitTab) => `/church/${enc(slug)}${tab ? `/${tab}` : ""}`,

  sections: () => "/sections",

  // Publishing
  news: (category?: string) => (category ? `/news/category/${enc(category)}` : "/news"),
  post: (id: string) => `/posts/${enc(id)}`,

  // Time
  events: () => "/events",
  event: (slug: string) => `/events/${enc(slug)}`,
  calendar: (month?: string) => withQuery("/calendar", { month }),
  tours: () => "/tours",
  tour: (slug: string) => `/tours/${enc(slug)}`,
  ordinations: () => "/ordinations",

  // Story of the Order
  leaders: () => "/leaders",
  leader: (slug: string) => `/leaders/${enc(slug)}`,
  history: () => "/history",
  glossary: (term?: string) => `/glossary${term ? `#${enc(term)}` : ""}`,

  // Media
  media: () => "/media",
  album: (slug: string) => `/media/albums/${enc(slug)}`,
  videos: () => "/media/videos",
  radio: () => "/media/radio",

  search: (q?: string) => withQuery("/search", { q }),
  give: () => "/give",
  prayer: () => "/prayer",
  contact: () => "/contact",

  // Members
  signIn: (next?: string) => withQuery("/sign-in", { next }),
  onboarding: () => "/onboarding",
  me: () => "/me",
  saved: () => "/me/saved",
  following: () => "/me/following",
  notifications: () => "/notifications",
  settings: () => "/settings",
} as const;

/** Opens the device's maps app with directions to an address. */
export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(address)}`;
}
