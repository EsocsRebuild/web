import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bridges } from "@/components/patterns/bridges";
import { getContent } from "@/data/content";
import { AlbumGrid } from "@/features/media/album-grid";
import { ShareButton } from "@/features/social/actions";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getContent()
    .listGalleries()
    .map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/media/albums/[slug]">): Promise<Metadata> {
  const g = getContent().getGallery((await params).slug);
  return g
    ? { title: g.title, description: `${g.photos.length} photographs`, openGraph: { images: [g.cover.url] } }
    : {};
}

export default async function AlbumPage({ params }: PageProps<"/media/albums/[slug]">) {
  const content = getContent();
  const gallery = content.getGallery((await params).slug);
  if (!gallery) notFound();
  const others = content
    .listGalleries()
    .filter((g) => g.slug !== gallery.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto grid max-w-wide gap-8 px-gutter py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <Link
            href={routes.media()}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" /> Media
          </Link>
          <h1 className="font-display text-display-md font-extrabold text-balance">{gallery.title}</h1>
          <p className="text-muted-foreground">
            {gallery.photos.length} photographs · {formatLongDate(gallery.date)}
          </p>
        </div>
        <ShareButton title={gallery.title} path={routes.album(gallery.slug)} />
      </header>
      <AlbumGrid title={gallery.title} photos={gallery.photos} />
      <Bridges
        items={others.map((g) => ({ href: routes.album(g.slug), eyebrow: "Album", title: g.title }))}
      />
    </div>
  );
}
