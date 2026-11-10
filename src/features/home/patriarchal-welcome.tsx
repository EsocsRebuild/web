"use client";

import { BookOpen, Crown, Quote, Radio, Scroll, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import type { ImageRef, Organisation, Person } from "@/data/schema/content";
import { routes } from "@/lib/routes";

export interface PatriarchalWelcomeProps {
  message: Organisation["message"];
  shepherd?: Person;
  portrait?: ImageRef | null;
  href: string;
}

export function PatriarchalWelcome({ message, shepherd, portrait, href }: PatriarchalWelcomeProps) {
  const [opening = "", ...rest] = message.body;
  const greeting = opening.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "Peace be unto you, beloved of Mount Zion.";
  const remainingOpening = opening.slice(greeting.length).trim();
  const summaryParagraph = remainingOpening || (rest[0] ?? "");

  const shepherdName =
    shepherd?.name ?? "His Most Eminence, Baba Aladura Dr. David D. L. Bob-Manuel, OFR, KSC";
  const shepherdTitle = "Moses Orimolade IX · Prelate of the ESOCS Church Worldwide";

  return (
    <section
      id="patriarchal-address"
      aria-labelledby="patriarchal-welcome-heading"
      className="relative isolate overflow-hidden bg-surface py-20 sm:py-28"
    >
      <div className="mx-auto max-w-wide px-gutter">
        <div className="grid gap-12 lg:grid-cols-[28rem_1fr] lg:items-center lg:gap-16">
          {/* Left Column: Authentic Pastoral Portrait & Seal of Office */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            {/* Ambient gold aura */}
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-tr from-gold-500/15 via-gold-400/5 to-transparent blur-2xl"
            />

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-panel border border-border/80 bg-surface-sunken shadow-2xl">
              {portrait ? (
                <SmartImage
                  image={{ ...portrait, alt: shepherdName }}
                  fill
                  sizes="(min-width: 1024px) 450px, 100vw"
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-royal-950 text-white">
                  <Image
                    src="/brand/esocs-crest.png"
                    alt="ESOCS Crest"
                    width={180}
                    height={180}
                    className="opacity-90"
                  />
                </div>
              )}

              {/* Dignified Plaque Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pt-16 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold-400 uppercase">
                  <Crown className="size-3.5" />
                  <span>The Apostolic Throne</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">{shepherdName}</h3>
                <p className="font-serif text-xs text-white/80 italic">{shepherdTitle}</p>
              </div>
            </div>

            {/* Centenary Watchword Ribbon */}
            <div className="bg-surface-raised mt-4 flex items-center justify-between gap-3 rounded-card border border-border/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <span className="text-xs font-semibold text-foreground">Annual Watchword</span>
              </div>
              <span className="font-serif text-xs font-medium text-accent italic">
                “Sustained by God&apos;s Endless Mercies” (Lam 3:21)
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Pastoral Epistle */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
                <Scroll className="size-3.5" />
                Apostolic Address
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-medium text-muted-foreground">Centenary Pastoral Epistle</span>
            </div>

            <h2
              id="patriarchal-welcome-heading"
              className="mt-4 font-display text-[clamp(2.25rem,1.8rem+2vw,3.5rem)] leading-[1.1] font-extrabold tracking-tight text-foreground"
            >
              Grace and peace to you,{" "}
              <span className="font-serif font-normal text-accent italic">in Mount Zion.</span>
            </h2>

            {/* Liturgical greeting pullquote */}
            <div className="relative mt-6 border-l-2 border-accent pl-5">
              <Quote className="absolute -top-3.5 -left-3 size-6 text-accent/30" />
              <blockquote className="font-serif text-lg leading-relaxed text-foreground italic sm:text-xl">
                “{greeting}”
              </blockquote>
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>{summaryParagraph}</p>
              {rest[0] && rest[0] !== summaryParagraph && <p>{rest[0]}</p>}
            </div>

            {/* Thematic Foundations */}
            <div className="mt-8 grid gap-4 border-t border-border/80 pt-6 sm:grid-cols-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Sovereign Thanksgiving
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Acknowledging the Lord&apos;s hand preserving our families and Order through all seasons.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Christ the Cornerstone
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Entering the second centenary anchored solely on Jesus Christ as our foundation.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Apostolic Charge
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Remaining steadfast, unmovable, and abounding in love, forgiveness, and prayer.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-royal-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-royal-800 hover:shadow-md dark:bg-gold-400 dark:text-royal-950 dark:hover:bg-gold-300"
              >
                <BookOpen className="size-4" />
                Read Full Pastoral Epistle
              </Link>
              <Link
                href={routes.stream()}
                className="bg-surface-raised inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Radio className="size-4 text-accent" />
                Watch Patriarchal Address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
