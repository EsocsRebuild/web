import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/patterns/section-heading";
import { EmptyState } from "@/components/patterns/states";
import { PageColumns, RailCard } from "@/components/shell/rails";
import { siteConfig } from "@/config/site";
import { getContent } from "@/data/content";
import { UpcomingList } from "@/features/events/upcoming-list";
import { FeedFilters, parseKind } from "@/features/feed/feed-filters";
import { FeedList } from "@/features/feed/feed-list";
import { getFeedPage } from "@/features/feed/resolve";
import { FindStrip } from "@/features/home/find-strip";
import { Announcements } from "@/components/shell/announcements";
import { HeroScenes, type HeroScene } from "@/features/home/hero-scenes";
import { StoriesRow } from "@/features/home/stories-row";
import { GiveAppeal, HistoryTeaser, SectionsFeature } from "@/features/home/story-sections";
import { PagesToFollow } from "@/features/units/pages-to-follow";
import { routes } from "@/lib/routes";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const kind = parseKind((await searchParams).type);
  const content = getContent();
  const org = content.getOrganisation();

  const headquarters = content.listUnits({ kind: "headquarters" });
  const sections = content.listUnits({ kind: "section" });
  const cmcs = content
    .listUnits({ kind: "cmc" })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  const people = content.listPeople();
  const upcoming = content.listEvents().slice(0, 5);
  const feed = getFeedPage({ kind: kind ?? undefined, limit: 10 });
  const kinds = [...new Set(content.getFeed({ limit: 1000 }).items.map((p) => p.kind))];
  const albumSizes = Object.fromEntries(content.listGalleries().map((g) => [g.slug, g.photos.length]));
  const root = content.getUnit("esocs")!;
  const fathersDay = content.listEvents().find((e) => e.slug.startsWith("fathers-day"));
  const scenes: HeroScene[] = [
    {
      id: "church",
      image: "/brand/hero-church.webp",
      alt: "The congregation gathered under the canopy at the centenary",
      focus: "center 40%",
      eyebrow: `The Eternal Sacred Order of the Cherubim & Seraphim · Since ${org.founded}`,
      lead: "A house of prayer",
      accent: "for all people.",
      cite: "Isaiah 56:7",
      body: `A worldwide Order of houses of prayer, founded by ${org.founder}. Find your church and walk with the family this week.`,
      cta: { label: "Who we are", href: routes.unit("esocs") },
    },
    {
      id: "women",
      image: "/brand/hero-women.webp",
      alt: "Mothers of the Order in white garments at the centenary",
      focus: "70% center",
      eyebrow: "Our church family · Women",
      lead: "Mothers of faith,",
      accent: "pillars of the Order.",
      body: "Women of all ages growing in their relationship with Jesus Christ through learning, sharing and serving.",
      cta: { label: "Meet the Mothers", href: routes.unit("women") },
    },
    {
      id: "youth",
      image: "/brand/hero-youth.webp",
      alt: "Young members in white garments in a joyful procession",
      focus: "center 35%",
      eyebrow: "Our church family · Mount Zion Youth Society",
      lead: "Raised in holiness,",
      accent: "sent out in faith.",
      body: "Tuesday Bible Studies in every branch, the Campus Fellowship and missions: the future of the Holy Order.",
      cta: { label: "Explore Youth", href: routes.unit("youth") },
    },
    {
      id: "children",
      image: "/brand/hero-children.webp",
      alt: "Children in white and blue caps at the Children's Day celebration",
      focus: "center 30%",
      eyebrow: "Our church family · Children",
      lead: "Suffer the little children",
      accent: "to come unto me.",
      cite: "Mark 10:14",
      body: "The joy of the Order's youngest members, from Children's Day to the Christmas party.",
      cta: { label: "See Children's Day", href: routes.album("childrens-day-celebration") },
    },
    {
      id: "fathers",
      image: "/brand/hero-fathers.webp",
      alt: "Elders of the Order with their staffs at a thanksgiving service",
      focus: "center 30%",
      eyebrow: "Our church family · Fathers",
      lead: "Fathers who lead",
      accent: "with humble hearts.",
      body: "ESOCS Father's Day is kept on the third Sunday of June, honouring the fathers of every house of prayer.",
      cta: fathersDay
        ? { label: "ESOCS Father's Day", href: routes.event(fathersDay.slug) }
        : { label: "Church calendar", href: routes.calendar() },
    },
  ];

  return (
    <>
      <HeroScenes scenes={scenes} findHref={routes.find()} footer={<Announcements variant="hero" />} />
      <FindStrip pageCount={content.listUnits().length} />

      <PageColumns
        right={
          <>
            <RailCard
              title="Coming up"
              action={
                <Link
                  href={routes.events()}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  All
                </Link>
              }
            >
              {upcoming.length ? (
                <UpcomingList events={upcoming} />
              ) : (
                <EmptyState compact icon={CalendarDays} title="Nothing scheduled yet" />
              )}
            </RailCard>
            <RailCard title="Pages to follow">
              <PagesToFollow units={[...sections, root, headquarters[0]].filter(Boolean)} />
            </RailCard>
            <section aria-label="Watchword" className="dark rounded-card bg-inverse p-5 text-foreground">
              <p className="text-overline font-semibold text-highlight uppercase">Our watchword</p>
              <p className="mt-2 font-display text-xl leading-snug font-extrabold text-balance">
                {org.watchword.text}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{org.watchword.reference}</p>
            </section>
            <RailCard title="Need prayer or counsel?">
              <ul className="grid gap-2 text-sm">
                {siteConfig.contact.phones.map((p) => (
                  <li key={p.number} className="grid">
                    <span className="text-muted-foreground">{p.label}</span>
                    <a href={`tel:${p.number}`} className="font-semibold tabular hover:text-highlight">
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                href={routes.prayer()}
                className="mt-3 inline-block text-sm font-semibold text-highlight hover:underline"
              >
                Send a private prayer request
              </Link>
            </RailCard>
          </>
        }
      >
        <div className="grid gap-6">
          <StoriesRow units={[root, ...headquarters, ...sections, ...cmcs]} />
          <section aria-labelledby="feed-heading" className="grid gap-4">
            <SectionHeading
              id="feed-heading"
              eyebrow="This week and before"
              title="Life across the Order"
              href={routes.news()}
              linkLabel="All news"
            />
            <FeedFilters basePath={routes.home()} active={kind} available={kinds} />
            <FeedList key={kind ?? "all"} initial={feed} kind={kind} albumSizes={albumSizes} />
          </section>
        </div>
      </PageColumns>

      <div className="mx-auto grid max-w-wide gap-16 px-gutter pt-8">
        <SectionsFeature sections={sections} />
        <HistoryTeaser people={people} />
        <GiveAppeal appeal={org.givingAppeal} />
      </div>
    </>
  );
}
