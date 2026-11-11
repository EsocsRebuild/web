import Link from "next/link";
import { ArrowRight, BookOpen, Check, Flame, Sparkles } from "lucide-react";
import { TODAY_DEVOTIONAL } from "./devotional-data";
import { DevotionalSubscribeForm } from "./devotional-subscribe-form";
import { routes } from "@/lib/routes";

export function DevotionalHeroBand() {
  return (
    <section
      aria-label="ESOCS Daily Devotionals Subscription and Meditation"
      className="relative overflow-hidden border-t border-border/80 bg-surface-sunken/40 py-24 sm:py-32 lg:py-36"
    >
      <div className="relative mx-auto max-w-wide px-gutter">
        {/* Section Header with Generous Whitespace */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-crimson-700/30 bg-crimson-800/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson-700 uppercase shadow-xs dark:text-crimson-300">
            <BookOpen className="size-3.5" />
            <span>Spiritual Nourishment · Word & Prayer</span>
          </div>

          <h2 className="mt-5 font-display text-[clamp(2.25rem,1.8rem+2vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-balance text-foreground">
            Grow in Your Christian Journey with{" "}
            <span className="font-serif font-normal text-crimson-700 italic dark:text-crimson-400">
              ESOCS Daily Devotionals
            </span>
          </h2>

          <p className="mt-5 text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
            Get ESOCS Daily Devotionals delivered right into your mailbox every dawn. Nourish your spirit with
            holy scripture, apostolic wisdom, and morning canticles from Mount Zion.
          </p>
        </div>

        {/* Two-Column Architecture */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Today's Sacred Meditation Preview (5 Cols) */}
          <div className="flex flex-col justify-between rounded-panel border border-border/80 bg-surface p-8 shadow-sm transition-all duration-300 hover:border-crimson-700/40 sm:p-10 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-4">
                <span className="font-mono text-xs font-bold tracking-wide text-crimson-700 dark:text-crimson-300">
                  {TODAY_DEVOTIONAL.date}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-crimson-700/20 bg-crimson-800/10 px-3 py-1 text-xs font-bold text-crimson-800 dark:text-crimson-300">
                  <Flame className="size-3.5 text-crimson-700 dark:text-crimson-400" />
                  Today&apos;s Dawn Manna
                </span>
              </div>

              <div className="mt-6">
                <span className="font-serif text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {TODAY_DEVOTIONAL.theme}
                </span>
                <h3 className="mt-2 font-display text-2xl leading-snug font-bold text-foreground">
                  {TODAY_DEVOTIONAL.title}
                </h3>
              </div>

              {/* Scripture Verse Quote Card */}
              <div className="mt-6 rounded-card border border-crimson-700/20 bg-crimson-800/5 p-5">
                <p className="font-serif text-base leading-relaxed text-foreground italic">
                  &ldquo;{TODAY_DEVOTIONAL.scriptureText}&rdquo;
                </p>
                <p className="mt-3 text-right font-mono text-xs font-bold text-crimson-700 dark:text-crimson-400">
                  — {TODAY_DEVOTIONAL.scriptureVerse}
                </p>
              </div>

              {/* Excerpt */}
              <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {TODAY_DEVOTIONAL.exhortation[0]}
              </p>

              {/* Hymn & Canticle Harmony */}
              <div className="mt-5 flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="rounded-md border border-border bg-surface-sunken px-2.5 py-1 font-mono text-xs font-bold text-crimson-700 dark:text-crimson-300">
                  Hymn {TODAY_DEVOTIONAL.hymnNumber}
                </span>
                <span className="truncate font-medium">{TODAY_DEVOTIONAL.hymnTitle}</span>
              </div>
            </div>

            <div className="mt-8 border-t border-border/80 pt-6">
              <Link
                href={routes.devotional()}
                className="group flex items-center justify-between text-sm font-bold text-crimson-700 hover:text-crimson-800 dark:text-crimson-400 dark:hover:text-crimson-300"
              >
                <span>Read Today&apos;s Full Meditation & Prayer</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Inscription / Subscription Portal (7 Cols) */}
          <div className="flex flex-col justify-between rounded-panel border border-border/80 bg-surface p-8 shadow-sm sm:p-10 lg:col-span-7">
            <div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-crimson-700 dark:text-crimson-400" />
                <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Inscribe Your Mailbox into Daily Fellowship
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Join thousands of brethren worldwide receiving daily spiritual strength, apostolic guidance,
                and liturgical prayer every morning before the sun rises.
              </p>

              {/* Interactive Subscription Form */}
              <div className="mt-8">
                <DevotionalSubscribeForm variant="hero" />
              </div>
            </div>

            {/* Spiritual Guarantees */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-border/80 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                <Check className="size-4 shrink-0 text-crimson-700 dark:text-crimson-400" />
                <span>Holy Scripture & Meditation at Dawn</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                <Check className="size-4 shrink-0 text-crimson-700 dark:text-crimson-400" />
                <span>Apostolic Ministry from Mount Zion</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                <Check className="size-4 shrink-0 text-crimson-700 dark:text-crimson-400" />
                <span>Canticle & Hymn Harmonies</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                <Check className="size-4 shrink-0 text-crimson-700 dark:text-crimson-400" />
                <span>100% Free · One Fold, One Shepherd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
