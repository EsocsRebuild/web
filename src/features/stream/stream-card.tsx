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
  Volume2,
  VolumeX,
} from "lucide-react";
import type { SacredStreamItem } from "@/data/schema/stream";
import { cn } from "@/lib/utils";
import { HymnSyncedLyrics } from "./hymn-synced-lyrics";
import { useSacredEngagement } from "./use-sacred-engagement";

interface StreamCardProps {
  item: SacredStreamItem;
  isActive: boolean;
}

export function StreamCard({ item, isActive }: StreamCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showScripture, setShowScripture] = React.useState(false);

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

  const togglePlay = () => {
    if (item.videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else if (item.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
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
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-slate-950 select-none md:h-[92vh] md:rounded-3xl md:border md:border-amber-500/20 md:shadow-2xl">
      {/* 1. Background Video or Atmospheric Still */}
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
        <div className="absolute inset-0 size-full overflow-hidden" onClick={togglePlay}>
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            priority={isActive}
            className="scale-105 object-cover blur-xs brightness-40"
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

      {/* Atmospheric Sacred Gradient Overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"
      />

      {/* 2. Top Bar: Category Pill & Sound Control */}
      <div className="relative z-20 flex items-center justify-between p-4 pt-6 md:pt-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-black/60 px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-wider text-amber-300 uppercase backdrop-blur-md">
            <Flame className="size-3 text-amber-400" />
            {item.category.replace("-", " ")}
          </span>
          {item.unitName && (
            <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[0.6875rem] text-slate-300 backdrop-blur-md sm:flex">
              <Church className="size-3 text-slate-400" />
              {item.unitName}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-amber-400" />}
        </button>
      </div>

      {/* 3. Center Area: Synchronized Hymn Lyrics (if canticle) or Play Indicator */}
      {item.verses && item.verses.length > 0 ? (
        <div className="relative z-20 flex flex-1 items-center justify-center">
          <HymnSyncedLyrics verses={item.verses} currentTime={currentTime} onSeek={handleSeek} />
        </div>
      ) : (
        <div
          onClick={togglePlay}
          className="relative z-10 flex flex-1 cursor-pointer items-center justify-center"
        >
          {!isPlaying && (
            <div className="flex size-16 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-transform hover:scale-110">
              <Play className="size-8 translate-x-0.5 text-amber-400" />
            </div>
          )}
        </div>
      )}

      {/* 4. Right Floating Action Column: Sacred Liturgical Interactions */}
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white sm:right-4">
        {/* Proclaim Amen */}
        <button
          type="button"
          onClick={engagement.proclaimAmen}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div
            className={cn(
              "relative flex size-12 items-center justify-center rounded-full border transition-all duration-300",
              engagement.hasAmened
                ? "border-amber-400 bg-amber-500/30 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.7)]"
                : "border-white/25 bg-black/50 hover:border-amber-400/80 hover:bg-black/70",
            )}
          >
            <Sparkles
              className={cn(
                "size-5 transition-transform duration-300 group-hover:scale-125",
                engagement.hasAmened ? "scale-110 animate-pulse text-amber-300" : "text-white",
              )}
            />
          </div>
          <span className="font-mono text-[0.6875rem] font-bold tracking-tight text-white/90">
            {engagement.amensCount.toLocaleString()}
          </span>
          <span className="text-[0.5625rem] font-semibold tracking-wider text-amber-300/80 uppercase">
            Amen
          </span>
        </button>

        {/* Stand In Prayer / Intercession */}
        <button
          type="button"
          onClick={engagement.standInAgreement}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-full border transition-all duration-300",
              engagement.hasInterceded
                ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.7)]"
                : "border-white/25 bg-black/50 hover:border-emerald-400/80 hover:bg-black/70",
            )}
          >
            <HandHeart
              className={cn(
                "size-5 transition-transform duration-300 group-hover:scale-125",
                engagement.hasInterceded ? "text-emerald-300" : "text-white",
              )}
            />
          </div>
          <span className="font-mono text-[0.6875rem] font-bold tracking-tight text-white/90">
            {engagement.intercessionsCount.toLocaleString()}
          </span>
          <span className="text-[0.5625rem] font-semibold tracking-wider text-emerald-300/80 uppercase">
            Pray With
          </span>
        </button>

        {/* Save to Devotion Notebook */}
        <button
          type="button"
          onClick={engagement.toggleSaveJournal}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-full border transition-all duration-300",
              engagement.isSaved
                ? "border-amber-400 bg-amber-500/30 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.5)]"
                : "border-white/25 bg-black/50 hover:border-amber-400/80 hover:bg-black/70",
            )}
          >
            <Bookmark
              className={cn(
                "size-5 transition-transform duration-300 group-hover:scale-125",
                engagement.isSaved ? "fill-amber-300 text-amber-300" : "text-white",
              )}
            />
          </div>
          <span className="text-[0.5625rem] font-semibold tracking-wider text-white/70 uppercase">
            Journal
          </span>
        </button>

        {/* Send into Fellowship */}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/50 transition-all duration-300 hover:border-amber-400/80 hover:bg-black/70">
            <Share2 className="size-5 text-white transition-transform duration-300 group-hover:scale-125" />
          </div>
          <span className="text-[0.5625rem] font-semibold tracking-wider text-white/70 uppercase">Share</span>
        </button>
      </div>

      {/* 5. Bottom Stage: Sacred Context, Preacher Info, and Scripture */}
      <div className="relative z-20 p-4 pb-6 sm:p-5">
        <div className="max-w-[78%] space-y-2">
          {/* Author & Rank Attribution */}
          <div className="flex items-center gap-2.5">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-amber-400/60 bg-slate-900">
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
                {item.verifiedClergy && <CheckCircle2 className="size-3.5 shrink-0 text-amber-400" />}
              </div>
              <p className="truncate text-[0.625rem] text-slate-300">{item.authorTitle}</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-sm leading-snug font-bold text-white sm:text-base">{item.title}</h2>

          {/* Scripture Reference Pill */}
          {item.scriptureReference && (
            <button
              type="button"
              onClick={() => setShowScripture(!showScripture)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-black/60 px-2.5 py-1 text-left text-xs text-amber-300 backdrop-blur-md transition-colors hover:border-amber-400 hover:bg-black/80"
            >
              <span className="font-semibold">{item.scriptureReference}</span>
              <span className="text-[0.625rem] text-slate-400">· Tap to read</span>
            </button>
          )}

          {/* Expanded Scripture Modal / Drawer */}
          {showScripture && item.scriptureText && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-amber-400/40 bg-slate-950/95 p-3 text-xs leading-relaxed text-slate-200 shadow-xl backdrop-blur-xl">
              <p className="font-serif text-amber-200 italic">&ldquo;{item.scriptureText}&rdquo;</p>
              <p className="mt-1 text-right font-mono text-[0.625rem] text-amber-400">
                — {item.scriptureReference}
              </p>
            </div>
          )}

          {/* Caption */}
          <p className="line-clamp-2 text-xs text-slate-300/90">{item.caption}</p>
        </div>
      </div>

      {/* 6. Send into Fellowship Sharing Modal */}
      {showShareModal && (
        <div className="animate-in fade-in absolute inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="animate-in slide-in-from-bottom-6 w-full rounded-2xl border border-amber-500/40 bg-slate-950 p-5 text-white shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-amber-300">Send into Fellowship</h3>
            <p className="mt-1 text-xs text-slate-400">
              Share this edifying word directly with your church group or prayer partners.
            </p>

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

            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
