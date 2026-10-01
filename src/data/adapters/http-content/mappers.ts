import type { ChurchEvent, ImageRef, Leader, Post, PostKind, Unit, UnitKind } from "../../schema/content";

export interface BackendUnitResponse {
  id?: string;
  slug: string;
  kind: string;
  name: string;
  parentSlug?: string | null;
  tagline?: string | null;
  about?: string[];
  locality?: string | null;
  address?: string | null;
  country?: string | null;
  established?: string | null;
  cover?: ImageRef | null;
  avatar?: ImageRef | null;
  leaders?: Array<{ name: string; role: string; personSlug?: string }>;
  phones?: string[];
}

export interface BackendPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: unknown;
  coverImageUrl?: string | null;
  authorName?: string | null;
  category?: string | null;
  tags?: string[];
  isFeatured?: boolean;
  publishedAt?: string | null;
}

export interface BackendEventResponse {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  date?: string;
  startTime?: string | null;
  unitSlug?: string;
  imageUrl?: string | null;
}

export function mapBackendUnit(raw: BackendUnitResponse): Unit {
  const leaders: Leader[] = (raw.leaders ?? []).map((l) => ({
    name: l.name,
    role: l.role,
    ...(l.personSlug ? { personSlug: l.personSlug } : {}),
  }));

  const kind = (raw.kind?.toLowerCase() ?? "branch") as UnitKind;

  return {
    slug: raw.slug,
    kind,
    name: raw.name,
    parentSlug: raw.parentSlug ?? null,
    tagline: raw.tagline ?? null,
    about: Array.isArray(raw.about) ? raw.about : [],
    locality: raw.locality ?? null,
    address: raw.address ?? null,
    country: raw.country ?? null,
    established: raw.established ? raw.established.slice(0, 10) : null,
    cover: raw.cover ?? null,
    avatar: raw.avatar ?? null,
    leaders,
    phones: Array.isArray(raw.phones) ? raw.phones : [],
  };
}

export function mapBackendPost(raw: BackendPostResponse): Post {
  let body: string[] = [];
  if (Array.isArray(raw.body)) {
    body = raw.body.map(String);
  } else if (typeof raw.body === "string") {
    body = [raw.body];
  } else if (raw.excerpt) {
    body = [raw.excerpt];
  }

  const validKinds: PostKind[] = ["news", "message", "dedication", "album", "milestone"];
  const categoryLower = raw.category?.toLowerCase() ?? "news";
  const kind: PostKind = validKinds.includes(categoryLower as PostKind)
    ? (categoryLower as PostKind)
    : "news";

  const images: ImageRef[] = [];
  if (raw.coverImageUrl) {
    images.push({
      url: raw.coverImageUrl,
      width: null,
      height: null,
      alt: raw.title,
    });
  }

  const date = raw.publishedAt ? raw.publishedAt.slice(0, 10) : null;

  return {
    id: raw.slug || raw.id,
    kind,
    unitSlug: "esocs",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    title: raw.title,
    body,
    date,
    images,
  };
}

export function mapBackendEvent(raw: BackendEventResponse): ChurchEvent {
  const date = raw.date
    ? raw.date.slice(0, 10)
    : raw.startsAt
      ? raw.startsAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  const endDate = raw.endsAt ? raw.endsAt.slice(0, 10) : undefined;
  const startTime = raw.startTime ?? (raw.startsAt ? raw.startsAt.slice(11, 16) : null);

  return {
    slug: raw.slug || `event-${date}`,
    title: raw.title,
    description: raw.description || raw.title,
    date,
    ...(endDate && endDate !== date ? { endDate } : {}),
    startTime: startTime && /^\d{2}:\d{2}$/.test(startTime) ? startTime : null,
    kind: "service",
    unitSlug: raw.unitSlug || "esocs",
    image: raw.imageUrl ? { url: raw.imageUrl, width: null, height: null, alt: raw.title } : null,
    computed: false,
  };
}
