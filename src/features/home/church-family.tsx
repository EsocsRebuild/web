import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { routes } from "@/lib/routes";

import { FamilyCarousel, type FamilyCard } from "./family-carousel";

/**
 * The church family, in the order the generations are named: children, youth,
 * women, men. Each card has its own photograph from the church's albums (none
 * repeats the hero) and leads to where that generation lives on the site. Women
 * and Youth are pages of their own (and can be followed); Children and Men lead
 * to their own celebrations.
 */
const GENERATIONS = [
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
    photo: {
      gallery: "childrens-day-celebration",
      index: 22,
      alt: "Young members in blue capes singing together",
      focus: "50% 25%",
    },
  },
  {
    key: "women",
    unit: "women",
    title: "Women",
    eyebrow: "Women’s Affairs",
    photo: {
      gallery: "adoption-thanksgiving-service",
      index: 37,
      alt: "A mother of the Order rejoicing, arms raised, at the Adoption Thanksgiving Service",
      focus: "55% 25%",
    },
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
] as const;

function resolve(): FamilyCard[] {
  const content = getContent();
  const galleries = new Map(content.listGalleries().map((g) => [g.slug, g]));
  return GENERATIONS.map((g) => {
    const gallery = galleries.get(g.photo.gallery);
    const photo = gallery?.photos[g.photo.index] ?? gallery?.cover ?? null;
    const unit = "unit" in g ? content.getUnit(g.unit) : null;
    const event = "event" in g ? content.listEvents().find((e) => e.slug.startsWith(g.event)) : null;
    return {
      key: g.key,
      title: g.title,
      eyebrow: g.eyebrow,
      body: unit?.about.length ? unit.about : "body" in g ? [...g.body] : [],
      image: photo ? { ...photo, alt: g.photo.alt } : null,
      focus: g.photo.focus,
      link: unit
        ? { label: "Explore", href: routes.unit(unit.slug) }
        : event
          ? { label: event.title, href: routes.event(event.slug) }
          : "link" in g
            ? g.link
            : { label: "Church calendar", href: routes.calendar() },
      follow: unit ? { slug: unit.slug, name: unit.name } : null,
    };
  });
}

/** "Our church family": the generations as a row to swipe or step through. */
export function ChurchFamily() {
  return (
    <section aria-labelledby="family-heading" className="grid gap-6">
      <SectionHeading
        id="family-heading"
        eyebrow="Our church family"
        title="Every generation has a place"
        href={routes.sections()}
        linkLabel="All sections"
      />
      <FamilyCarousel cards={resolve()} />
    </section>
  );
}
