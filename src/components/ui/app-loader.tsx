"use client";

import * as React from "react";

/**
 * High-End Cinematic Sanctuary Route & Suspense Loader:
 * - Direct <img> rendering ensures instant zero-delay paint (no Next.js image optimizer waiting)
 * - Crystal clear unblurred crest at balanced size (80px)
 * - Official Holy Order title: "The Eternal Sacred Order Of the Cherubim and Seraphim"
 * - Celestial gold corona with animated halo
 * - Tap anywhere to dismiss instantly
 */
export function AppLoader() {
  const [mounted, setMounted] = React.useState(true);
  const [fadingOut, setFadingOut] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const duration = 10000; // 10 seconds cinematic loader duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadingOut(true);
        setTimeout(() => setMounted(false), 750);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setFadingOut(true);
    setTimeout(() => setMounted(false), 700);
  };

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading The Eternal Sacred Order of the Cherubim and Seraphim Sanctuary"
      onClick={handleDismiss}
      className={`fixed inset-0 z-99999 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#040814] transition-[opacity,transform,filter] duration-700 ease-out ${
        fadingOut ? "pointer-events-none scale-110 opacity-0 blur-md" : "scale-100 opacity-100 blur-none"
      }`}
    >
      {/* Cinematic Sanctuary Atmospheric Backdrop */}
      <div
        aria-hidden
        className="absolute inset-[-4%] scale-105 bg-[url('/brand/splash-bg.webp')] bg-cover bg-center opacity-30 brightness-75 saturate-125"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(6,14,38,0.45)_0%,rgba(4,8,20,0.85)_60%,rgba(3,6,15,0.98)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[85vh] w-[70vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.2),transparent_75%)] blur-2xl"
      />

      {/* Main Sanctuary Content Stage */}
      <div className="relative z-10 flex max-w-lg flex-col items-center px-6 text-center">
        {/* Sacred Official Crest with Balanced, Crisp Proportions (80px - not oversized) */}
        <div className="relative mb-4 flex size-24 items-center justify-center">
          {/* Pulsing Gold Ambient Aura behind the crest */}
          <span
            aria-hidden
            className="absolute inset-2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.7)_0%,transparent_70%)] blur-xl"
          />

          {/* Animated Cardinal Star Ring */}
          <svg
            aria-hidden
            className="absolute inset-0 size-full animate-[spin_20s_linear_infinite]"
            viewBox="0 0 140 140"
          >
            <circle
              cx="70"
              cy="70"
              r="66"
              stroke="rgba(245, 158, 11, 0.35)"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="4 6"
            />
            <circle cx="70" cy="4" r="2.5" fill="#fcd34d" />
            <circle cx="136" cy="70" r="2.5" fill="#fcd34d" />
            <circle cx="70" cy="136" r="2.5" fill="#fcd34d" />
            <circle cx="4" cy="70" r="2.5" fill="#fcd34d" />
          </svg>

          {/* Golden Tracing Corona Ring */}
          <svg
            aria-hidden
            className="absolute inset-1.5 size-[calc(100%-12px)] -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              stroke="url(#loader-gold-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="351.8"
              strokeDashoffset={351.8 - (351.8 * progress) / 100}
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-[stroke-dashoffset] duration-300 ease-out"
            />
            <defs>
              <linearGradient id="loader-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>

          {/* Sharp Master Crest Image Emerging Gracefully Out of Blur into Crisp Focus */}
          <div className="relative size-20 animate-[splash-crest_1.4s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] overflow-hidden rounded-full bg-slate-950 p-0.5 shadow-[0_0_0_2px_rgba(245,158,11,0.75),0_12px_28px_-6px_rgba(0,0,0,0.9)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/esocs-crest.png"
              alt="The Official Crest of The Eternal Sacred Order of the Cherubim and Seraphim"
              width={80}
              height={80}
              loading="eager"
              decoding="async"
              className="size-full object-contain [image-rendering:-webkit-optimize-contrast]"
            />
          </div>
        </div>

        {/* Sacred Holy Order Title - Refined, Non-Bulky, Animated Typography */}
        <div className="max-w-md animate-[splash-word_1.1s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] px-2 text-center">
          <h1 className="text-xs font-semibold tracking-wider text-white uppercase sm:text-sm md:text-base">
            The Eternal Sacred Order of the Cherubim and Seraphim
          </h1>
          <span className="mt-1 block font-serif text-base text-amber-300 italic sm:text-lg md:text-xl">
            Mount Zion Worldwide
          </span>
          <span className="mt-1.5 block text-[0.625rem] font-medium tracking-[0.25em] text-white/50 uppercase sm:text-[0.6875rem]">
            One Fold · One Shepherd · Founded 1925
          </span>
        </div>

        {/* Luminous Golden Progress Bar Filament */}
        <div className="mt-5 w-full max-w-xs animate-[splash-word_1.1s_cubic-bezier(0.16,1,0.3,1)_0.6s_both] space-y-2">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-400 via-amber-200 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[0.6875rem] font-medium tracking-widest text-slate-400 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-1.5 animate-ping rounded-full bg-amber-400" />
              Entering Sanctuary...
            </span>
            <span className="font-mono text-xs text-amber-300">{progress}%</span>
          </div>
        </div>

        {/* Subtle Tap to Continue Indicator */}
        <p className="mt-4 text-[0.625rem] tracking-[0.2em] text-white/35 uppercase">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
