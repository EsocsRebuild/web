import { ArrowRight, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { LogoMark } from "@/components/icons/logo";
import { Reveal } from "@/components/motion/reveal";
import { Cover } from "@/components/patterns/cover";
import { DateBadge } from "@/components/patterns/date-badge";
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

/** What's coming: the next few dates, with the full calendar one tap away. */
export function UpcomingBand({ events }: { events: ChurchEvent[] }) {
  return (
    <HomeBand tone="raised" aria-labelledby="upcoming-heading">
      <SectionHeading
        id="upcoming-heading"
        eyebrow="Coming up"
        title={
          <>
            Dates for the family,{" "}
            <span className="font-serif font-normal text-accent italic">in fellowship.</span>
          </>
        }
        size="lg"
        href={routes.events()}
        linkLabel="All events"
      />
      {events.length ? (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-3">
          {events.map((e) => (
            <Reveal as="li" key={e.slug}>
              <Link
                href={routes.event(e.slug)}
                className="group/event flex h-full flex-col gap-4 rounded-card border border-border bg-background p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card"
              >
                <DateBadge date={e.date} size="sm" />
                <span className="grid gap-1.5">
                  <span className="font-display text-base leading-snug font-bold group-hover/event:text-accent">
                    {e.title}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">{e.description}</span>
                </span>
                {e.endDate && (
                  <span className="mt-auto text-xs text-muted-foreground">
                    Until {formatLongDate(e.endDate)}
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Nothing scheduled yet.</p>
      )}
    </HomeBand>
  );
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
            News from across the Order,{" "}
            <span className="font-serif font-normal text-accent italic">worldwide.</span>
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
    <section aria-labelledby="find-heading" className="px-gutter py-16 sm:py-20">
      <div className="dark relative isolate mx-auto grid max-w-wide gap-10 overflow-hidden rounded-panel bg-inverse px-6 py-10 text-foreground sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <div
          aria-hidden
          className="parallax-layer absolute inset-x-0 -inset-y-24 -z-10"
          style={
            {
              "--parallax-shift": "14%",
              backgroundImage:
                "radial-gradient(45% 55% at 100% 20%, color-mix(in oklch, var(--color-royal-500) 38%, transparent), transparent 70%)",
            } as React.CSSProperties
          }
        />
        <LogoMark
          aria-hidden
          className="parallax-layer absolute -bottom-16 -left-10 -z-10 size-72 text-white opacity-[0.05]"
        />
        <div className="grid gap-5">
          <p className="text-overline font-semibold text-highlight uppercase">Worldwide</p>
          <h2
            id="find-heading"
            className="font-display text-[clamp(1.75rem,1.4rem+1.6vw,3.25rem)] leading-[1.15] font-extrabold tracking-tight text-balance text-white"
          >
            There’s a house of prayer{" "}
            <span className="font-serif font-normal text-highlight italic">near you.</span>
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Search {pageCount} churches, provinces and headquarters in Nigeria and abroad.
          </p>
          <form action={routes.find()} role="search" className="flex gap-2">
            <label htmlFor="find-band-q" className="sr-only">
              Town, province or church name
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60"
              />
              <input
                id="find-band-q"
                name="q"
                type="search"
                placeholder="Town, province or church"
                className="h-11 w-full rounded-pill border border-white/15 bg-white/5 pr-4 pl-11 text-base text-white outline-none placeholder:text-white/55 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 cursor-pointer items-center rounded-pill bg-white px-4 text-sm font-semibold text-royal-950 transition-colors hover:bg-royal-50 sm:px-5"
            >
              Search
            </button>
          </form>
          <ul className="flex flex-wrap gap-2" aria-label="Popular places">
            {PLACES.map((q) => (
              <li key={q}>
                <Link
                  href={routes.find({ q })}
                  className="inline-flex min-h-8 items-center rounded-pill border border-white/15 px-3 text-xs font-semibold text-white/85 hover:border-white/40 hover:text-white"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="text-overline font-semibold text-muted-foreground uppercase">Headquarters</p>
          <ul className="grid gap-2">
            {headquarters.map((hq) => (
              <li key={hq.slug}>
                <Link
                  href={routes.unit(hq.slug)}
                  className="group/hq flex items-center gap-4 rounded-card border border-white/10 bg-white/4 p-4 transition-colors hover:border-white/25 hover:bg-white/8"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-highlight">
                    <MapPin aria-hidden className="size-5" />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="text-sm font-semibold text-pretty">{hq.name}</span>
                    {(hq.locality ?? hq.tagline) && (
                      <span className="text-xs text-muted-foreground">{hq.locality ?? hq.tagline}</span>
                    )}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-white/60 transition-transform group-hover/hq:translate-x-0.5 group-hover/hq:text-white"
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
