"use client";

import { ArrowRight, Crown, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";

import { SmartImage } from "@/components/media/smart-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ImageRef, Organisation, Person } from "@/data/schema/content";

export interface PatriarchalWelcomeProps {
  message: Organisation["message"];
  shepherd?: Person;
  portrait?: ImageRef | null;
  href: string;
}

export function PatriarchalWelcome({ message, shepherd, portrait, href }: PatriarchalWelcomeProps) {
  const [isEpistleOpen, setIsEpistleOpen] = useState(false);

  // In ESOCS, the Baba Aladura is always addressed with "His Most Eminence"
  const shepherdTitleHonorific = shepherd?.honorific?.trim() || "His Most Eminence";
  const shepherdName = shepherd?.name?.includes("Bob-Manuel")
    ? "Baba Aladura Dr. David D. L. Bob-Manuel, OFR, KSC"
    : (shepherd?.name ?? "Baba Aladura Dr. David D. L. Bob-Manuel, OFR, KSC");
  const shepherdSubTitle =
    "Moses Orimolade IX · Prelate of ESOCS (Eternal Sacred Order of the Cherubim and Seraphim) Worldwide";

  return (
    <section
      id="pastoral-welcome"
      aria-labelledby="patriarchal-welcome-heading"
      className="relative isolate overflow-hidden border-y border-neutral-200/90 bg-neutral-50/70 py-20 sm:py-28 lg:py-32 dark:border-white/10 dark:bg-[#08090c]"
    >
      <div className="mx-auto max-w-wide px-gutter">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-14 xl:gap-header">
          {/* Left Column: Dignified Portrait & Plaque */}
          <div className="lg:col-span-5">
            <div className="group relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-neutral-300/80 bg-neutral-900 shadow-xl transition-all duration-500 sm:aspect-3/4 lg:aspect-4/5 dark:border-white/15 dark:bg-neutral-950">
                {portrait ? (
                  <SmartImage
                    image={{ ...portrait, alt: `${shepherdTitleHonorific} ${shepherdName}` }}
                    fill
                    sizes="(min-width: 1024px) 500px, 100vw"
                    className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-102"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white">
                    <Image
                      src="/brand/esocs-crest.png"
                      alt="ESOCS Crest"
                      width={180}
                      height={180}
                      className="opacity-90"
                    />
                  </div>
                )}

                {/* Stately Plaque Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/75 to-transparent p-6 pt-16 text-white sm:p-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-black/60 px-3 py-1 text-[0.6875rem] font-bold tracking-widest text-gold-300 uppercase backdrop-blur-md">
                    <Crown className="size-3 text-gold-400" />
                    <span>Office of the Prelate · Est. 1925</span>
                  </div>

                  <p className="mt-2.5 text-xs font-bold tracking-wider text-gold-300 uppercase">
                    {shepherdTitleHonorific}
                  </p>
                  <h3 className="font-display text-xl font-black tracking-tight text-white sm:text-2xl">
                    {shepherdName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-neutral-300">{shepherdSubTitle}</p>
                </div>
              </div>

              {/* Annual Watchword Ribbon */}
              <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="size-4 shrink-0 text-crimson-800 dark:text-gold-400" />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-500 dark:text-neutral-400">
                      Annual Watchword:{" "}
                    </span>
                    <span className="font-serif font-medium text-neutral-900 italic dark:text-white">
                      “Sustained by God&apos;s Endless Mercies” (Lamentations 3:21)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Commanding, Engaging Editorial (Styled like reference design) */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Header Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-300/80 bg-white/80 px-3.5 py-1 text-xs font-bold tracking-wider text-neutral-700 uppercase shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-gold-300">
              <Crown className="size-3.5 text-crimson-800 dark:text-gold-400" />
              <span>Our Spiritual Father & Prelate</span>
            </div>

            {/* High-Impact Commanding Headline */}
            <h2
              id="patriarchal-welcome-heading"
              className="mt-4 font-display text-[clamp(2.5rem,2.1rem+2.8vw,4.25rem)] leading-[1.04] font-black tracking-tight text-balance uppercase"
            >
              <span className="text-crimson-800 dark:text-gold-400">Our Spiritual</span>{" "}
              <span className="text-neutral-900 dark:text-white">Father</span>
            </h2>

            {/* Engaging, Clear, Inspiring Narrative - Welcoming to Visitors and Faithful Alike */}
            <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
              <p>
                <strong>
                  {shepherdTitleHonorific} {shepherdName}
                </strong>{" "}
                is the Prelate and Supreme Head of the{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Eternal Sacred Order of the Cherubim and Seraphim (ESOCS)
                </span>{" "}
                Worldwide — Moses Orimolade IX. He serves as the spiritual father and shepherd to millions of
                worshippers across Nigeria, the United Kingdom, the United States, Canada, and global diaspora
                parishes.
              </p>
              <p>
                A distinguished scholar, administrator, and statesman honored by the Federal Republic of
                Nigeria with the Officer of the Order of the Federal Republic (OFR) and Knight of Saint
                Christopher (KSC). Under his pastoral guidance, the church has expanded its missionary reach,
                nurturing families grounded in Scripture, fervent prayer, and compassionate community care.
              </p>
              <p>
                His message to every seeker and worshipper is one of enduring peace, salvation, and
                Christ-centered holiness. Whether you are searching for a house of prayer near your home,
                visiting while traveling, or worshiping with us online, our doors and hearts are open to
                welcome you.
              </p>
            </div>

            {/* Primary Action Button (Dignified Deep Red / Gold in Dark Mode) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsEpistleOpen(true)}
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-crimson-800 px-8 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-crimson-900 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none dark:bg-gold-500 dark:text-neutral-950 dark:hover:bg-gold-400"
              >
                <span>Learn More About His Most Eminence</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Pastoral Address Modal Dialog */}
      <Dialog open={isEpistleOpen} onOpenChange={setIsEpistleOpen}>
        <DialogContent className="max-h-[85vh] sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-crimson-800 uppercase dark:text-gold-400">
              <Crown className="size-4" />
              <span>Office of the Prelate · ESOCS Church Worldwide</span>
            </div>
            <DialogTitle className="font-display text-2xl font-bold sm:text-3xl">
              Pastoral Address to the Worldwide Flock
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-base leading-relaxed text-muted-foreground">
            {message.body.map((para, i) => (
              <p key={i} className="text-justify text-sm sm:text-base">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  {shepherdTitleHonorific} {shepherdName}
                </p>
                <p className="text-xs text-muted-foreground">{shepherdSubTitle}</p>
              </div>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-800 hover:underline dark:text-gold-400"
              >
                <span>Open Dedicated Post</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export { PatriarchalWelcome as BabaAladuraMessage };
