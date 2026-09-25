import {
  BookOpen,
  CalendarDays,
  Crown,
  Gift,
  History,
  Home,
  Images,
  Landmark,
  MapPin,
  Menu,
  MessageSquareHeart,
  Newspaper,
  Phone,
  Route,
  ScrollText,
  Sparkles,
  Users,
  UsersRound,
  Network,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/lib/routes";

/**
 * All navigation in one place (docs/ux/01-information-architecture.md, Variant A).
 * Labels are provisional until the tree test (gate G1) confirms them.
 */

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Extra path prefixes that count as "inside" this destination. */
  match?: string[];
  description?: string;
}

export const primaryNav: NavLink[] = [
  { label: "Home", href: routes.home(), icon: Home },
  { label: "Find a Church", href: routes.find(), icon: MapPin, match: ["/find", "/structure", "/church"] },
  { label: "Events", href: routes.events(), icon: CalendarDays, match: ["/events", "/calendar", "/tours"] },
  { label: "Media", href: routes.media(), icon: Images, match: ["/media", "/news", "/posts"] },
];

/** The fifth slot opens this menu. */
export const moreNav: { title: string; items: NavLink[] }[] = [
  {
    title: "About ESOCS",
    items: [
      {
        label: "Who we are",
        href: routes.unit("esocs"),
        icon: Landmark,
        description: "Vision, values and the worldwide Order",
      },
      { label: "History", href: routes.history(), icon: History, description: "1925 to today" },
      {
        label: "Baba Aladuras",
        href: routes.leaders(),
        icon: Crown,
        description: "The succession since the founder",
      },
      {
        label: "Advisory Board",
        href: routes.unit("esocs", "leaders"),
        icon: Users,
        description: "Who leads what",
      },
      { label: "Ordinations & ranks", href: routes.ordinations(), icon: Sparkles },
      { label: "Glossary", href: routes.glossary(), icon: BookOpen, description: "Church terms explained" },
    ],
  },
  {
    title: "Our church family",
    items: [
      { label: "Women", href: routes.unit("women"), icon: UsersRound },
      { label: "Youth", href: routes.unit("youth"), icon: UsersRound },
      { label: "Directorates", href: routes.sections(), icon: ScrollText },
      { label: "How we're organised", href: routes.structure(), icon: Network },
    ],
  },
  {
    title: "Media",
    items: [
      { label: "News & stories", href: routes.news(), icon: Newspaper },
      { label: "Pastoral tours", href: routes.tours(), icon: Route },
    ],
  },
  {
    title: "Get involved",
    items: [
      { label: "Give", href: routes.give(), icon: Gift },
      { label: "Prayer request", href: routes.prayer(), icon: MessageSquareHeart },
      { label: "Contact us", href: routes.contact(), icon: Phone },
    ],
  },
];

export const moreIcon = Menu;

/** Desktop left rail shortcuts, under "My Church" when set. */
export const railShortcuts: NavLink[] = [
  { label: "Who we are", href: routes.unit("esocs"), icon: Landmark },
  { label: "Women", href: routes.unit("women"), icon: UsersRound },
  { label: "Youth", href: routes.unit("youth"), icon: UsersRound },
  { label: "Headquarters", href: routes.find({ kind: "headquarters" }), icon: Landmark },
  { label: "CMCs", href: routes.find({ kind: "cmc" }), icon: Network },
  { label: "Baba Aladuras", href: routes.leaders(), icon: Crown },
  { label: "History", href: routes.history(), icon: History },
  { label: "Pastoral tours", href: routes.tours(), icon: Route },
];

export function isActive(pathname: string, link: Pick<NavLink, "href" | "match">) {
  const path = link.href.split("?")[0];
  if (path === "/") return pathname === "/";
  return [path, ...(link.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
