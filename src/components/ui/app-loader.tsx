"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function AppLoader() {
  const [mounted, setMounted] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [fadingOut, setFadingOut] = React.useState(false);

  React.useEffect(() => {
    const startTime = Date.now();
    const duration = 2200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadingOut(true);
        setTimeout(() => setMounted(false), 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading The Eternal Sacred Order of the Cherubim and Seraphim"
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-300 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Crisp Solid Architectural Framing - No Glassmorphism or Heavy Shadows */}
      <div className="relative mx-4 flex max-w-md flex-col items-center rounded-xl border border-slate-800 bg-slate-900 p-8 text-center sm:p-10">
        {/* Sacred Official Crest */}
        <div className="relative mb-5 flex size-20 items-center justify-center rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 sm:size-24">
          <Image
            src="/brand/esocs-crest-192.webp"
            alt="ESOCS Crest"
            width={80}
            height={80}
            priority
            className="size-full object-contain"
          />
        </div>

        {/* Full Complete Holy Order Title */}
        <h1 className="text-xs font-bold tracking-wider text-amber-400 uppercase sm:text-sm">
          The Eternal Sacred Order of the Cherubim and Seraphim
        </h1>
        <p className="mt-1 text-[0.6875rem] font-medium tracking-widest text-slate-400 uppercase">
          Worldwide Portal
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-full max-w-xs space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[0.6875rem] font-semibold tracking-wider text-slate-400 uppercase">
            <span>Loading Sanctuary</span>
            <span className="font-mono text-amber-400">{progress}%</span>
          </div>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={() => setMounted(false)}
          className="mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
        >
          <span>Continue</span>
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
