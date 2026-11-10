"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Check,
  HeartHandshake,
  Home,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface ErrorViewProps {
  error: Error & { digest?: string };
  reset?: () => void;
  /** Whether this is being rendered inside global-error.tsx (full screen viewport). */
  isGlobal?: boolean;
  className?: string;
}

/**
 * High-End, User-Focused Sanctuary Error Experience:
 *
 * Replaces technical IT/server jargon with warm, dignified reassurance,
 * comforting scripture, intuitive recovery paths (Sanctuary Home, Refresh),
 * and helpful spiritual resources.
 */
export function ErrorView({ error, reset, isGlobal = false, className }: ErrorViewProps) {
  const [isRetrying, setIsRetrying] = React.useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleReset = React.useCallback(() => {
    setIsRetrying(true);
    if (reset) {
      reset();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
    const timer = setTimeout(() => setIsRetrying(false), 2000);
    return () => clearTimeout(timer);
  }, [reset]);

  const copyDiagnosticReport = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const report = [
      `=== ESOCS Church App Diagnostic Report ===`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error Name: ${error?.name || "UnknownError"}`,
      `Error Message: ${error?.message || "No error message provided"}`,
      `Digest: ${error?.digest || "N/A"}`,
      `User Agent: ${navigator.userAgent}`,
      `URL: ${window.location.href}`,
      `==========================================`,
    ].join("\n");

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [error]);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center p-gutter transition-all duration-300",
        isGlobal ? "min-h-screen bg-[#040814] py-16 text-white" : "min-h-[75vh] py-16",
        className,
      )}
    >
      {/* Divine Atmospheric Radiant Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 dark:opacity-25"
      >
        <div className="absolute top-1/4 left-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 size-[360px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Serene Eyebrow Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-amber-300 uppercase shadow-md backdrop-blur-md">
          <Sparkles className="size-3.5 text-amber-400" />
          <span>Peace Be With You · Mount Zion Sanctuary</span>
        </div>

        {/* Sacred Official Crest with Concentric Radiant Aura */}
        <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.5)_0%,transparent_70%)] blur-xl"
          />
          <div className="relative size-18 overflow-hidden rounded-full border border-amber-400/60 bg-slate-950 p-1 shadow-2xl">
            <Image
              src="/brand/esocs-crest.png"
              alt="The Official Crest of The Eternal Sacred Order of the Cherubim and Seraphim"
              fill
              className="object-contain p-1"
            />
          </div>
        </div>

        {/* Reassuring, Dignified Headline */}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
          Let Us Pause for a Moment
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
          We are gently preparing this pathway in the Sanctuary. Take a peaceful breath, and let us guide you
          back into worship and fellowship.
        </p>

        {/* Calming Scripture Comfort Anchor */}
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-400/25 bg-linear-to-b from-amber-950/20 to-slate-950/60 p-4 shadow-inner">
          <p className="font-serif text-sm leading-relaxed text-amber-100 italic sm:text-base">
            &ldquo;Peace I leave with you, my peace I give unto you... Let not your heart be troubled, neither
            let it be afraid.&rdquo;
          </p>
          <p className="mt-2 text-right font-mono text-[0.6875rem] font-bold text-amber-400">— John 14:27</p>
        </div>

        {/* Intuitive, User-Focused Recovery Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            asChild
            size="lg"
            variant="gold"
            shape="pill"
            leftIcon={<Home className="size-4" />}
            className="shadow-[0_4px_20px_rgba(251,191,36,0.35)] transition-all hover:scale-[1.02]"
          >
            <Link href={routes.home()}>Return to Sanctuary Home</Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            shape="pill"
            loading={isRetrying}
            leftIcon={<RotateCcw className={cn("size-4", isRetrying && "animate-spin")} />}
            onClick={handleReset}
            className="border-white/20 bg-slate-900/80 text-white shadow-md hover:border-amber-400 hover:bg-slate-800"
          >
            Refresh Sanctuary
          </Button>
        </div>

        {/* Helpful Spiritual Pathway Cards */}
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {/* Card 1: Daily Devotionals */}
          <Link
            href={routes.devotional()}
            className="group rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-2 text-amber-400">
              <BookOpen className="size-4.5" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white group-hover:text-amber-200">
                Daily Devotionals
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Nourish your walk with today&apos;s morning scripture reading, apostolic reflection, and
              canticles.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 font-sans text-xs font-semibold text-amber-300 group-hover:underline">
              Read today&apos;s manna →
            </span>
          </Link>

          {/* Card 2: Find Local House of Prayer */}
          <Link
            href={routes.find()}
            className="group rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-2 text-amber-400">
              <Compass className="size-4.5" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white group-hover:text-amber-200">
                Find a House of Prayer
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Locate your nearest provincial cathedral, district, or local house of prayer worldwide.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 font-sans text-xs font-semibold text-amber-300 group-hover:underline">
              Explore church directory →
            </span>
          </Link>
        </div>

        {/* Pastoral Support Link */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <HeartHandshake className="size-3.5 text-amber-400" />
          <span>Need prayer or pastoral counseling? </span>
          <Link href={routes.prayer()} className="font-semibold text-amber-300 hover:underline">
            Submit a prayer petition
          </Link>
        </div>

        {/* Discreet Developer Diagnostic Section (Out of user's face) */}
        <div className="mt-10 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="mx-auto flex items-center gap-1.5 text-[0.6875rem] font-medium text-slate-500 transition-colors select-none hover:text-slate-300"
          >
            <span>Assistance details</span>
            {showDiagnostics ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          {showDiagnostics && (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/90 p-4 text-left font-mono text-[0.6875rem] text-slate-400 shadow-inner">
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-slate-200">Reference Log</span>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={
                    copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />
                  }
                  onClick={copyDiagnosticReport}
                  className="h-6 text-[0.625rem] text-slate-300 hover:text-white"
                >
                  {copied ? "Copied" : "Copy reference"}
                </Button>
              </div>

              <div className="grid gap-1 overflow-x-auto text-[0.625rem] leading-relaxed">
                <p>
                  <strong className="text-slate-300">Ref Code:</strong>{" "}
                  <code className="rounded bg-slate-900 px-1 text-amber-400">
                    {error?.digest || "SANCTUARY-OK"}
                  </code>
                </p>
                <p>
                  <strong className="text-slate-300">Time:</strong> {new Date().toUTCString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
