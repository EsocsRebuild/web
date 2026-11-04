"use client";

import * as React from "react";
import Image from "next/image";
import {
  Bookmark,
  CheckCircle2,
  Church,
  Flame,
  HandHeart,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import type { SacredStreamItem } from "@/data/schema/stream";
import { cn } from "@/lib/utils";
import { HymnSyncedLyrics } from "./hymn-synced-lyrics";
import { useSacredEngagement } from "./use-sacred-engagement";

interface StreamCardProps {
  item: SacredStreamItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function StreamCard({ item, isActive, isMuted }: StreamCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showScripture, setShowScripture] = React.useState(false);
  const [showPlayPulse, setShowPlayPulse] = React.useState(false);

  const engagement = useSacredEngagement(item);

  // Play/pause media element based on active card in viewport
  React.useEffect(() => {
    if (isActive) {
      if (item.videoUrl && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } else if (item.audioUrl && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isActive, item.videoUrl, item.audioUrl]);

  // Sync mute state
  React.useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const togglePlay = () => {
    setShowPlayPulse(true);
    setTimeout(() => setShowPlayPulse(false), 800);

    if (item.videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    } else if (item.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    } else if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (timeSec: number) => {
    if (videoRef.current) videoRef.current.currentTime = timeSec;
    if (audioRef.current) audioRef.current.currentTime = timeSec;
    setCurrentTime(timeSec);
  };

  return (
    <article className="relative mx-auto flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-slate-950 select-none md:h-[88vh] md:max-h-[820px] md:rounded-3xl md:border md:border-amber-500/25 md:shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* 1. Background Media Layer (Video or Sacred Cover Still) */}
      {item.videoUrl ? (
        <video
          ref={videoRef}
          src={item.videoUrl}
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="absolute inset-0 size-full cursor-pointer object-cover"
        />
      ) : (
        <div className="absolute inset-0 size-full cursor-pointer overflow-hidden" onClick={togglePlay}>
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            priority={isActive}
            className="scale-105 object-cover blur-xs brightness-45"
          />
          {item.audioUrl && (
            <audio
              ref={audioRef}
              src={item.audioUrl}
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>
      )}

      {/* Atmospheric Sacred Gradient Overlay for Maximum Legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-black/95"
      />

      {/* 2. Top Card Header: Subtle Liturgical Attribution */}
      <header className="relative z-20 flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-wider text-amber-300 uppercase backdrop-blur-md">
            <Flame className="size-3 text-amber-400" />
            {item.category.replace("-", " ")}
          </span>

          {item.unitName && (
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[0.6875rem] text-slate-300 backdrop-blur-md sm:flex">
              <Church className="size-3 text-amber-400/70" />
              {item.unitName}
            </span>
          )}
        </div>
      </header>

      {/* 3. Center Sanctuary Stage: Synchronized Hymn Canticles or Play Pulse Indicator */}
      {item.verses && item.verses.length > 0 ? (
        <div className="relative z-20 flex flex-1 items-center justify-center px-4">
          <HymnSyncedLyrics verses={item.verses} currentTime={currentTime} onSeek={handleSeek} />
        </div>
      ) : (
        <div
          onClick={togglePlay}
          className="relative z-10 flex flex-1 cursor-pointer items-center justify-center"
        >
          {(!isPlaying || showPlayPulse) && (
            <div className="flex size-14 items-center justify-center rounded-full border border-amber-400/40 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95">
              <Play className="size-6 translate-x-0.5 text-amber-300" />
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Liturgical Lectern & Unified Action Dock */}
      <footer className="relative z-20 flex flex-col gap-3 p-4 pb-5 sm:p-5">
        {/* Preacher / Minister Credentials */}
        <div className="flex items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-amber-400/60 bg-slate-900 shadow-md">
            <Image
              src={item.authorAvatarUrl || "/brand/esocs-crest.png"}
              alt={item.author}
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold text-white sm:text-sm">{item.author}</span>
              {item.verifiedClergy && (
                <CheckCircle2 className="size-3.5 shrink-0 text-amber-400" title="Verified Clergy" />
              )}
            </div>
            <p className="truncate text-[0.6875rem] text-slate-300/90">{item.authorTitle}</p>
          </div>
        </div>

        {/* Proclamation Title */}
        <h2 className="font-display text-sm leading-snug font-bold text-balance text-white sm:text-base">
          {item.title}
        </h2>

        {/* Scripture Reference Tag (Quiet, reverent) */}
        {item.scriptureReference && (
          <div>
            <button
              type="button"
              onClick={() => setShowScripture(!showScripture)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-black/50 px-2.5 py-1 text-left text-xs text-amber-300 backdrop-blur-md transition-colors hover:border-amber-400 hover:bg-black/70"
            >
              <span className="font-serif font-semibold">{item.scriptureReference}</span>
              <span className="text-[0.625rem] text-slate-400">· Tap to inspect verse</span>
            </button>

            {/* Expanded Scripture Accordion */}
            {showScripture && item.scriptureText && (
              <div className="animate-in fade-in slide-in-from-bottom-2 mt-2 rounded-xl border border-amber-400/40 bg-slate-950/95 p-3.5 text-xs leading-relaxed text-slate-200 shadow-2xl backdrop-blur-xl">
                <p className="font-serif text-amber-200 italic">&ldquo;{item.scriptureText}&rdquo;</p>
                <p className="mt-1.5 text-right font-mono text-[0.625rem] text-amber-400">
                  — {item.scriptureReference}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message Caption */}
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-300/85">{item.caption}</p>

        {/* 5. Unified Liturgical Action Ribbon (Replaces the cluttered TikTok icon tower) */}
        <nav
          aria-label="Liturgical Interactions"
          className="mt-1 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/15 bg-black/60 p-1.5 shadow-2xl backdrop-blur-xl sm:gap-2"
        >
          {/* Amen Action */}
          <button
            type="button"
            onClick={engagement.proclaimAmen}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-all duration-200",
              engagement.hasAmened
                ? "bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
            title="Proclaim Amen in worship agreement"
          >
            <div className="flex items-center gap-1">
              <Sparkles
                className={cn("size-3.5", engagement.hasAmened ? "text-amber-300" : "text-amber-400/80")}
              />
              <span className="font-mono text-[0.6875rem] font-bold">
                {engagement.amensCount.toLocaleString()}
              </span>
            </div>
            <span className="text-[0.5625rem] font-semibold tracking-wider uppercase">
              {engagement.hasAmened ? "Amened" : "Amen"}
            </span>
          </button>

          {/* Stand in Prayer Action */}
          <button
            type="button"
            onClick={engagement.standInAgreement}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-all duration-200",
              engagement.hasInterceded
                ? "bg-emerald-400/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
            title="Stand in prayer fellowship"
          >
            <div className="flex items-center gap-1">
              <HandHeart
                className={cn(
                  "size-3.5",
                  engagement.hasInterceded ? "text-emerald-300" : "text-emerald-400/80",
                )}
              />
              <span className="font-mono text-[0.6875rem] font-bold">
                {engagement.intercessionsCount.toLocaleString()}
              </span>
            </div>
            <span className="text-[0.5625rem] font-semibold tracking-wider uppercase">Pray With</span>
          </button>

          {/* Devotion Journal Action */}
          <button
            type="button"
            onClick={engagement.toggleSaveJournal}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-all duration-200",
              engagement.isSaved
                ? "bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
            title="Save to your Devotion Journal"
          >
            <div className="flex items-center gap-1">
              <Bookmark
                className={cn(
                  "size-3.5",
                  engagement.isSaved ? "fill-amber-300 text-amber-300" : "text-slate-400",
                )}
              />
            </div>
            <span className="text-[0.5625rem] font-semibold tracking-wider uppercase">
              {engagement.isSaved ? "Saved" : "Journal"}
            </span>
          </button>

          {/* Share Blessing Action */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
            title="Share with Church brethren"
          >
            <div className="flex items-center gap-1">
              <Share2 className="size-3.5 text-slate-300" />
            </div>
            <span className="text-[0.5625rem] font-semibold tracking-wider uppercase">Share</span>
          </button>
        </nav>
      </footer>

      {/* 6. Send into Fellowship Sharing Modal */}
      {showShareModal && (
        <div className="animate-in fade-in absolute inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="animate-in slide-in-from-bottom-6 w-full rounded-2xl border border-amber-500/40 bg-slate-950 p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-amber-300">Share into Fellowship</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Share this edifying word directly with your band or prayer partners.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  engagement.shareIntoFellowship("whatsapp");
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/50"
              >
                <MessageCircle className="size-5" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => {
                  engagement.shareIntoFellowship("telegram");
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-900/50"
              >
                <Share2 className="size-5" />
                Telegram
              </button>

              <button
                type="button"
                onClick={() => {
                  engagement.shareIntoFellowship("native");
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
              >
                <Share2 className="size-5 text-amber-400" />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
