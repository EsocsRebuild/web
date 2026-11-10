import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, Flame, Heart, Music, Share2, Sparkles, Sun } from "lucide-react";
import { TODAY_DEVOTIONAL, WEEKLY_READING_PLAN } from "@/features/devotional/devotional-data";
import { DevotionalSubscribeForm } from "@/features/devotional/devotional-subscribe-form";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "ESOCS Daily Devotionals · Grow in Your Christian Journey",
  description:
    "Grow in your Christian journey with the official ESOCS Daily Devotionals. Get daily holy scriptures, apostolic exhortations, and liturgical morning prayers right into your mailbox every dawn.",
};

export default function DevotionalPage() {
  return (
    <main className="min-h-dvh bg-[#040814] text-white">
      {/* 1. Celestial Header & Breadcrumb */}
      <section className="relative overflow-hidden border-b border-white/10 bg-linear-to-b from-slate-950 via-[#070e24] to-[#040814] pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_70%)] blur-3xl"
        />

        <div className="relative mx-auto max-w-wide px-gutter">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
            <Link href={routes.home()} className="transition-colors hover:text-amber-300">
              Sanctuary Home
            </Link>
            <ChevronRight className="size-3 text-slate-600" />
            <span className="font-medium text-amber-300">Daily Devotionals</span>
          </nav>

          <div className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase backdrop-blur-md">
                <Sun className="size-3.5 text-amber-400" />
                <span>The Dawn Dew of Mount Zion</span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                ESOCS Daily Devotionals
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                A daily sanctuary of apostolic exhortation, holy scripture, and sacred canticles to strengthen
                your walk in holiness with Jesus Christ.
              </p>
            </div>

            {/* Quick Stats or Seal */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 shadow-xl backdrop-blur-md">
              <div className="relative size-10 overflow-hidden rounded-full border border-amber-400/50 bg-black p-0.5">
                <Image
                  src="/brand/esocs-crest.png"
                  alt="Official ESOCS Crest"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <p className="font-serif text-xs font-bold text-amber-200">Mount Zion Worldwide</p>
                <p className="font-mono text-[0.625rem] text-slate-400">One Fold · One Shepherd</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Body Grid: Today's Devotional & Mailbox Inscription Portal */}
      <section className="mx-auto max-w-wide px-gutter py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Today's Full Devotional (8 cols) */}
          <article className="lg:col-span-8">
            <header className="rounded-3xl border border-amber-500/30 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-300">
                  <Calendar className="size-4 text-amber-400" />
                  {TODAY_DEVOTIONAL.date}
                </span>
                <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-mono text-[0.6875rem] font-semibold text-amber-300 uppercase">
                  {TODAY_DEVOTIONAL.theme}
                </span>
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                {TODAY_DEVOTIONAL.title}
              </h2>

              {/* Central Scripture Anchor */}
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-linear-to-b from-amber-950/30 to-slate-950/60 p-5 shadow-inner sm:p-6">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  <BookOpen className="size-4 text-amber-400" />
                  <span>Scripture Anchor · {TODAY_DEVOTIONAL.scriptureReference}</span>
                </div>
                <blockquote className="mt-3 font-serif text-lg leading-relaxed text-amber-100 italic sm:text-xl">
                  &ldquo;{TODAY_DEVOTIONAL.scriptureText}&rdquo;
                </blockquote>
                <p className="mt-2 text-right font-mono text-xs font-bold text-amber-400">
                  — {TODAY_DEVOTIONAL.scriptureVerse}
                </p>
              </div>

              {/* Memory Verse Badge */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-slate-900/60 p-3.5 text-xs text-slate-300">
                <Flame className="size-4 shrink-0 text-amber-400" />
                <div>
                  <span className="font-semibold text-white">Memory Verse: </span>
                  <span className="font-serif text-amber-200 italic">{TODAY_DEVOTIONAL.memoryVerse}</span>
                </div>
              </div>
            </header>

            {/* Exhortation Text */}
            <div className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-sm leading-relaxed text-slate-200 sm:p-8 sm:text-base">
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-amber-300">
                <Sparkles className="size-4 text-amber-400" />
                The Apostolic Exhortation
              </h3>

              {TODAY_DEVOTIONAL.exhortation.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {/* Action Step */}
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
                <h4 className="flex items-center gap-2 font-sans text-xs font-bold tracking-wider text-emerald-300 uppercase">
                  <Heart className="size-4 text-emerald-400" />
                  Walk of Faith Today
                </h4>
                <p className="mt-2 text-xs text-slate-300 sm:text-sm">{TODAY_DEVOTIONAL.actionStep}</p>
              </div>

              {/* Hymn & Canticle */}
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-950/15 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  <Music className="size-4 text-amber-400" />
                  <span>Canticle for Meditation</span>
                </div>
                <p className="mt-2 font-serif text-sm font-bold text-white sm:text-base">
                  {TODAY_DEVOTIONAL.hymnTitle}
                </p>
                <p className="mt-0.5 font-mono text-xs text-amber-300">
                  {TODAY_DEVOTIONAL.hymnNumber} · Sung across all houses of prayer
                </p>
              </div>

              {/* Morning Prayer Proclamation */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-slate-900/80 p-5 shadow-xl sm:p-6">
                <h4 className="font-serif text-sm font-bold text-amber-300">
                  Morning Liturgical Prayer Proclamation
                </h4>
                <p className="mt-2 font-serif text-xs leading-relaxed text-slate-200 italic sm:text-sm">
                  &ldquo;{TODAY_DEVOTIONAL.morningPrayer}&rdquo;
                </p>
              </div>

              {/* Evening Reading Note */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <span>
                  <strong className="text-slate-300">Evening Vespers:</strong>{" "}
                  {TODAY_DEVOTIONAL.eveningReading}
                </span>
                <span className="font-mono text-[0.625rem] text-slate-500">Mount Zion Order</span>
              </div>
            </div>
          </article>

          {/* Right Column: Mailbox Subscription Portal & Weekly Reading Plan (4 cols) */}
          <aside className="space-y-8 lg:col-span-4">
            {/* The Main Priority Mailbox Inscription Card */}
            <div className="rounded-3xl border border-amber-400/40 bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-amber-300 uppercase">
                <Flame className="size-3 text-amber-400" />
                Never Miss Dawn Manna
              </div>

              <h3 className="mt-3 font-serif text-xl font-bold text-white">
                Get ESOCS Daily Devotionals in Your Mailbox
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Receive the morning scripture, reflection, and hymn right in your inbox every day at dawn
                (5:30 AM). Free for every believer.
              </p>

              {/* Embedded Inscription Form */}
              <div className="mt-5">
                <DevotionalSubscribeForm variant="card" />
              </div>
            </div>

            {/* Weekly Scripture Reading Plan */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <BookOpen className="size-4 text-amber-400" />
                <h4 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                  Weekly Reading Plan
                </h4>
              </div>

              <ul className="mt-4 space-y-1 divide-y divide-white/5">
                {WEEKLY_READING_PLAN.map((item) => (
                  <li key={item.day} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">{item.day}</span>
                      <span className="font-mono text-[0.6875rem] text-slate-400">{item.scripture}</span>
                    </div>
                    <p className="mt-0.5 text-[0.6875rem] text-slate-300">{item.theme}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fellowship Sharing */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-center">
              <p className="text-xs font-semibold text-slate-300">
                Share this word of faith with your band or brethren
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Link
                  href={routes.stream()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400 hover:text-slate-950"
                >
                  <Share2 className="size-3.5" />
                  Explore Sacred Stream
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
