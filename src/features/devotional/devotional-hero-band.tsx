import Link from "next/link";
import { ArrowRight, BookOpen, Check, Flame, Sparkles } from "lucide-react";
import { TODAY_DEVOTIONAL } from "./devotional-data";
import { DevotionalSubscribeForm } from "./devotional-subscribe-form";
import { routes } from "@/lib/routes";

export function DevotionalHeroBand() {
  return (
    <section
      aria-label="ESOCS Daily Devotionals Subscription and Meditation"
      className="relative overflow-hidden bg-linear-to-b from-[#040814] via-[#09132e] to-[#040814] py-16 text-white sm:py-20 lg:py-24"
    >
      {/* Background Divine Radial Illumination */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/4 h-[400px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-wide px-gutter">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider text-amber-300 uppercase shadow-md backdrop-blur-md">
            <BookOpen className="size-3.5 text-amber-400" />
            <span>Spiritual Nourishment · Word & Prayer</span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance text-white sm:text-4xl md:text-5xl">
            Grow in Your Christian Journey with ESOCS Daily Devotionals
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-balance text-slate-300 sm:text-base md:text-lg">
            Get ESOCS Daily Devotionals right into your mailbox every dawn. Nourish your spirit with holy
            scripture, apostolic wisdom, and morning canticles from Mount Zion.
          </p>
        </div>

        {/* Two-Column Premium Architecture */}
        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Today's Sacred Meditation Preview (5 Cols) */}
          <div className="flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-semibold tracking-wide text-amber-300">
                  {TODAY_DEVOTIONAL.date}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-2.5 py-0.5 text-[0.625rem] font-semibold text-emerald-300">
                  <Flame className="size-3 text-emerald-400" />
                  Today&apos;s Dawn Manna
                </span>
              </div>

              <div className="mt-5">
                <span className="font-serif text-xs font-medium tracking-wider text-amber-400 uppercase">
                  {TODAY_DEVOTIONAL.theme}
                </span>
                <h3 className="mt-1.5 font-display text-xl leading-snug font-bold text-white sm:text-2xl">
                  {TODAY_DEVOTIONAL.title}
                </h3>
              </div>

              {/* Scripture Verse Quote Card */}
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4">
                <p className="font-serif text-sm leading-relaxed text-amber-200 italic sm:text-base">
                  &ldquo;{TODAY_DEVOTIONAL.scriptureText}&rdquo;
                </p>
                <p className="mt-2 text-right font-mono text-xs font-bold text-amber-400">
                  — {TODAY_DEVOTIONAL.scriptureVerse}
                </p>
              </div>

              {/* Excerpt */}
              <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {TODAY_DEVOTIONAL.exhortation[0]}
              </p>

              {/* Hymn & Canticle Harmony */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-md border border-white/10 bg-slate-900 px-2 py-0.5 font-mono text-[0.6875rem] text-amber-300">
                  {TODAY_DEVOTIONAL.hymnNumber}
                </span>
                <span className="truncate">{TODAY_DEVOTIONAL.hymnTitle}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <Link
                href={routes.devotional()}
                className="group flex items-center justify-between text-xs font-bold text-amber-300 transition-colors hover:text-amber-200"
              >
                <span>Read Today&apos;s Full Meditation & Prayer</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Inscription / Subscription Portal (7 Cols) */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-linear-to-b from-slate-900/90 to-slate-950/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:col-span-7">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-white sm:text-xl">
                  Inscribe Your Mailbox into Daily Fellowship
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Join thousands of brethren worldwide receiving daily spiritual strength, prophetic guidance,
                and liturgical prayer every morning before the sun rises.
              </p>

              {/* Interactive Subscription Form */}
              <div className="mt-6">
                <DevotionalSubscribeForm variant="hero" />
              </div>
            </div>

            {/* Spiritual Pillars / Guarantees */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="size-4 shrink-0 text-emerald-400" />
                <span>Holy Scripture & Meditation at Dawn</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="size-4 shrink-0 text-emerald-400" />
                <span>Apostolic Ministry from Mount Zion</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="size-4 shrink-0 text-emerald-400" />
                <span>Canticle & Hymn Harmonies</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="size-4 shrink-0 text-emerald-400" />
                <span>100% Free · One Fold, One Shepherd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
