import { ArrowRight, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { Reveal } from "@/components/motion/reveal";
import { Cover } from "@/components/patterns/cover";
import { Paragraphs } from "@/components/patterns/paragraphs";
import { ReadMore } from "@/components/patterns/read-more";
import { SectionHeading } from "@/components/patterns/section-heading";
import type { ChurchEvent, ImageRef, Organisation, Post, Unit } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { POST_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** One band of the home story: full width, a steady rhythm, alternating grounds. */
export function HomeBand({
  tone = "base",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { tone?: "base" | "raised" }) {
  return (
    <section
      className={cn(tone === "raised" && "border-y border-border bg-surface", "py-16 sm:py-20", className)}
      {...props}
    >
      <div className="mx-auto grid max-w-wide gap-8 px-gutter sm:gap-10">{children}</div>
    </section>
  );
}

import { QuickPathsDeck } from "./quick-paths-deck";
import { WhoWeAre } from "./who-we-are";

export { QuickPathsDeck, WhoWeAre };

/** The things most people come for, one tap away, straight after the hero. */
export function QuickPaths() {
  return <QuickPathsDeck />;
}

/** Who we are: modern multi-perspective sanctuary architecture, vision, FLOSH pillars, and centenary monument. */
export function Welcome({
  org,
  photo,
}: {
  org: Organisation;
  photo: { image: ImageRef; caption: string } | null;
}) {
  return <WhoWeAre org={org} photo={photo} />;
}

import { AutomatedEventsBand } from "@/features/events/automated-events-band";

/** What's coming: automated monthly events schedule with interactive reminder actions. */
export function UpcomingBand({ events }: { events: ChurchEvent[] }) {
  return <AutomatedEventsBand events={events} />;
}

function postLink(post: Post) {
  return post.gallerySlug ? routes.album(post.gallerySlug) : routes.post(post.id);
}

function Kicker({ post, publisher }: { post: Post; publisher?: Unit }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
      <span className="font-semibold text-accent">{POST_KIND[post.kind].label}</span>
      {publisher && <span aria-hidden>·</span>}
      {publisher && <span>{publisher.slug === "esocs" ? "ESOCS Worldwide" : publisher.name}</span>}
      {post.date && <span aria-hidden>·</span>}
      {post.date && <time dateTime={post.date}>{formatLongDate(post.date)}</time>}
    </span>
  );
}

/** The latest from the media team as an editorial spread: one lead story and three more. */
export function LatestNews({ posts, units }: { posts: Post[]; units: Map<string, Unit> }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const leadImage = lead.images[0];

  return (
    <HomeBand aria-labelledby="news-heading">
      <SectionHeading
        id="news-heading"
        eyebrow="Latest"
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
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        <article className="group/lead relative grid content-start gap-4">
          <div className="relative aspect-16/10 overflow-hidden rounded-panel bg-surface-sunken">
            {leadImage ? (
              <SmartImage
                image={leadImage}
                fill
                frame={{ width: 16, height: 10 }}
                sizes="(min-width: 1024px) 700px, 100vw"
                className="parallax-media object-cover"
              />
            ) : (
              <Cover
                image={null}
                kind={units.get(lead.unitSlug)?.kind ?? "holy-order"}
                className="absolute inset-0"
              />
            )}
          </div>
          <Kicker post={lead} publisher={units.get(lead.unitSlug)} />
          <h3 className="font-display text-display-sm font-extrabold text-balance">
            <Link href={postLink(lead)} className="group-hover/lead:text-accent after:absolute after:inset-0">
              {lead.title}
            </Link>
          </h3>
          {lead.body.length > 0 && (
            <ReadMore
              lines={3}
              className="relative z-10 max-w-2xl"
              contentClassName="text-base leading-7 text-muted-foreground"
            >
              <Paragraphs text={lead.body} />
            </ReadMore>
          )}
        </article>

        <ul className="grid content-start divide-y divide-border">
          {rest.map((post) => {
            const img = post.images[0];
            return (
              <Reveal as="li" key={post.id} className="py-5 first:pt-0">
                <article className="group/story relative flex gap-4">
                  <div className="grid min-w-0 flex-1 content-start gap-2">
                    <Kicker post={post} />
                    <h3 className="font-display text-base leading-snug font-bold text-balance sm:text-lg">
                      <Link
                        href={postLink(post)}
                        className="group-hover/story:text-accent after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h3>
                  </div>
                  {img && (
                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-card bg-surface-sunken sm:w-28">
                      <SmartImage
                        image={{ ...img, alt: "" }}
                        fill
                        frame={{ width: 1, height: 1 }}
                        sizes="112px"
                        quality={60}
                        className="object-cover"
                      />
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </HomeBand>
  );
}

const PLACES = ["Lagos", "Port Harcourt", "Abuja", "Ibadan", "London", "United States"];

/** "There's a house of prayer near you": search, popular places and the headquarters. */
export function FindBand({ pageCount, headquarters }: { pageCount: number; headquarters: Unit[] }) {
  return (
    <section aria-labelledby="find-heading" className="px-gutter py-24 sm:py-32 lg:py-36">
      <div className="bg-surface-raised mx-auto grid max-w-wide gap-12 rounded-panel border border-border/80 p-8 shadow-sm sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
        <div className="grid gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-crimson-700/30 bg-crimson-800/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson-700 uppercase shadow-xs dark:text-crimson-300">
            <MapPin className="size-3.5" />
            Worldwide Parish Directory
          </span>
          <h2
            id="find-heading"
            className="font-display text-[clamp(2.25rem,1.8rem+2vw,3.5rem)] leading-[1.1] font-extrabold tracking-tight text-balance text-foreground"
          >
            There’s a house of prayer{" "}
            <span className="font-serif font-normal text-crimson-700 italic dark:text-crimson-400">
              near you.
            </span>
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Search {pageCount} churches, provincial secretariats, and prayer houses across Nigeria and the
            global diaspora.
          </p>
          <form action={routes.find()} role="search" className="flex gap-2.5">
            <label htmlFor="find-band-q" className="sr-only">
              Town, province or church name
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="find-band-q"
                name="q"
                type="search"
                placeholder="Search by city, province, or parish name..."
                className="h-12 w-full rounded-pill border border-border bg-surface pr-4 pl-11 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-crimson-700 focus-visible:ring-2 focus-visible:ring-crimson-700/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-pill bg-crimson-800 px-7 text-sm font-bold text-white shadow-md transition-all hover:bg-crimson-900 hover:shadow-lg dark:bg-crimson-700 dark:hover:bg-crimson-600"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-muted-foreground">Popular cities:</span>
            {PLACES.map((q) => (
              <Link
                key={q}
                href={routes.find({ q })}
                className="inline-flex min-h-7 items-center rounded-pill border border-border bg-surface px-3.5 text-xs font-semibold text-foreground/80 hover:border-crimson-700 hover:text-crimson-700 dark:hover:border-crimson-400 dark:hover:text-crimson-400"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3.5">
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Principal Headquarters
          </p>
          <ul className="grid gap-3">
            {headquarters.slice(0, 4).map((hq) => (
              <li key={hq.slug}>
                <Link
                  href={routes.unit(hq.slug)}
                  className="group/hq hover:bg-surface-raised flex items-center gap-4 rounded-card border border-border/80 bg-surface p-4.5 transition-all hover:border-crimson-700/40"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-crimson-800/10 text-crimson-700 dark:text-crimson-400">
                    <MapPin aria-hidden className="size-5" />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="text-sm font-bold text-foreground group-hover/hq:text-crimson-700 dark:group-hover/hq:text-crimson-400">
                      {hq.name}
                    </span>
                    {(hq.locality ?? hq.tagline) && (
                      <span className="text-xs text-muted-foreground">{hq.locality ?? hq.tagline}</span>
                    )}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/hq:translate-x-1.5 group-hover/hq:text-crimson-700 dark:group-hover/hq:text-crimson-400"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { PatriarchalWelcome, type PatriarchalWelcomeProps } from "./patriarchal-welcome";
export { PatriarchalWelcome as BabaAladuraMessage } from "./patriarchal-welcome";
