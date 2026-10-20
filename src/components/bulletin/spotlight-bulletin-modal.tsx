"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

export interface SpotlightItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  isUrgent?: boolean;
}

const STORAGE_KEY = "esocs_spotlight_dismissed_v1";

export function SpotlightBulletinModal({ spotlight }: { spotlight?: SpotlightItem | null }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dontShowToday, setDontShowToday] = React.useState(false);

  React.useEffect(() => {
    if (!spotlight) return;

    try {
      const dismissedRaw = localStorage.getItem(STORAGE_KEY);
      if (dismissedRaw) {
        const { id, timestamp } = JSON.parse(dismissedRaw);
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (id === spotlight.id && Date.now() - timestamp < oneDayMs) {
          return; // Suppressed within 24h
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Gentle 1.5s delay after page load for non-jarring appearance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [spotlight]);

  const handleDismiss = () => {
    if (dontShowToday && spotlight) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: spotlight.id, timestamp: Date.now() }));
      } catch {
        // Ignore storage errors
      }
    }
    setIsOpen(false);
  };

  if (!isOpen || !spotlight) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spotlight-title"
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
    >
      {/* Solid High-Contrast Backdrop - Crisp & Opaque, No Glassmorphism Blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Solid Architectural Card - Sharp 1px Border, No Heavy Box-Shadows */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-amber-400" />
            <span className="text-2xs font-bold tracking-widest text-amber-400 uppercase">
              {spotlight.category || "Official Church Bulletin"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Announcement"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Media Banner if provided */}
        {spotlight.imageUrl && (
          <div className="relative aspect-video w-full border-b border-slate-800 bg-slate-950">
            <Image
              src={spotlight.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          <h2 id="spotlight-title" className="text-lg font-bold text-white sm:text-xl">
            {spotlight.title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{spotlight.summary}</p>

          {/* Action CTAs - Zero Dead Ends */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="size-3.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span>Don&apos;t show this again today</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                Close
              </button>

              <Link
                href={spotlight.ctaLink || "#"}
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <span>{spotlight.ctaText || "Learn More"}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
