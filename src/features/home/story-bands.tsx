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

import { WorldwideSanctuaries } from "./worldwide-sanctuaries";

/** Worldwide Sanctuaries & Parish Directory band with real-time smart automated locator. */
export function FindBand({ pageCount, headquarters }: { pageCount: number; headquarters: Unit[] }) {
  return <WorldwideSanctuaries pageCount={pageCount} headquarters={headquarters} />;
}

export { PatriarchalWelcome, type PatriarchalWelcomeProps } from "./patriarchal-welcome";
export { PatriarchalWelcome as BabaAladuraMessage } from "./patriarchal-welcome";
