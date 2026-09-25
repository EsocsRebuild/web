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
import { HomeHero } from "@/features/home/hero";
import { StoriesRow } from "@/features/home/stories-row";
import { GiveAppeal, HistoryTeaser, OrderInNumbers, SectionsFeature } from "@/features/home/story-sections";
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

  return (
    <>
      <HomeHero org={org} />
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
          <OrderInNumbers founded={org.founded} leaders={people.length} cmcs={cmcs.length} />
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
