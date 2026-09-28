import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Bridges } from "@/components/patterns/bridges";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { RailCard } from "@/components/shell/rails";
import { getContent } from "@/data/content";
import { postHref } from "@/features/feed/post-card";
import { PostMedia } from "@/features/feed/post-media";
import { resolvePost } from "@/features/feed/resolve";
import { ReactionBar, SaveButton, ShareButton } from "@/features/social/actions";
import { CommentThread } from "@/features/social/comment-thread";
import { formatLongDate } from "@/lib/format";
import { POST_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getContent()
    .getFeed({ limit: 1000 })
    .items.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[id]">): Promise<Metadata> {
  const post = getContent().getPost((await params).id);
  if (!post) return {};
  return {
    title: post.title,
    description: post.body[0]?.slice(0, 180),
    openGraph: {
      type: "article",
      publishedTime: post.date ?? undefined,
      images: post.images[0] ? [post.images[0].url] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const content = getContent();
  const post = content.getPost((await params).id);
  if (!post) notFound();
  // Albums live in the media section.
  if (post.gallerySlug) redirect(routes.album(post.gallerySlug));

  const item = resolvePost(post);
  const anchor = item.tagged[0] ?? item.publisher;
  const more = content
    .listPostsForUnit(anchor.slug)
    .filter((p) => p.id !== post.id)
    .slice(0, 3)
    .map(resolvePost);

  return (
    <div className="mx-auto grid max-w-wide gap-10 px-gutter py-8 lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail-right)] lg:py-12">
      <article aria-labelledby="post-title" className="grid min-w-0 content-start gap-8">
        <header className="grid max-w-3xl gap-5">
          <p className="text-overline font-semibold text-highlight uppercase">{POST_KIND[post.kind].label}</p>
          <h1 id="post-title" className="font-display text-display-lg font-extrabold text-balance">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={routes.unit(item.publisher.slug)}
              className="inline-flex items-center gap-2.5 font-semibold hover:text-highlight"
            >
              <UnitAvatar
                name={item.publisher.name}
                kind={item.publisher.kind}
                image={item.publisher.avatar}
                size="sm"
              />
              {item.publisher.slug === "esocs" ? "ESOCS Worldwide" : item.publisher.name}
            </Link>
            {post.date && (
              <>
                <span aria-hidden className="text-subtle-foreground">
                  ·
                </span>
                <time dateTime={post.date} className="text-muted-foreground">
                  {formatLongDate(post.date)}
                </time>
              </>
            )}
          </div>
        </header>

        {post.images.length > 0 && (
          <PostMedia images={post.images} href={postHref(item)} title={post.title} />
        )}

        <div className="grid max-w-prose gap-5 text-[1.125rem] leading-8 text-foreground/90">
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {item.tagged.length > 0 && (
          <section aria-label="Pages in this post" className="flex flex-wrap gap-2">
            {item.tagged.map((t) => (
              <Link
                key={t.slug}
                href={routes.unit(t.slug)}
                className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border py-1 pr-4 pl-1.5 text-sm font-semibold hover:bg-surface-muted"
              >
                <UnitAvatar
                  name={t.name}
                  kind={t.kind}
                  image={t.avatar}
                  size="xs"
                  className="rounded-pill!"
                />
                {t.name}
              </Link>
            ))}
          </section>
        )}

        <div className="sticky bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+0.5rem)] z-20 flex flex-wrap items-center justify-between gap-2 rounded-pill border border-border bg-surface/95 px-2 py-1 shadow-card backdrop-blur lg:static lg:rounded-card lg:shadow-none">
          <ReactionBar postId={post.id} title={post.title} />
          <div className="flex items-center">
            <SaveButton postId={post.id} title={post.title} />
            <ShareButton title={post.title} path={routes.post(post.id)} variant="ghost" size="sm" iconOnly />
          </div>
        </div>

        <div className="max-w-3xl">
          <CommentThread postId={post.id} title={post.title} />
        </div>

        <Bridges
          items={[
            {
              href: routes.unit(anchor.slug),
              eyebrow: "This page",
              title: anchor.slug === "esocs" ? "ESOCS Worldwide" : anchor.name,
            },
            { href: routes.news(), eyebrow: "News & stories", title: "More from across the Order" },
          ]}
        />
      </article>

      <aside
        aria-label="More"
        className="grid content-start gap-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start"
      >
        {more.length > 0 && (
          <RailCard title={`More from ${anchor.slug === "esocs" ? "the Order" : anchor.name}`}>
            <ul className="grid gap-4">
              {more.map((m) => (
                <li key={m.post.id}>
                  <Link href={postHref(m)} className="group/more grid gap-1">
                    <span className="text-xs text-muted-foreground">
                      {POST_KIND[m.post.kind].label}
                      {m.post.date && ` · ${formatLongDate(m.post.date)}`}
                    </span>
                    <span className="text-sm leading-snug font-semibold group-hover/more:text-highlight">
                      {m.post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>
        )}
      </aside>
    </div>
  );
}
