import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Play, Sparkles, Volume2 } from "lucide-react";
import type { SacredStreamItem } from "@/data/schema/stream";
import { routes } from "@/lib/routes";

interface StreamTeaserProps {
  items: SacredStreamItem[];
}

export function StreamTeaser({ items }: StreamTeaserProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Sacred Stream Teaser"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 text-white"
    >
      {/* Background Divine Radiant Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-amber-300 uppercase">
                <Flame className="size-3.5 text-amber-400" />
                Word in Motion
              </span>
              <span className="text-xs text-slate-400">· Continuous Devotional Feed</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
              The Sacred Stream
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Immerse yourself in sermon highlights, synchronized bilingual hymns, and verified testimonies of
              faith from Mount Zion worldwide.
            </p>
          </div>

          <Link
            href={routes.stream()}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-amber-400/50 bg-amber-500/20 px-5 py-2.5 font-sans text-xs font-bold text-amber-200 shadow-lg backdrop-blur-md transition-all hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 sm:self-auto"
          >
            <Sparkles className="size-3.5 text-amber-400 transition-transform group-hover:scale-125 group-hover:text-slate-950" />
            Enter Full Stream
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Carousel Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`${routes.stream()}#${item.id}`}
              className="group relative flex aspect-[9/14] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-2xl"
            >
              {/* Media Preview Image */}
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30"
              />

              {/* Top Category Badge */}
              <div className="relative z-10 flex items-center justify-between p-3.5">
                <span className="rounded-full border border-amber-400/40 bg-black/60 px-2.5 py-1 font-mono text-[0.625rem] font-semibold text-amber-300 uppercase backdrop-blur-md">
                  {item.category.replace("-", " ")}
                </span>
                <div className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform group-hover:scale-110">
                  {item.verses ? (
                    <Volume2 className="size-3.5 text-amber-400" />
                  ) : (
                    <Play className="size-3.5 translate-x-0.5 text-amber-400" />
                  )}
                </div>
              </div>

              {/* Bottom Card Context */}
              <div className="relative z-10 p-4">
                <p className="text-[0.625rem] font-bold tracking-wider text-amber-300 uppercase">
                  {item.author}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold text-white group-hover:text-amber-200">
                  {item.title}
                </h3>
                {item.scriptureReference && (
                  <p className="mt-1 font-mono text-[0.625rem] text-slate-300">{item.scriptureReference}</p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[0.6875rem] text-slate-400">
                  <span className="flex items-center gap-1 font-mono font-medium text-amber-300/90">
                    <Sparkles className="size-3 text-amber-400" />
                    {item.amensCount.toLocaleString()} Amens
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
