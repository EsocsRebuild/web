import { SectionHeading } from "@/components/patterns/section-heading";
import { Announcements } from "@/components/shell/announcements";
import { getContent } from "@/data/content";
import { FeedList } from "@/features/feed/feed-list";
import { getFeedPage } from "@/features/feed/resolve";
import { HeroScenes, type HeroScene } from "@/features/home/hero-scenes";
import { PrayerCard, SealsRow, Succession, WatchwordPlate } from "@/features/home/home-sections";
import { OrderIndex } from "@/features/home/order-index";
import {
  BabaAladuraMessage,
  FindBand,
  HomeBand,
  LatestNews,
  QuickPathsDeck,
  UpcomingBand,
  WhoWeAre,
} from "@/features/home/story-bands";
import { ChurchFamily } from "@/features/home/church-family";
import { GiveAppeal } from "@/features/home/story-sections";
import { StoreTeaser } from "@/features/store/store-teaser";
import { placeholderFor } from "@/lib/image-placeholders";
import { routes } from "@/lib/routes";

export default function HomePage() {
  const content = getContent();
  const org = content.getOrganisation();

  const root = content.getUnit("esocs")!;
  const headquarters = content.listUnits({ kind: "headquarters" });
  const sections = content.listUnits({ kind: "section" });
  const cmcs = content
    .listUnits({ kind: "cmc" })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  const people = content.listPeople();
  const upcoming = content.listEvents();
  const units = content.listUnits();
  const unitsBySlug = new Map(units.map((u) => [u.slug, u]));
  const churchNames = Object.fromEntries(units.map((u) => [u.slug, { name: u.name, locality: u.locality }]));
  const churchKinds = new Set(["headquarters", "province", "special-area", "district", "branch"]);
  const churchUnits = units.filter((u) => churchKinds.has(u.kind));
  const countries = new Set(churchUnits.map((u) => u.country).filter(Boolean)).size;
  const reach = `${churchUnits.length} churches${countries > 1 ? ` · ${countries} countries` : ""}`;
  const albumSizes = Object.fromEntries(content.listGalleries().map((g) => [g.slug, g.photos.length]));

  const shepherd = people.find((p) => p.tenure.to === null);
  const shepherdPhoto =
    org.heroSlides.find((s) => /baba aladura/i.test(s.title))?.image ?? shepherd?.portrait ?? null;
  const messagePost = content.getFeed({ kind: "message", limit: 1 }).items[0];

  // The editorial spread shows the latest four and the Baba Aladura's message has its
  // own section, so the chronicle continues from everything not already on the page.
  const editorial = content.getFeed({ limit: 4 }).items;
  const excludeIds = [...editorial.map((p) => p.id), ...(messagePost ? [messagePost.id] : [])];
  const feed = getFeedPage({ limit: 10, excludeIds });

  // A different moment of the centenary from the one leading the news.
  const centenary = content.listGalleries().find((g) => g.slug === "100th-anniversary-celebration");
  const centenaryPhoto = centenary?.photos.find((p) => p.url !== centenary.cover.url) ?? null;
  const fathersDay = content.listEvents().find((e) => e.slug.startsWith("fathers-day"));
  const scenes: HeroScene[] = (
    [
      {
        id: "church",
        image: "/brand/hero-mount-zion.webp",
        alt: "The Mount Zion house of prayer, its cross-topped tower rising under a rain-grey sky",
        // Keep the tower's cross and the lit doorway in frame on wide screens.
        focus: "center 28%",
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
        alt: "Fathers of the Order in crowns and white-and-crimson vestments, one holding his staff",
        focus: "60% 25%",
        eyebrow: "Our church family · Fathers",
        lead: "Fathers who lead",
        accent: "with humble hearts.",
        body: "ESOCS Father's Day is kept on the third Sunday of June, honouring the fathers of every house of prayer.",
        cta: fathersDay
          ? { label: "ESOCS Father's Day", href: routes.event(fathersDay.slug) }
          : { label: "Church calendar", href: routes.calendar() },
      },
    ] satisfies Omit<HeroScene, "placeholder">[]
  ).map((scene) => ({ ...scene, placeholder: placeholderFor(scene.image) }));

  return (
    <>
      <HeroScenes scenes={scenes} findHref={routes.find()} footer={<Announcements variant="hero" />} />
      <QuickPathsDeck />

      {/* The Baba Aladura's Patriarchal Welcome & Apostolic Address */}
      <BabaAladuraMessage
        message={org.message}
        shepherd={shepherd}
        portrait={
          shepherdPhoto
            ? {
                ...shepherdPhoto,
                alt: "His Most Eminence, the Baba Aladura & Prelate, ministering in worship",
              }
            : null
        }
        href={messagePost ? routes.post(messagePost.id) : routes.news("message")}
      />

      <WhoWeAre
        org={org}
        photo={centenary && centenaryPhoto ? { image: centenaryPhoto, caption: centenary.title } : null}
      />
      <UpcomingBand events={upcoming} />
      <LatestNews posts={editorial} units={unitsBySlug} />
      <HomeBand tone="raised" aria-label="Our church family">
        <ChurchFamily />
      </HomeBand>
      <FindBand pageCount={units.length} headquarters={headquarters} />

      <div className="mx-auto grid max-w-wide gap-8 border-t border-border px-gutter py-12 lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail-right)] lg:py-16 xl:grid-cols-[16.5rem_minmax(0,1fr)_var(--spacing-rail-right)] xl:gap-10">
        <OrderIndex
          root={root}
          headquarters={headquarters}
          sections={sections}
          cmcs={cmcs}
          churches={churchNames}
          reach={reach}
        />

        <div className="grid min-w-0 grid-cols-1 content-start gap-6">
          <SealsRow units={[root, ...headquarters, ...sections, ...cmcs]} />
          <section aria-labelledby="feed-heading" className="grid gap-4">
            <SectionHeading
              id="feed-heading"
              title={
                <>
                  Life across the Order,{" "}
                  <span className="font-serif font-normal text-accent italic">in communion.</span>
                </>
              }
              size="lg"
              href={routes.news()}
              linkLabel="All news"
            />
            <FeedList initial={feed} excludeIds={excludeIds} albumSizes={albumSizes} />
          </section>
        </div>

        <aside
          aria-label="Watchword and prayer"
          className="grid content-start gap-5 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start"
        >
          <WatchwordPlate watchword={org.watchword} />
          <PrayerCard />
        </aside>
      </div>

      <Succession people={people} />
      <StoreTeaser />
      <div className="mx-auto max-w-wide px-gutter py-14 sm:py-16">
        <GiveAppeal appeal={org.givingAppeal} />
      </div>
    </>
  );
}
