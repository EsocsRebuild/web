import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { PageIntro } from "@/components/patterns/page-intro";
import { Paragraphs } from "@/components/patterns/paragraphs";
import { ReadMore } from "@/components/patterns/read-more";
import { getContent } from "@/data/content";
import { postKinds, type PostKind } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { POST_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { FeedList } from "./feed-list";
import { postHref } from "./post-card";
import { getFeedPage, resolvePost } from "./resolve";

/** The publishing front page: a lead story, categories, then everything in order. */
export function NewsIndex({ kind }: { kind: PostKind | null }) {
  const content = getContent();
  const all = content.getFeed({ limit: 1000 }).items;
  const available = postKinds.filter((k) => all.some((p) => p.kind === k));
  const lead = kind ? null : (all.find((p) => p.kind === "message") ?? all[0]);
  const feed = getFeedPage({ kind: kind ?? undefined, limit: 10 });
  const albumSizes = Object.fromEntries(content.listGalleries().map((g) => [g.slug, g.photos.length]));
  const leadItem = lead ? resolvePost(lead) : null;
  const chip =
    "inline-flex min-h-10 shrink-0 items-center rounded-pill border px-4 text-sm font-semibold transition-colors";

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-gutter py-10">
      <PageIntro
        eyebrow="News & stories"
        title={kind ? POST_KIND[kind].plural : "From across the Order"}
        description={
          kind
            ? undefined
            : "Messages from His Most Eminence, dedications, milestones and photographs, newest first."
        }
      />

      {leadItem && (
        <article className="group/lead dark relative isolate grid gap-4 overflow-hidden rounded-panel bg-inverse p-6 text-foreground sm:p-10">
          {leadItem.post.images[0] && (
            <SmartImage
              image={{ ...leadItem.post.images[0], alt: "" }}
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="-z-10 object-cover opacity-30"
            />
          )}
          <p className="text-overline font-semibold text-highlight uppercase">
            {POST_KIND[leadItem.post.kind].label}
            {leadItem.post.date && ` · ${formatLongDate(leadItem.post.date)}`}
          </p>
          <h2 className="font-display text-display-sm leading-tight font-extrabold text-balance">
            <Link
              href={postHref(leadItem)}
              className="group-hover/lead:underline group-hover/lead:underline-offset-4 after:absolute after:inset-0"
            >
              {leadItem.post.title}
            </Link>
          </h2>
          {leadItem.post.body.length > 0 && (
            <ReadMore
              lines={3}
              tone="inverse"
              className="relative z-10 max-w-2xl"
              contentClassName="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            >
              <Paragraphs text={leadItem.post.body} />
            </ReadMore>
          )}
        </article>
      )}

      <nav aria-label="Categories" className="-mx-gutter scrollbar-none overflow-x-auto px-gutter">
        <ul className="flex gap-2">
          {[null, ...available].map((k) => {
            const active = k === kind;
            return (
              <li key={k ?? "all"}>
                <Link
                  href={routes.news(k ?? undefined)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    chip,
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {k ? POST_KIND[k].plural : "All"}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <FeedList key={kind ?? "all"} initial={feed} kind={kind} albumSizes={albumSizes} />
    </div>
  );
}
