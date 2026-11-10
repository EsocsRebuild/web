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
      className="relative overflow-hidden border-t border-border/80 bg-surface py-20 sm:py-24"
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
              <Radio className="size-3.5" />
              Word in Motion · Sacred Media
            </span>
            <h2 className="mt-4 font-display text-[clamp(2rem,1.6rem+1.8vw,3.25rem)] leading-[1.12] font-extrabold tracking-tight text-foreground">
              The Sacred Stream,{" "}
              <span className="font-serif font-normal text-accent italic">broadcasting truth.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Experience apostolic sermon expositions, celestial choral canticles, and testimonies of answered
              prayers from Mount Zion sanctuaries worldwide.
            </p>
          </div>

          <Link
            href={routes.stream()}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-pill bg-royal-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-royal-800 sm:self-auto dark:bg-gold-400 dark:text-royal-950 dark:hover:bg-gold-300"
          >
            <Sparkles className="size-4" />
            <span>Enter Full Stream</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Media Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`${routes.stream()}#${item.id}`}
              className="group bg-surface-raised relative flex aspect-[9/13] flex-col justify-between overflow-hidden rounded-panel border border-border/80 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-xl"
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
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20"
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between p-4">
                <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[0.625rem] font-bold tracking-wider text-gold-300 uppercase backdrop-blur-md">
                  {item.category.replace("-", " ")}
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform group-hover:scale-110">
                  {item.verses ? (
                    <Volume2 className="size-4 text-gold-400" />
                  ) : (
                    <Play className="size-4 translate-x-0.5 text-gold-400" />
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
