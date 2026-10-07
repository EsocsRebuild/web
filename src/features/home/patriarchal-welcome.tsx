"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Copy,
  Crown,
  Heart,
  Maximize2,
  MessageSquare,
  Quote,
  Scroll,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import { Cover } from "@/components/patterns/cover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ImageRef, Organisation, Person } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import styles from "./home-architecture.module.scss";

export interface PatriarchalWelcomeProps {
  message: Organisation["message"];
  shepherd?: Person;
  portrait?: ImageRef | null;
  href: string;
}

/**
 * Three curated pastoral pillars extracted from the Baba Aladura's address
 * for rapid, high-impact executive reading.
 */
const THEMATIC_PILLARS = [
  {
    icon: Compass,
    title: "Sovereign Deliverance & Thanksgiving",
    summary:
      "Witnessing global catastrophes, conflict, and economic hardship—yet sustained and kept alive by God's endless mercies.",
  },
  {
    icon: Sparkles,
    title: "Christ the Chief Cornerstone",
    summary:
      "Approaching our new centenary by anchoring every ambition and belief solely on Jesus Christ as the central pillar of our existence.",
  },
  {
    icon: Heart,
    title: "The Apostolic Charge (1 Cor 15:58)",
    summary:
      "A charge to share love, show forgiveness, and remain steadfast, unmovable, and always abounding in the work of the Lord.",
  },
];

