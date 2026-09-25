import Link from "next/link";

import { Marquee } from "@/components/motion/marquee";
import { getContent } from "@/data/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/** The announcement ticker under the top bar, built from live content only. */
export function Announcements({ variant = "bar" }: { variant?: "bar" | "hero" }) {
  const content = getContent();
  const org = content.getOrganisation();
  const next = content.listEvents().slice(0, 2);
  const latest = content.getFeed({ limit: 1 }).items[0];

  const link = "inline-flex items-center gap-2 hover:text-highlight";
  const label = "text-[0.6875rem] font-bold tracking-[0.14em] text-highlight uppercase";

  const items = [
    <span key="watchword" className="inline-flex items-center gap-2">
      <span className={label}>Watchword</span>
      <span>
        {org.watchword.text} · {org.watchword.reference}
      </span>
    </span>,
    ...next.map((e) => (
      <Link key={e.slug} href={routes.event(e.slug)} className={link}>
        <span className={label}>Coming up</span>
        {e.title} · {formatLongDate(e.date)}
      </Link>
    )),
    latest && (
      <Link key={latest.id} href={routes.post(latest.id)} className={link}>
        <span className={label}>Latest</span>
        {latest.title}
      </Link>
    ),
    <Link key="find" href={routes.find()} className={link}>
      <span className={label}>Worldwide</span>
      Find a house of prayer near you
    </Link>,
  ].filter(Boolean);

  return (
    <div
      className={
        variant === "hero"
          ? "border-t border-white/10 bg-black/25 text-sm text-foreground backdrop-blur-md"
          : "dark border-b border-border bg-inverse text-sm text-foreground"
      }
    >
      <Marquee label="Announcements" items={items} className="py-2.5" pxPerSecond={40} />
    </div>
  );
}
