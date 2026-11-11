"use client";

import { ArrowRight, BookOpen, Compass, HeartHandshake, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import type { ImageRef, Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface WhoWeAreProps {
  org: Organisation;
  photo: { image: ImageRef; caption: string } | null;
}

type PerspectiveTab = "foundation" | "vision" | "pillars";

const VALUE_DESCRIPTIONS: Record<string, string> = {
  F: "Unshakable trust in the efficacy of prayers and God's living Word.",
  L: "The bond of perfectness; unconditional Christ-like love and fellowship.",
  O: "Spiritual discipline, liturgical reverence, and harmony in holy worship.",
  S: "Selfless uplifting of our neighbours, the vulnerable, and all communities.",
  H: "Purity of heart and righteous conduct dedicated to the living God.",
};

export function WhoWeAre({ org, photo }: WhoWeAreProps) {
  const [activeTab, setActiveTab] = React.useState<PerspectiveTab>("foundation");

  return (
    <section
      id="about-order"
      aria-labelledby="who-we-are-heading"
      className="relative isolate overflow-hidden border-t border-border/80 bg-surface-sunken/40 py-24 sm:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Header with Generous Whitespace */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-crimson-700/30 bg-crimson-800/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson-700 uppercase shadow-xs dark:text-crimson-300">
            <Sparkles className="size-3.5" />
            Centenary Heritage · Established {org.founded}
          </span>
          <h2
            id="who-we-are-heading"
            className="mt-5 font-display text-[clamp(2.25rem,1.8rem+2vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-foreground"
          >
            One Order of prayer,{" "}
            <span className="font-serif font-normal text-crimson-700 italic dark:text-crimson-400">
              across five generations.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Founded on the efficacy of prayers and the power of divine healing in the name of our Lord Jesus
            Christ, the Holy Order remains a beacon of apostolic revival and spiritual holiness worldwide.
          </p>
        </div>

        {/* Perspective Selector Pills */}
        <div
          role="tablist"
          aria-label="Perspectives on the Holy Order"
          className="mt-12 flex flex-wrap gap-3 border-b border-border/80 pb-5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "foundation"}
            aria-controls="panel-foundation"
            id="tab-foundation"
            onClick={() => setActiveTab("foundation")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-wide transition-all",
              activeTab === "foundation"
                ? "bg-crimson-800 text-white shadow-md dark:bg-crimson-700"
                : "border border-border bg-surface text-muted-foreground hover:border-crimson-700/50 hover:text-foreground",
            )}
          >
            <Compass className="size-3.5" />
            <span>The Apostolic Foundation</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "vision"}
            aria-controls="panel-vision"
            id="tab-vision"
            onClick={() => setActiveTab("vision")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-wide transition-all",
              activeTab === "vision"
                ? "bg-crimson-800 text-white shadow-md dark:bg-crimson-700"
                : "border border-border bg-surface text-muted-foreground hover:border-crimson-700/50 hover:text-foreground",
            )}
          >
            <Shield className="size-3.5" />
            <span>Vision & Mission</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pillars"}
            aria-controls="panel-pillars"
            id="tab-pillars"
            onClick={() => setActiveTab("pillars")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-wide transition-all",
              activeTab === "pillars"
                ? "bg-crimson-800 text-white shadow-md dark:bg-crimson-700"
                : "border border-border bg-surface text-muted-foreground hover:border-crimson-700/50 hover:text-foreground",
            )}
          >
            <HeartHandshake className="size-3.5" />
            <span>The Five FLOSH Pillars</span>
          </button>
        </div>

        {/* Dual-Panel Layout */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-16">
          {/* Left Narrative Panel */}
          <div className="flex flex-col justify-between">
            {/* 1. The Foundation */}
            {activeTab === "foundation" && (
              <div
                role="tabpanel"
                id="panel-foundation"
                aria-labelledby="tab-foundation"
                className="space-y-6"
              >
                <div className="rounded-panel border border-border/80 bg-surface p-8 shadow-sm sm:p-10">
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    The Sacred Genesis in 1925
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    The Eternal Sacred Order of the Cherubim and Seraphim was founded in Nigeria in 1925 by{" "}
                    <strong className="text-foreground">Saint Moses Orimolade Tunolase</strong>, an itinerant
                    evangelist whose life was marked by fervent prayers, signs, and miracles in the name of
                    Jesus Christ.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    His ministry initiated a Great Awakening across West Africa, calling men and women away
                    from idolatry to the living God. His uncommon anointing of answered prayers earned him the
                    beloved title <strong className="text-foreground">“Baba Aladura”</strong> (Father of
                    Prayer).
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border/80 pt-6">
                    <div>
                      <span className="font-display text-3xl font-extrabold text-crimson-700 dark:text-crimson-400">
                        1925
                      </span>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">Year Founded</p>
                    </div>
                    <div>
                      <span className="font-display text-3xl font-extrabold text-crimson-700 dark:text-crimson-400">
                        100
                      </span>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">Years of Prayer</p>
                    </div>
                    <div>
                      <span className="font-display text-3xl font-extrabold text-crimson-700 dark:text-crimson-400">
                        Global
                      </span>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">Provinces & Parishes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Vision & Mandate */}
            {activeTab === "vision" && (
              <div role="tabpanel" id="panel-vision" aria-labelledby="tab-vision" className="space-y-6">
                <div className="rounded-panel border border-border/80 bg-surface p-8 shadow-sm sm:p-10">
                  <span className="text-xs font-bold tracking-wider text-crimson-700 uppercase dark:text-crimson-400">
                    Apostolic Mandate
                  </span>
                  <blockquote className="mt-3 font-serif text-2xl leading-relaxed text-foreground italic">
                    &ldquo;{org.vision}&rdquo;
                  </blockquote>
                  <p className="mt-3 text-xs font-bold text-crimson-700 dark:text-crimson-400">
                    Mark 16:15 &middot; &ldquo;Go ye into all the world, and preach the gospel to every
                    creature.&rdquo;
                  </p>

                  <div className="mt-8 border-t border-border/80 pt-6">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Our Divine Mission
                    </span>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {org.mission} the whole world to the practice of spiritual Christian devotion in the
                      beauty of holiness.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FLOSH Pillars */}
            {activeTab === "pillars" && (
              <div role="tabpanel" id="panel-pillars" aria-labelledby="tab-pillars" className="space-y-4">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {org.coreValues.map((v) => (
                    <div
                      key={v.letter}
                      className="flex items-start gap-4 rounded-card border border-border/80 bg-surface p-5 transition-colors hover:border-crimson-700/40"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-crimson-800/10 font-display text-lg font-extrabold text-crimson-700 dark:text-crimson-400">
                        {v.letter}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-foreground">{v.value}</h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {VALUE_DESCRIPTIONS[v.letter] ?? "Rooted in scripture and living faith."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <Link
                href={routes.unit("esocs")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-crimson-800 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-crimson-900 dark:bg-crimson-700 dark:hover:bg-crimson-600"
              >
                <span>About the Holy Order</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.history()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-crimson-700 hover:text-crimson-700 dark:hover:border-crimson-400 dark:hover:text-crimson-400"
              >
                <BookOpen className="size-4 text-crimson-700 dark:text-crimson-400" />
                <span>Our Centenary History</span>
              </Link>
            </div>
          </div>

          {/* Right Monument Photo */}
          {photo && (
            <div className="relative overflow-hidden rounded-panel border border-border/80 bg-surface shadow-lg">
              <div className="relative aspect-16/11 w-full overflow-hidden">
                <SmartImage
                  image={photo.image}
                  fill
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 460px, 100vw"
                  className="object-cover object-[center_25%]"
                />
              </div>
              <div className="p-8">
                <span className="text-xs font-bold tracking-wider text-crimson-700 uppercase dark:text-crimson-400">
                  Centenary Monument · 1925–2025
                </span>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {photo.caption}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
