import { Announcements } from "@/components/shell/announcements";
import { getContent } from "@/data/content";
import { HeroScenes, type HeroScene } from "@/features/home/hero-scenes";
import { PrayerCard, Succession } from "@/features/home/home-sections";
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

  const headquarters = content.listUnits({ kind: "headquarters" });
  const people = content.listPeople();
  const upcoming = content.listEvents();
  const units = content.listUnits();
  const unitsBySlug = new Map(units.map((u) => [u.slug, u]));

  const shepherd = people.find((p) => p.tenure.to === null);
  const shepherdPhoto =
    org.heroSlides.find((s) => /baba aladura/i.test(s.title))?.image ?? shepherd?.portrait ?? null;
  const messagePost = content.getFeed({ kind: "message", limit: 1 }).items[0];

  const editorial = content.getFeed({ limit: 4 }).items;

  const centenary = content.listGalleries().find((g) => g.slug === "100th-anniversary-celebration");
  const centenaryPhoto = centenary?.photos.find((p) => p.url !== centenary.cover.url) ?? null;
  const fathersDay = content.listEvents().find((e) => e.slug.startsWith("fathers-day"));
  const scenes: HeroScene[] = (
    [
      {
        id: "church",
        image: "/brand/hero-mount-zion.webp",
        alt: "The Mount Zion house of prayer, its cross-topped tower rising under a rain-grey sky",
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
      <Succession people={people} />
      <StoreTeaser />

      <div className="mx-auto max-w-wide px-gutter py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
          <GiveAppeal appeal={org.givingAppeal} />
          <aside aria-label="Pastoral Prayer and Support">
            <PrayerCard />
          </aside>
        </div>
      </div>
    </>
  );
}
