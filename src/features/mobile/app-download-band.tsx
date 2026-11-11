"use client";

import { Bell, BookOpen, Check, Flame, Heart, Music, Play, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

// Official Apple App Store & Google Play SVG Badges
function AppleAppStoreBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:shadow-xl",
        className,
      )}
    >
      <svg className="size-7 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87 0-.08-.01-.15-.02-.23-.97.04-2.13.65-2.81 1.44-.59.68-1.12 1.74-1.05 2.81.01.08.03.16.05.24 1.08.08 2.2-.64 2.82-1.39Z" />
      </svg>
      <div className="text-left">
        <p className="text-[0.625rem] font-medium tracking-wider uppercase opacity-80">Download on the</p>
        <p className="font-display text-base font-bold tracking-tight">App Store</p>
      </div>
    </div>
  );
}

function GooglePlayBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:shadow-xl",
        className,
      )}
    >
      <svg className="size-6.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.018 13.298l-3.919 2.218-3.515-3.492 3.543-3.521 3.891 2.202c1.164.659 1.164 1.934 0 2.593z"
        />
        <path
          fill="#EA4335"
          d="M1.383.693C1.109.99 1 1.455 1 2.054v19.892c0 .599.109 1.064.383 1.361l.071.071 11.144-11.144v-.268L1.454.622l-.071.071z"
        />
        <path
          fill="#FBBC04"
          d="M18.099 15.516l-3.515-3.492L3.44 23.168c.455.483 1.205.541 2.064.054l12.595-7.706z"
        />
        <path
          fill="#34A853"
          d="M18.099 8.484L5.504.778C4.645.291 3.895.349 3.44.832l11.144 11.144 3.515-3.492z"
        />
      </svg>
      <div className="text-left">
        <p className="text-[0.625rem] font-medium tracking-wider uppercase opacity-80">GET IT ON</p>
        <p className="font-display text-base font-bold tracking-tight">Google Play</p>
      </div>
    </div>
  );
}

const APP_FEATURES = [
  "Daily Dawn Manna & Evening Vespers Devotionals",
  "Complete Sacred Seraphic Hymnary (English & Yoruba)",
  "HD Sacred Stream Live Broadcasts & Audio Sermons",
  "Church Calendar, Events & Fasting Periods",
  "Confidential Prayer Request Altar with Ministerial Follow-up",
  "Instant Push Bulletins from His Most Eminence, the Prelate",
];

