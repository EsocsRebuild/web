/**
 * Church identity, contact details and navigation.
 * Values marked TODO must be confirmed before launch.
 */
export const siteConfig = {
  name: "ESOCS",
  fullName: "Eternal Sacred Order of Cherubim & Seraphim",
  tagline: "A house of prayer for all nations",
  description:
    "Service times, sermons, events and ministries of the Eternal Sacred Order of Cherubim & Seraphim.",
  locale: "en-GB",
  timeZone: "Africa/Lagos", // TODO: confirm
  currency: "NGN", // TODO: confirm giving currency

  contact: {
    email: "info@example.org", // TODO
    phone: "+234 000 000 0000", // TODO
    address: {
      line1: "123 Church Street", // TODO
      city: "Lagos",
      country: "Nigeria",
    },
    mapUrl: "https://maps.google.com", // TODO
  },

  socials: {
    youtube: "https://youtube.com", // TODO
    facebook: "https://facebook.com", // TODO
    instagram: "https://instagram.com", // TODO
    x: "https://x.com", // TODO
  },

  /** Hero photograph in /public, e.g. "/images/hero.jpg". Leave null until supplied. */
  heroImage: null as string | null,

  services: [
    { name: "Sunday Worship", day: "Sunday", time: "9:00 AM", note: "Main service" },
    { name: "Bible Study", day: "Wednesday", time: "6:00 PM", note: "Midweek teaching" },
    { name: "Prayer & Healing", day: "Friday", time: "6:00 PM", note: "Intercession" },
  ],
} as const;

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

export const mainNav: NavItem[] = [
  {
    title: "About",
    href: "/about",
    children: [
      { title: "Our Story", href: "/about", description: "History and heritage of the Order" },
      { title: "Beliefs", href: "/about/beliefs", description: "What we believe and teach" },
      { title: "Leadership", href: "/about/leadership", description: "Meet our shepherds" },
    ],
  },
  { title: "Sermons", href: "/sermons" },
  { title: "Events", href: "/events" },
  {
    title: "Ministries",
    href: "/ministries",
    children: [
      { title: "Choir", href: "/ministries/choir", description: "Worship through music" },
      { title: "Youth", href: "/ministries/youth", description: "Raising the next generation" },
      { title: "Women's Fellowship", href: "/ministries/women", description: "Sisters in faith" },
      { title: "Men's Fellowship", href: "/ministries/men", description: "Brothers in faith" },
    ],
  },
  { title: "Contact", href: "/contact" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Church",
    items: [
      { title: "About Us", href: "/about" },
      { title: "Leadership", href: "/about/leadership" },
      { title: "Beliefs", href: "/about/beliefs" },
      { title: "Ministries", href: "/ministries" },
    ],
  },
  {
    title: "Engage",
    items: [
      { title: "Sermons", href: "/sermons" },
      { title: "Events", href: "/events" },
      { title: "Prayer Request", href: "/prayer" },
      { title: "Give", href: "/give" },
    ],
  },
  {
    title: "Visit",
    items: [
      { title: "Plan a Visit", href: "/visit" },
      { title: "Contact", href: "/contact" },
    ],
  },
];