export function PatriarchalWelcome({ message, shepherd, portrait, href }: PatriarchalWelcomeProps) {
  // Scroll reader mode is inactive initially; activates ONLY when user clicks "Complete Reading · 3 mins" or "Read Full Pastoral Epistle"
  const [readingActive, setReadingActive] = React.useState(false);
  const [readerOpen, setReaderOpen] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<"normal" | "large" | "xlarge">("normal");
  const [copied, setCopied] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(false);

  const scrollPaneRef = React.useRef<HTMLDivElement>(null);

  const [opening = "", ...rest] = message.body;
  // Opening liturgical blessing
  const greeting = opening.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
  const remainingOpening = opening.slice(greeting.length).trim();
  const allParagraphs = [remainingOpening, ...rest].filter(Boolean);

  const handleScroll = () => {
    const el = scrollPaneRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setScrollProgress(100);
      setIsScrolledToBottom(true);
      return;
    }
    const current = Math.min(100, Math.max(0, Math.round((el.scrollTop / maxScroll) * 100)));
    setScrollProgress(current);
    setIsScrolledToBottom(current >= 95);
  };

  const copyEpistleBlessing = async () => {
    const textToCopy = `“${greeting}”\n\n— His Most Eminence, Baba Aladura Dr. David D. L. Bob-Manuel, Moses Orimolade IX & Prelate of the ESOCS Church Worldwide.\nWatchword: Sustained by God's Endless Mercies (Lam 3:21)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const activateReadingMode = () => {
    setReadingActive(true);
    setScrollProgress(0);
    setIsScrolledToBottom(false);
  };

  return (
    <section
      aria-labelledby="patriarchal-welcome-title"
      className={cn(styles.precinctStage, "relative isolate py-12 sm:py-16 lg:py-20")}
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Sacred Canopy Overline / Ecclesiastical Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className={styles.epistleRibbon}>
              <Crown className="size-3.5 text-accent" aria-hidden />
              Seat of the Baba Aladura &amp; Prelate
            </span>
            <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Centenary Era · 1925 – 2026
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Scroll className="size-3.5 text-accent" aria-hidden />
            <span>Pastoral Address · 1 Corinthians 15:58</span>
          </div>
        </div>

        {/* Section Heading Banner */}
        <div className="mb-8">
          <p className="text-overline font-semibold text-highlight uppercase">
            A Welcome from the Baba Aladura
          </p>
          <h2
            id="patriarchal-welcome-title"
            className="mt-1 font-display text-[clamp(1.75rem,1.4rem+1.6vw,3.25rem)] leading-[1.15] font-extrabold tracking-tight text-balance text-foreground"
          >
            Welcome to ESOCS Worldwide,{" "}
            <span className="font-serif font-normal text-accent italic">in Christ.</span>
          </h2>
        </div>

        {/* Dual-Monolith Layout with Locked Proportions */}
        <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[25rem_minmax(0,1fr)] xl:gap-12">
          {/* Left Monument: Altar Portrait & Ecclesiastical Inscription Board */}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-gold-500/30 bg-royal-950 shadow-2xl transition-all duration-300 hover:border-gold-400/50">
              {/* Portrait Canvas */}
              <div className="relative aspect-4/5 w-full overflow-hidden bg-linear-to-b from-royal-900 via-royal-950 to-royal-950 sm:aspect-4/3 lg:aspect-4/5">
                {portrait ? (
                  <SmartImage
                    image={portrait}
                    fill
                    sizes="(min-width: 1280px) 400px, (min-width: 1024px) 352px, 100vw"
                    className="object-cover object-top transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <Cover image={null} kind="holy-order" className="absolute inset-0" />
                )}

                {/* Altar Shadowing Overlay */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-royal-950 via-royal-950/60 to-transparent"
                />

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-950/90 px-3.5 py-1 text-xs font-bold text-gold-300 shadow-md ring-1 ring-gold-400/50 backdrop-blur-md">
                    <span className="size-2 animate-pulse rounded-full bg-gold-400" />
                    Reigning Prelate
                  </span>
                </div>
              </div>

              {/* The Plinth: Formal Ecclesiastical Credentials */}
              <div className="border-t border-gold-500/20 bg-royal-950 p-6 text-white">
                <div className="mb-1 flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-widest text-gold-400 uppercase">
                  <Crown className="size-3.5 shrink-0 text-gold-400" />
                  <span>His Most Eminence</span>
                </div>
                <h3 className="font-display text-xl leading-snug font-extrabold tracking-tight text-white sm:text-2xl">
                  {shepherd
                    ? `${shepherd.honorific} ${shepherd.name}`
                    : "Elder (Dr.) David Dabaye Lamjose Bob-Manuel"}
                </h3>
                <p className="mt-1 text-xs leading-relaxed font-semibold text-gold-200/90">
                  Moses Orimolade IX · Prelate of the ESOCS Church Worldwide
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/15 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 px-3.5 py-1 text-xs font-semibold text-gold-300 shadow-xs ring-1 ring-gold-400/30">
                    <span>Watchword: Sustained by God&apos;s Endless Mercies</span>
                    <span className="text-gold-400/60">·</span>
                    <span className="font-bold">Lam. 3:21</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation to Succession */}
            <div className="mt-3 flex items-center justify-between px-1">
              <Link
                href={routes.leaders()}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>The Succession of Baba Aladuras (1925 – Present)</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Monument: Transitions seamlessly between Overview and Scrollable Reader */}
          {readingActive ? (
            /* =================================================================== */
            /* ACTIVATED STATE: SCROLLABLE LITURGICAL READER DECK                 */
            /* Scroll effect is active ONLY now, strictly bounded inside the card */
            /* =================================================================== */
            <div className={styles.scrollDeck}>
              {/* Pinned Deck Header with Mode Indicator & Progress Bar */}
              <div className={styles.scrollDeckHeader}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingActive(false)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground shadow-xs transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    <ArrowLeft className="size-3" />
                    <span>Summary Overview</span>
                  </button>
                  <span className="text-xs font-bold text-foreground">
                    Patriarchal Epistle · Full Address
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                    {scrollProgress}% Read
                  </span>
                  <button
                    type="button"
                    onClick={() => setReaderOpen(true)}
                    title="Open dedicated reading chamber"
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-control border border-border bg-surface text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    <Maximize2 className="size-3.5" />
                    <span className="sr-only">Dedicated chamber view</span>
                  </button>
                </div>

                {/* Dynamic Reading Progress Filament */}
                <div className={styles.readingProgressTrack}>
                  <div className={styles.readingProgressBar} style={{ width: `${scrollProgress}%` }} />
                </div>
              </div>

              {/* Scrollable Reading Viewport (Active Scroll Effect) */}
              <div ref={scrollPaneRef} onScroll={handleScroll} className={styles.scrollPane}>
                <div className="grid gap-6">
                  {/* Opening Liturgical Proclamation Quote */}
                  {greeting && (
                    <div className="relative rounded-card border-l-3 border-gold-500 bg-surface-muted/70 p-5">
                      <Quote aria-hidden className="absolute top-4 right-4 size-7 text-gold-500/20" />
                      <p className="font-serif text-lg leading-relaxed text-foreground italic sm:text-xl">
                        “{greeting}”
                      </p>
                      <p className="mt-2 text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase dark:text-gold-400">
                        — Opening Apostolic Benediction
                      </p>
                    </div>
                  )}

                  {/* Formatted Pastoral Paragraphs */}
                  <div className="grid gap-4.5 text-[0.9375rem] leading-7 text-foreground/90 sm:text-base sm:leading-8">
                    {allParagraphs.map((para, index) => {
                      const isScripture = /1 Corinthians 15:58/i.test(para);
                      const isSignature = /Your praying father/i.test(para) || /MOSES ORIMOLADE/i.test(para);

                      if (isScripture) {
                        return (
                          <div
                            key={index}
                            className="my-2 rounded-card border-l-3 border-gold-500 bg-gold-400/10 p-4 sm:p-5"
                          >
                            <p className="font-serif font-medium text-foreground">{para}</p>
                          </div>
                        );
                      }

                      if (isSignature) {
                        return (
                          <div
                            key={index}
                            className="mt-4 border-t border-border pt-4 font-display font-semibold tracking-wide text-foreground"
                          >
                            <p className="text-muted-foreground italic">Your praying father,</p>
                            <p className="mt-1 text-sm font-bold text-accent sm:text-base">
                              HIS MOST EMINENCE, BABA ALADURA DR. DAVID D. L. BOB-MANUEL
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground">
                              Moses Orimolade IX &amp; Prelate of the ESOCS Church Worldwide
                            </p>
                          </div>
                        );
                      }

                      return (
                        <p key={index} className="text-balance">
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pinned Deck Footer */}
              <div className={styles.scrollDeckFooter}>
                <div className="flex items-center gap-2">
                  <span className={styles.scrollHintBadge}>
                    {isScrolledToBottom ? (
                      <>
                        <Check className="size-3 text-success" />
                        <span>End of Epistle</span>
                      </>
                    ) : (
                      <>
                        <Scroll className="size-3 text-accent" />
                        <span>Scroll down to continue reading ↓</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingActive(false)}
                    className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 text-xs font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    <span>Summary Overview</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyEpistleBlessing}
                    className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-success" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy Blessing</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={href}
                    aria-label={`Comment on the ${message.title}`}
                    className="inline-flex min-h-8 items-center gap-1 rounded-control bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    <span>Comment on the {message.title}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* INITIAL STATE: HIGH-IMPACT EXECUTIVE OVERVIEW                      */
            /* Zero scroll effect here; compact, dignified, propels next sections */
            /* =================================================================== */
            <div className="flex flex-col justify-between gap-6 sm:gap-8 lg:mt-2">
              <div className="grid gap-6 sm:gap-7">
                {/* Illuminated Opening Apostolic Greeting */}
                {greeting && (
                  <div className="relative rounded-2xl border border-border/80 bg-surface-muted/60 p-6 shadow-2xs transition-all hover:border-border sm:p-7">
                    <Quote
                      aria-hidden
                      className="absolute top-5 right-5 size-8 text-gold-500/20 sm:size-10"
                    />
                    <p className="font-serif text-xl leading-relaxed text-foreground italic sm:text-2xl sm:leading-relaxed">
                      “{greeting}”
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-px w-6 bg-gold-500/40" />
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        — Apostolic Greeting &amp; Opening Benediction
                      </p>
                    </div>
                  </div>
                )}

                {/* Thematic Movement Cards: Clear, Responsive Synthesis */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {THEMATIC_PILLARS.map(({ icon: Icon, title, summary }, i) => (
                    <div
                      key={title}
                      className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/80 p-4.5 shadow-2xs transition-all duration-300 hover:border-gold-500/40 hover:bg-surface hover:shadow-md sm:p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-gold-400/10 text-gold-600 ring-1 ring-gold-400/20 dark:text-gold-300">
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <span className="text-[0.6875rem] font-bold tracking-widest text-muted-foreground uppercase">
                            Part 0{i + 1}
                          </span>
                        </div>
                        <h4 className="mt-3 font-display text-sm leading-snug font-bold text-foreground transition-colors group-hover:text-gold-600 dark:group-hover:text-gold-400">
                          {title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{summary}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consecrated Scripture Tablet (1 Corinthians 15:58) */}
                <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-linear-to-r from-gold-400/10 via-surface-muted/80 to-surface p-5 shadow-2xs transition-all hover:border-gold-500/50 sm:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-600 ring-1 ring-gold-400/30 dark:text-gold-400">
                      <Scroll className="size-4" aria-hidden />
                    </div>
                    <div className="space-y-2">
                      <blockquote className="font-serif text-base leading-relaxed text-foreground italic sm:text-lg sm:leading-relaxed">
                        “Therefore, my beloved brethren, be ye steadfast, unmoveable, always abounding in the
                        work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.”
                      </blockquote>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-3 py-1 text-xs font-bold tracking-wider text-gold-800 uppercase ring-1 ring-gold-400/30 dark:text-gold-300">
                          1 Corinthians 15:58
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patriarchal Action & Reading Control Dock */}
              <div className="mt-2 rounded-2xl border border-border/80 bg-surface-muted/50 p-4 shadow-2xs transition-all hover:border-border hover:bg-surface-muted/70 sm:p-5">
                <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:justify-between">
                  {/* HERO READING ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* PRIMARY ACTION: Activates the in-card Scrollable Reader */}
                    <button
                      type="button"
                      onClick={activateReadingMode}
                      className="group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-r from-royal-800 via-royal-900 to-royal-950 px-5.5 text-xs font-bold tracking-wide text-white shadow-md shadow-royal-950/20 transition-all hover:from-royal-700 hover:to-royal-900 active:scale-[0.98] sm:text-sm"
                    >
                      <BookOpen
                        className="size-4 text-gold-300 transition-transform group-hover:scale-110"
                        aria-hidden
                      />
                      <span>Complete Reading · 3 mins</span>
                    </button>

                    {/* Dedicated Chamber Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setReaderOpen(true)}
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-surface/90 px-4 text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-gold-500/60 hover:bg-surface active:scale-[0.98]"
                    >
                      <Maximize2 className="size-3.5 text-gold-500" aria-hidden />
                      <span>Dedicated Chamber</span>
                    </button>
                  </div>

                  {/* FELLOWSHIP & UTILITY TOOLSET */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 xl:border-t-0 xl:pt-0">
                    {/* Comment / Amen Link */}
                    <Link
                      href={href}
                      aria-label={`Comment on the ${message.title}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border/80 bg-surface px-3.5 text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-border-strong hover:bg-surface-muted active:scale-[0.98]"
                    >
                      <MessageSquare className="size-3.5 text-accent" aria-hidden />
                      <span>Comment on {message.title}</span>
                      <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
                    </Link>

                    {/* Fast Copy Blessing Button */}
                    <button
                      type="button"
                      onClick={copyEpistleBlessing}
                      title="Copy opening pastoral blessing"
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-surface px-3 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:border-border-strong hover:bg-surface-muted hover:text-foreground active:scale-[0.98]"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-success" />
                          <span className="font-bold text-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-muted-foreground" />
                          <span>Copy Blessing</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED LITURGICAL EPISTLE READER MODAL                                */}
      {/* Centered with fixed positioning, no relative position conflicts.        */}
      {/* ========================================================================= */}
      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-card border border-border bg-surface p-0 shadow-2xl sm:max-w-3xl sm:rounded-panel">
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:px-8">
            <DialogHeader className="p-0 pr-4">
              <div className="flex items-center gap-2">
                <Crown className="size-4 text-accent" />
                <span className="text-[0.6875rem] font-bold tracking-widest text-accent uppercase">
                  Patriarchal Epistle
                </span>
              </div>
              <DialogTitle className="font-display text-lg font-bold sm:text-xl">
                {message.title} · His Most Eminence
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full pastoral new year address and apostolic exhortation from the Baba Aladura and Prelate of
                ESOCS Church Worldwide.
              </DialogDescription>
            </DialogHeader>

            {/* Typography Scaler Controls */}
            <div className="flex items-center gap-1.5 pr-12">
              <span className="hidden text-xs text-muted-foreground sm:inline">Size:</span>
              <button
                type="button"
                data-active={fontSize === "normal"}
                onClick={() => setFontSize("normal")}
                className={styles.sizeAdjusterButton}
                title="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                data-active={fontSize === "large"}
                onClick={() => setFontSize("large")}
                className={styles.sizeAdjusterButton}
                title="Large font size"
              >
                A+
              </button>
              <button
                type="button"
                data-active={fontSize === "xlarge"}
                onClick={() => setFontSize("xlarge")}
                className={styles.sizeAdjusterButton}
                title="Extra large font size"
              >
                A++
              </button>
            </div>
          </div>

          {/* Modal Epistle Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
            {/* Epistle Letterhead Banner */}
            <div className="mb-8 border-b border-border pb-6 text-center">
              <p className="text-[0.6875rem] font-bold tracking-widest text-gold-800 uppercase dark:text-gold-400">
                The Eternal Sacred Order of the Cherubim &amp; Seraphim Worldwide
              </p>
              <h3 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
                Apostolic Address to the Flock of Christ
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Given at Mount Zion General Headquarters · Centenary Era (1925–2026)
              </p>
            </div>

            {/* Opening Blessing */}
            {greeting && (
              <div className="mb-8 rounded-card border-l-4 border-gold-500 bg-surface-muted p-5 sm:p-6">
                <p className="font-serif text-lg leading-relaxed text-foreground italic sm:text-xl">
                  “{greeting}”
                </p>
              </div>
            )}

            {/* Formatted Content Paragraphs */}
            <div
              className={cn(
                "grid gap-5 text-foreground/90 transition-all",
                fontSize === "normal" && "text-base leading-7 sm:text-[1.0625rem] sm:leading-8",
                fontSize === "large" && "text-lg leading-8 sm:text-[1.1875rem] sm:leading-9",
                fontSize === "xlarge" && "text-xl leading-9 sm:text-[1.3125rem] sm:leading-10",
              )}
            >
              {allParagraphs.map((para, index) => {
                const isScripturePara = /1 Corinthians 15:58/i.test(para);
                const isSignaturePara = /Your praying father/i.test(para) || /MOSES ORIMOLADE/i.test(para);

                if (isScripturePara) {
                  return (
                    <div
                      key={index}
                      className="my-3 rounded-card border border-gold-400/40 bg-gold-400/5 p-5"
                    >
                      <p className="font-serif font-medium">{para}</p>
                    </div>
                  );
                }

                if (isSignaturePara) {
                  return (
                    <div
                      key={index}
                      className="mt-6 border-t border-border pt-6 font-display font-semibold tracking-wide text-foreground"
                    >
                      <p className="text-muted-foreground italic">Your praying father,</p>
                      <p className="mt-2 text-base font-bold text-accent sm:text-lg">
                        HIS MOST EMINENCE, BABA ALADURA DR. DAVID D. L. BOB-MANUEL
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Moses Orimolade IX &amp; Prelate of the ESOCS Church Worldwide
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={index} className="text-balance">
                    {para}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted/60 px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={copyEpistleBlessing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" />
                  <span>Blessing copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Pastoral Blessing</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <Link
                href={href}
                onClick={() => setReaderOpen(false)}
                aria-label={`Comment on the ${message.title}`}
                className="inline-flex min-h-9 items-center gap-1 rounded-control bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <span>Comment on the {message.title}</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