export function AppDownloadBand() {
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="app-download"
      aria-labelledby="app-download-heading"
      className="relative isolate overflow-hidden bg-[#0A0E1A] py-24 text-white sm:py-32 lg:py-40"
    >
      {/* Dynamic Church Brand Glows: Royal Navy + Cardinal Crimson + Divine Amber */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60">
        <div className="absolute -top-32 left-1/4 size-160 rounded-full bg-[radial-gradient(circle,rgba(120,19,36,0.35)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute right-1/4 -bottom-40 size-180 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 -right-20 size-120 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.3)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="mx-auto max-w-wide px-gutter"
      >
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Commanding Editorial Information */}
          <div className="max-w-2xl lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-gold-300 uppercase shadow-xs">
              <Sparkles className="size-3.5 text-gold-400" />
              Faith in the Palm of Your Hand
            </span>

            <h2
              id="app-download-heading"
              className="mt-6 font-display text-[clamp(2.5rem,2rem+2.5vw,4.5rem)] leading-[1.04] font-extrabold tracking-tight text-balance text-white"
            >
              DOWNLOAD THE{" "}
              <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200 bg-clip-text text-transparent">
                ESOCS APP.
              </span>
            </h2>

            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg sm:leading-8">
              Stay connected with the Holy Order wherever you walk. Listen to live Sunday Divine Services,
              sing from the authorized Seraphic Hymnary, read Dawn Manna devotionals, and submit private
              prayer petitions — all in one dignified, sacred mobile sanctuary.
            </p>

            {/* Feature Checklist */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {APP_FEATURES.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-200 sm:text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5B101E] text-gold-400 shadow-xs">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Download Badges & Ratings */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <AppleAppStoreBadge />
              <GooglePlayBadge />
            </div>

            <div className="mt-8 flex items-center gap-6 border-t border-white/10 pt-6">
              <div>
                <div className="flex items-center gap-1 text-gold-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-base">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-300">4.9 / 5.0 Rating</p>
              </div>

              <div className="h-8 w-px bg-white/15" />

              <div>
                <p className="font-display text-lg font-bold text-white">100,000+</p>
                <p className="text-xs text-slate-400">Brethren Installed</p>
              </div>

              <div className="h-8 w-px bg-white/15" />

              <div>
                <p className="font-display text-lg font-bold text-white">Free</p>
                <p className="text-xs text-slate-400">iOS & Android</p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Precision 3D Parallax Device Mockup */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 14}deg) rotateX(${-mousePos.y * 14}deg) translateZ(10px)`,
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="relative w-full max-w-[340px] sm:max-w-[380px]"
            >
              {/* Outer Phone Shell with Titanium Bezel & Glass Reflection */}
              <div className="relative overflow-hidden rounded-[52px] border-[10px] border-[#1E2538] bg-[#070A12] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_80px_rgba(120,19,36,0.25)] ring-1 ring-white/15">
                {/* Dynamic Island Pill */}
                <div className="absolute top-5 left-1/2 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black">
                  <div className="absolute top-2 right-3.5 size-2 rounded-full bg-blue-900/40" />
                </div>

                {/* Inner Phone Screen */}
                <div className="relative flex flex-col justify-between overflow-hidden rounded-[38px] bg-gradient-to-b from-[#0F172A] via-[#090D1A] to-[#04060E] p-5 pt-10 text-white shadow-inner">
                  {/* Top Bar with Time and Battery */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>11:52</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.625rem]">5G</span>
                      <div className="h-2.5 w-5 rounded-xs border border-white/60 p-0.5">
                        <div className="rounded-2xs h-full w-full bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* App Navigation Header */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/brand/esocs-crest.png"
                        alt="ESOCS Crest"
                        width={32}
                        height={32}
                        className="rounded-full ring-1 ring-gold-400"
                      />
                      <div>
                        <p className="text-[0.6875rem] font-bold tracking-wider text-gold-400 uppercase">
                          The Holy Order
                        </p>
                        <h4 className="font-display text-sm font-extrabold text-white">The ESOCS Church</h4>
                      </div>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-300">
                      <Bell className="size-4" />
                    </span>
                  </div>

                  {/* Live Stream / Divine Service Notification Card */}
                  <div className="mt-5 rounded-2xl border border-crimson-700/40 bg-gradient-to-r from-[#5B101E]/80 to-[#1E2538]/80 p-3.5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex animate-pulse items-center gap-1.5 rounded-full bg-crimson-600 px-2.5 py-0.5 text-[0.625rem] font-bold text-white uppercase">
                        <Radio className="size-2.5" /> Live Now
                      </span>
                      <span className="text-[0.625rem] text-slate-300">Centenary Miracle Cathedral</span>
                    </div>
                    <h5 className="mt-2 text-xs font-bold text-white">
                      Sunday Divine Worship & Apostolic Word
                    </h5>
                    <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-slate-300">
                      Ministering: Baba Aladura & Prelate
                    </p>
                  </div>

                  {/* Daily Devotional Card */}
                  <div className="mt-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[0.625rem] font-bold text-gold-400 uppercase">
                        <Flame className="size-3 text-gold-400" /> Dawn Manna
                      </span>
                      <span className="text-[0.625rem] text-slate-400">11 Nov 2026</span>
                    </div>
                    <h5 className="mt-1.5 font-display text-xs font-bold text-white">
                      The Good Shepherd’s Unending Grace
                    </h5>
                    <p className="mt-1 text-[0.6875rem] leading-relaxed text-slate-300 italic">
                      “The Lord is my shepherd; I shall not want.” — Psalm 23:1
                    </p>
                  </div>

                  {/* Seraphic Hymn Player Card */}
                  <div className="mt-3.5 rounded-2xl border border-white/10 bg-[#131A2E] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-gold-500/20 text-gold-400">
                          <Music className="size-3.5" />
                        </span>
                        <div>
                          <p className="text-[0.625rem] font-bold text-white">Hymn 241 (Ogo Ni Fun Baba)</p>
                          <p className="text-[0.5625rem] text-slate-400">Sacred Seraphic Choral Anthems</p>
                        </div>
                      </div>
                      <span className="flex size-7 items-center justify-center rounded-full bg-[#5B101E] text-white shadow-xs">
                        <Play className="size-3.5 fill-current" />
                      </span>
                    </div>
                    {/* Audio Wave Visualizer Simulation */}
                    <div className="mt-2.5 flex items-center justify-between gap-1 px-1">
                      {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 35, 75, 85, 40].map((h, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${h * 0.2}px` }}
                          className="w-1 rounded-full bg-gold-400/80"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Navigation Dock Simulation */}
                  <div className="mt-4 flex items-center justify-around rounded-xl border border-white/10 bg-white/5 py-2">
                    <div className="flex flex-col items-center gap-0.5 text-gold-400">
                      <Sparkles className="size-3.5" />
                      <span className="text-[0.5625rem] font-bold">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-400">
                      <BookOpen className="size-3.5" />
                      <span className="text-[0.5625rem]">Hymnary</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-400">
                      <Radio className="size-3.5" />
                      <span className="text-[0.5625rem]">Stream</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-400">
                      <Heart className="size-3.5" />
                      <span className="text-[0.5625rem]">Giving</span>
                    </div>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
