import { Radio } from "lucide-react";
import type { Metadata } from "next";

import { YoutubeIcon } from "@/components/icons/social-icons";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Media",
  description: "Photo albums, videos and ESOCS Online Radio.",
};

export default function MediaPage() {
  const galleries = getContent().listGalleries();
  const [latest, ...rest] = galleries;

  return (
    <div className="mx-auto grid max-w-wide gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Media"
        title="See and hear the Order"
        description="Photographs from celebrations across the church, the ESOCS YouTube channel and ESOCS Online Radio."
      />

      {latest && (
        <Link
          href={routes.album(latest.slug)}
          className="group/latest relative isolate grid min-h-[22rem] overflow-hidden rounded-panel text-white sm:min-h-[28rem]"
        >
          <Image
            src={latest.cover.url}
            alt={latest.cover.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="-z-10 object-cover transition-transform duration-700 group-hover/latest:scale-[1.02]"
          />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />
          <span className="grid content-end gap-2 p-6 sm:p-10">
            <span className="text-overline font-semibold text-white/80 uppercase">
              Latest album · {latest.photos.length} photos
            </span>
            <span className="font-display text-display-md font-extrabold text-balance">{latest.title}</span>
            <span className="text-sm text-white/80">{formatLongDate(latest.date)}</span>
          </span>
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={routes.videos()}
          className="flex items-center gap-4 rounded-panel border border-border bg-surface p-6 hover:border-border-strong"
        >
          <YoutubeIcon aria-hidden className="size-9 text-danger" />
          <span className="grid">
            <span className="font-display text-xl font-extrabold">Videos</span>
            <span className="text-sm text-muted-foreground">
              Services and messages on the ESOCS YouTube channel
            </span>
          </span>
        </Link>
        <Link
          href={routes.radio()}
          className="flex items-center gap-4 rounded-panel border border-border bg-surface p-6 hover:border-border-strong"
        >
          <Radio aria-hidden className="size-9 text-highlight" />
          <span className="grid">
            <span className="font-display text-xl font-extrabold">ESOCS Online Radio</span>
            <span className="text-sm text-muted-foreground">Listen live, wherever you are</span>
          </span>
        </Link>
      </div>

      <section aria-labelledby="albums-heading" className="grid gap-5">
        <SectionHeading
          id="albums-heading"
          title="Albums"
          description={`${galleries.length} albums, ${galleries.reduce((n, g) => n + g.photos.length, 0)} photographs.`}
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((g, i) => (
            <Reveal as="li" key={g.slug} delay={i * 60}>
              <Link href={routes.album(g.slug)} className="group/album grid gap-2">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-card bg-surface-sunken">
                  <Image
                    src={g.cover.url}
                    alt={g.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover/album:scale-[1.04]"
                  />
                  <span className="absolute right-2 bottom-2 rounded-pill bg-black/65 px-2 py-0.5 text-xs font-bold text-white tabular">
                    {g.photos.length}
                  </span>
                </span>
                <span className="leading-snug font-semibold group-hover/album:text-highlight">{g.title}</span>
                <span className="text-xs text-muted-foreground">{formatLongDate(g.date)}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
