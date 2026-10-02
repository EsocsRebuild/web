"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Copy,
  Crown,
  Heart,
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

import styles from "./patriarchal-welcome.module.scss";

export interface PatriarchalWelcomeProps {
  message: Organisation["message"];
  shepherd?: Person;
  portrait?: ImageRef | null;
  href: string;
}

/**
 * Three curated pastoral pillars extracted from the Baba Aladura's address
 * for rapid, high-impact executive reading without layout distortion.
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
  const [readerOpen, setReaderOpen] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<"normal" | "large" | "xlarge">("normal");
  const [copied, setCopied] = React.useState(false);

  const [opening = "", ...rest] = message.body;
  // Opening liturgical blessing
  const greeting = opening.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
  const remainingOpening = opening.slice(greeting.length).trim();
  const allParagraphs = [remainingOpening, ...rest].filter(Boolean);

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

  return (
    <section
      aria-labelledby="patriarchal-welcome-title"
      className={cn(styles.precinctStage, "relative isolate py-16 sm:py-20 lg:py-24")}
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Sacred Canopy Overline / Ecclesiastical Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={styles.epistleRibbon}>
              <Crown className="size-3.5 text-accent" aria-hidden />
              Seat of the Baba Aladura & Prelate
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

        {/* Responsive Dual-Monolith Layout */}
        <div className="grid gap-12 lg:grid-cols-[24rem_minmax(0,1fr)] xl:grid-cols-[27rem_minmax(0,1fr)] xl:gap-16">
          {/* Left Monument: Altar Portrait & Ecclesiastical Inscription Board */}
          <div className="flex flex-col">
            <div className={cn(styles.monolithFrame, "shadow-monolith flex flex-col")}>
              {/* Portrait Canvas */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-royal-950 sm:aspect-[4/3] lg:aspect-[4/5]">
                {portrait ? (
                  <SmartImage
                    image={portrait}
                    fill
                    sizes="(min-width: 1280px) 432px, (min-width: 1024px) 384px, 100vw"
                    className="object-cover object-[60%_25%] transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <Cover image={null} kind="holy-order" className="absolute inset-0" />
                )}

                {/* Subtle Altar Shadowing */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-royal-950/90 via-royal-950/40 to-transparent"
                />

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-royal-950/90 px-3 py-1 text-xs font-semibold text-gold-300 ring-1 ring-gold-400/40">
                    <span className="size-2 rounded-full bg-gold-400" />
                    Reigning Prelate
                  </span>
                </div>
              </div>

              {/* The Plinth: Formal Ecclesiastical Credentials */}
              <div className={styles.prelatePlinth}>
                <p className="text-[0.6875rem] font-bold tracking-widest text-gold-400 uppercase">
                  His Most Eminence
                </p>
                <h3 className="mt-1 font-display text-lg font-extrabold text-white sm:text-xl">
                  {shepherd ? `${shepherd.honorific} ${shepherd.name}` : "Dr. David D. L. Bob-Manuel"}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-white/80">
                  Moses Orimolade IX · Prelate of the ESOCS Church Worldwide
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-[0.6875rem] text-gold-200/90">
                  <span>Watchword: Sustained by God&apos;s Endless Mercies</span>
                  <span className="text-white/40">·</span>
                  <span>Lam. 3:21</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation to Succession */}
            <div className="mt-4 flex items-center justify-between px-1">
              <Link
                href={routes.leaders()}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>The Succession of Baba Aladuras (1925 – Present)</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Monument: The Apostolic Epistle Showcase */}
          <div className="flex flex-col justify-between gap-8">
            <div className="grid gap-6">
              {/* Section Heading */}
              <div>
                <p className="text-overline font-semibold text-highlight uppercase">
                  A Welcome from the Baba Aladura
                </p>
                <h2
                  id="patriarchal-welcome-title"
                  className="mt-1 font-display text-display-md font-extrabold tracking-tight text-balance sm:text-display-lg"
                >
                  Welcome to ESOCS Worldwide
                </h2>
              </div>

              {/* Illuminated Opening Apostolic Greeting */}
              {greeting && (
                <div className="relative rounded-card border border-border bg-surface-muted/60 p-6 sm:p-7">
                  <Quote aria-hidden className="absolute top-5 right-5 size-8 text-gold-500/25 sm:size-10" />
                  <p className="font-serif text-xl leading-relaxed text-foreground italic sm:text-2xl sm:leading-relaxed">
                    “{greeting}”
                  </p>
                  <p className="mt-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    — Apostolic Greeting & Opening Benediction
                  </p>
                </div>
              )}

              {/* Thematic Movement Cards: Clear, Responsive Synthesis */}
              <div className="grid gap-3 sm:grid-cols-3">
                {THEMATIC_PILLARS.map(({ icon: Icon, title, summary }, i) => (
                  <div key={title} className={styles.thematicPillarCard}>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-control bg-accent-soft text-accent-soft-foreground">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="text-[0.6875rem] font-bold tracking-wider text-muted-foreground uppercase">
                        Part 0{i + 1}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-foreground">{title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{summary}</p>
                  </div>
                ))}
              </div>

              {/* Consecrated Scripture Tablet (1 Corinthians 15:58) */}
              <div className={styles.scriptureTablet}>
                <div className="flex items-start gap-3">
                  <Scroll className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <div>
                    <blockquote className="font-serif text-sm leading-relaxed text-foreground italic sm:text-base sm:leading-relaxed">
                      “Therefore, my beloved brethren, be ye steadfast, unmoveable, always abounding in the
                      work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.”
                    </blockquote>
                    <p className="mt-1.5 text-xs font-bold tracking-wider text-gold-600 uppercase dark:text-gold-400">
                      1 Corinthians 15:58
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patriarchal Action & Reading Controls */}
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              {/* Primary Trigger: Opens Full Liturgical Chamber */}
              <button
                type="button"
                onClick={() => setReaderOpen(true)}
                className="group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:translate-y-0.5"
              >
                <BookOpen className="size-4 transition-transform group-hover:scale-110" aria-hidden />
                <span>Read Full Pastoral Epistle</span>
                <span className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[0.6875rem] font-normal">
                  3 min read
                </span>
              </button>

              {/* Comment / Amen Link */}
              <Link
                href={href}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-control border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <span>Amen & Comments</span>
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>

              {/* Fast Copy Blessing Button */}
              <button
                type="button"
                onClick={copyEpistleBlessing}
                title="Copy opening pastoral blessing"
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-control border border-border bg-surface px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-success" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Blessing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED LITURGICAL EPISTLE READER MODAL                                */}
      {/* Provides a distraction-free, beautifully formatted reading experience   */}
      {/* with zero layout shift or vertical bloat on the home page.               */}
      {/* ========================================================================= */}
      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent className={cn(styles.epistleChamber, "p-0 sm:max-w-2xl")}>
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:px-8">
            <DialogHeader className="p-0">
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
            <div className="flex items-center gap-1.5 pr-8">
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
          <div className="max-h-[68vh] overflow-y-auto px-6 py-8 sm:px-10">
            {/* Epistle Letterhead Banner */}
            <div className="mb-8 border-b border-border pb-6 text-center">
              <p className="text-[0.6875rem] font-bold tracking-widest text-gold-600 uppercase dark:text-gold-400">
                The Eternal Sacred Order of the Cherubim & Seraphim Worldwide
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
                // Emphasize the scriptural citation paragraph if present
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
                className="inline-flex min-h-9 items-center gap-1 rounded-control bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <span>Comment on this Address</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
