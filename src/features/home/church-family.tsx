import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import type { ImageRef } from "@/data/schema/content";
import { routes } from "@/lib/routes";

import { FamilyCarousel, type FamilyCard } from "./family-carousel";

interface GenerationConfig {
  key: string;
  unit?: string;
  title: string;
  eyebrow: string;
  body: string[];
  image?: ImageRef;
  photo?: {
    gallery: string;
    index: number;
    alt: string;
    focus: string;
  };
  focus?: string;
  link?: { label: string; href: string };
  event?: string;
}

const GENERATIONS: GenerationConfig[] = [
  {
    key: "children",
    title: "Children",
    eyebrow: "The youngest of the Order",
    body: ["The joy of the Order’s youngest members, from Children’s Day to the Christmas party."],
    photo: {
      gallery: "childrens-day-celebration",
      index: 41,
      alt: "Children in white caps smiling in the pews at the Children’s Day celebration",
      focus: "50% 30%",
    },
    link: { label: "Children’s Day", href: routes.album("childrens-day-celebration") },
  },
  {
    key: "youth",
    unit: "youth",
    title: "Youth",
    eyebrow: "Mount Zion Youth Society",
    body: [
      "Tuesday Bible Studies in every branch, Campus Fellowships, and missions: raising youth as true ambassadors of Christ.",
    ],
    image: {
      url: "/brand/hero-youth.webp",
      width: 1200,
      height: 800,
      alt: "Young members of the Mount Zion Youth Society in white garments in a joyful procession",
    },
    focus: "center 35%",
  },
  {
    key: "women",
    unit: "women",
    title: "Women",
    eyebrow: "Women’s Affairs",
    body: [
      "Women of all ages growing in their relationship with Jesus Christ through learning, fellowship, and service.",
    ],
    image: {
      url: "/brand/hero-women.webp",
      width: 1200,
      height: 800,
      alt: "Mothers and women of the Order in white garments at worship",
    },
    focus: "70% center",
  },
  {
    key: "men",
    title: "Men",
    eyebrow: "Fathers of every house of prayer",
    body: [
      "ESOCS Father’s Day is kept on the third Sunday of June, honouring the fathers of every house of prayer.",
    ],
    photo: {
      gallery: "st-moses-orimolade-tunolase-annual-memorial-lecture",
      index: 17,
      alt: "An elder of the Order in red ceremonial robes at the St. Moses Orimolade Tunolase Memorial Lecture",
      focus: "45% 30%",
    },
    event: "fathers-day",
  },
];

function resolve(): FamilyCard[] {
  const content = getContent();
  const galleries = new Map(content.listGalleries().map((g) => [g.slug, g]));
  return GENERATIONS.map((g) => {
    let photo: ImageRef | null = g.image ?? null;
    let focusPosition = g.focus ?? "50% 30%";

    if (!photo && g.photo) {
      const gallery = galleries.get(g.photo.gallery);
      const galleryPhoto = gallery?.photos[g.photo.index] ?? gallery?.cover ?? null;
      if (galleryPhoto) {
        photo = { ...galleryPhoto, alt: g.photo.alt };
      }
      focusPosition = g.photo.focus;
    }

    const unit = g.unit ? content.getUnit(g.unit) : null;
    const event = g.event ? content.listEvents().find((e) => e.slug.startsWith(g.event!)) : null;

    return {
      key: g.key,
      title: g.title,
      eyebrow: g.eyebrow,
      body: g.body,
      image: photo,
      focus: focusPosition,
      link: unit
        ? { label: `Explore ${g.title}`, href: routes.unit(unit.slug) }
        : event
          ? { label: event.title, href: routes.event(event.slug) }
          : g.link
            ? g.link
            : { label: "Church calendar", href: routes.calendar() },
      follow: unit ? { slug: unit.slug, name: unit.name } : null,
    };
  });
}

/** "Our church family": the generations as a row to swipe or step through. */
export function ChurchFamily() {
  return (
    <section aria-labelledby="family-heading" className="grid max-w-full min-w-0 gap-6">
      <SectionHeading
        id="family-heading"
        eyebrow="Our church family"
        title={
          <>
            Every generation has a place,{" "}
            <span className="font-serif font-normal text-accent italic">in worship.</span>
          </>
        }
        size="lg"
        href={routes.sections()}
        linkLabel="All sections"
      />
      <FamilyCarousel cards={resolve()} />
    </section>
  );
}
