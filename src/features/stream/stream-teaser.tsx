import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Radio, Sparkles, Volume2 } from "lucide-react";
import type { SacredStreamItem } from "@/data/schema/stream";
import { routes } from "@/lib/routes";

interface StreamTeaserProps {
  items: SacredStreamItem[];
}

export function StreamTeaser({ items }: StreamTeaserProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Sacred Stream Broadcast"
      className="relative overflow-hidden border-t border-border/80 bg-surface py-24 sm:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header with Generous Whitespace */}
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase shadow-xs">
              <Radio className="size-3.5 text-crimson-800 dark:text-gold-400" />
              Word in Motion · Sacred Media
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,1.8rem+2vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-foreground">
              The Sacred Stream,{" "}
              <span className="font-serif font-normal text-crimson-800 italic dark:text-gold-400">
                broadcasting truth.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Experience apostolic sermon expositions, celestial choral canticles, and testimonies of answered
              prayers from Mount Zion sanctuaries worldwide.
            </p>
          </div>

          <Link
            href={routes.stream()}
            className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-pill bg-crimson-800 px-7 text-sm font-bold text-white shadow-md transition-all hover:bg-crimson-900 hover:shadow-lg sm:self-auto dark:bg-gold-500 dark:text-neutral-950 dark:hover:bg-gold-400"
          >
            <Sparkles className="size-4 text-gold-300 dark:text-neutral-950" />
            <span>Enter Full Stream</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Media Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`${routes.stream()}#${item.id}`}
              className="group bg-surface-raised relative flex aspect-9/13 flex-col justify-between overflow-hidden rounded-panel border border-border/80 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-crimson-800/40 hover:shadow-xl dark:hover:border-gold-500/40"
            >
              {/* Media Preview Image */}
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 280px, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-black/20"
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between p-4">
                <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.625rem] font-bold tracking-wider text-white uppercase backdrop-blur-md">
                  {item.category.replace("-", " ")}
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform group-hover:scale-110">
                  {item.verses ? (
                    <Volume2 className="size-4 text-gold-300" />
                  ) : (
                    <Play className="size-4 translate-x-0.5 text-gold-300" />
                  )}
                </div>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 p-5 text-white">
                <p className="text-[0.6875rem] font-bold tracking-wider text-gold-400 uppercase">
                  {item.author}
                </p>
                <h3 className="mt-1.5 line-clamp-2 font-display text-base font-bold text-white group-hover:text-gold-200">
                  {item.title}
                </h3>
                {item.scriptureReference && (
                  <p className="mt-1 font-serif text-xs text-white/80 italic">{item.scriptureReference}</p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-xs text-white/70">
                  <span className="flex items-center gap-1 font-medium text-gold-300">
                    <Sparkles className="size-3" />
                    {item.amensCount > 0 ? `${item.amensCount.toLocaleString()} Amens` : "Proclaim Amen"}
                  </span>
                  <span>{Math.floor(item.durationSeconds)}s</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
