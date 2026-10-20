"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Cinematic Sanctuary Route & Suspense Loader:
 * - Full-screen immersive midnight cathedral aesthetic
 * - Luminous sacred ESOCS crest with rotating gold halo
 * - Elegant church typography with gold foil script
 * - Ambient celestial glow and breathing light filament
 * - Instant tap-to-dismiss support
 */
export function AppLoader() {
  const [mounted, setMounted] = React.useState(true);
  const [fadingOut, setFadingOut] = React.useState(false);
  const [progress, setProgress] = React.useState(15);

  React.useEffect(() => {
    // Graceful simulated progression while streaming chunks arrive
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const jump = Math.floor(Math.random() * 8) + 3;
        return Math.min(92, prev + jump);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setFadingOut(true);
    setTimeout(() => setMounted(false), 300);
  };

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading The Eternal Sacred Order of the Cherubim and Seraphim Sanctuary"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#040814] transition-opacity duration-500 ease-out ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Cinematic Sanctuary Atmospheric Backdrop */}
      <div
        aria-hidden
        className="absolute inset-[-4%] scale-105 bg-[url('/brand/splash-bg.webp')] bg-cover bg-center opacity-30 brightness-75 saturate-125 transition-transform duration-1000 ease-out"
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
        {/* Sacred Official Crest with Glowing Solar Halo */}
        <div className="relative mb-6 flex size-28 items-center justify-center sm:size-32">
          {/* Pulsing Gold Ambient Aura */}
          <span
            aria-hidden
            className="absolute inset-2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.65)_0%,transparent_70%)] blur-xl"
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

          {/* Sacred Crest Graphic */}
          <div className="relative size-20 overflow-hidden rounded-full bg-slate-950/80 p-1 shadow-[0_0_0_2px_rgba(245,158,11,0.6),0_15px_35px_-8px_rgba(0,0,0,0.9)] sm:size-24">
            <Image
              src="/brand/esocs-crest.png"
              alt="The Official Crest of The Eternal Sacred Order of the Cherubim and Seraphim"
              width={96}
              height={96}
              priority
              className="size-full object-contain"
            />
          </div>
        </div>

        {/* Holy Order Title & Typography */}
        <span className="text-[0.6875rem] font-semibold tracking-[0.28em] text-amber-300/85 uppercase sm:text-xs">
          The Eternal Sacred Order of
        </span>
        <h1 className="mt-1 text-base font-extrabold tracking-[0.06em] text-white uppercase sm:text-xl">
          Cherubim &amp; Seraphim
        </h1>
        <span className="mt-0.5 font-serif text-lg text-amber-300 italic sm:text-2xl">
          Mount Zion Worldwide
        </span>

        {/* Luminous Golden Progress Bar Filament */}
        <div className="mt-6 w-full max-w-xs space-y-2.5">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-300 ease-out"
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

        {/* Subtle Tap to Skip Indicator */}
        <p className="mt-6 text-[0.625rem] tracking-[0.2em] text-white/35 uppercase">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
