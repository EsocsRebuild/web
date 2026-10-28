"use client";

import * as React from "react";
import { useRealtime } from "@/features/social/realtime-provider";

export interface SacredEngagementState {
  amensCount: number;
  hasAmened: boolean;
  intercessionsCount: number;
  hasInterceded: boolean;
  isSaved: boolean;
  proclaimAmen: () => void;
  standInAgreement: () => void;
  toggleSaveJournal: () => void;
  shareIntoFellowship: (platform?: "whatsapp" | "telegram" | "native") => Promise<void>;
}

export function useSacredEngagement(item: {
  id: string;
  title: string;
  caption: string;
  scriptureReference?: string;
  scriptureText?: string;
  amensCount: number;
  intercessionsCount: number;
}): SacredEngagementState {
  const { emitEvent } = useRealtime();

  const [amensCount, setAmensCount] = React.useState(item.amensCount);
  const [hasAmened, setHasAmened] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`esocs:stream:amen:${item.id}`) === "true";
    } catch {
      return false;
    }
  });
  const [intercessionsCount, setIntercessionsCount] = React.useState(item.intercessionsCount);
  const [hasInterceded, setHasInterceded] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`esocs:stream:intercede:${item.id}`) === "true";
    } catch {
      return false;
    }
  });
  const [isSaved, setIsSaved] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedList = JSON.parse(localStorage.getItem("esocs:stream:journal") || "[]") as string[];
      return savedList.includes(item.id);
    } catch {
      return false;
    }
  });

  const triggerHaptic = (pattern: number[] = [15, 25, 15]) => {
    if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback if permission denied
      }
    }
  };

  const proclaimAmen = React.useCallback(() => {
    if (hasAmened) return;
    setHasAmened(true);
    setAmensCount((prev) => prev + 1);
    triggerHaptic([20, 30, 20]);

    try {
      localStorage.setItem(`esocs:stream:amen:${item.id}`, "true");
    } catch {}

    // Broadcast live intercessory event over SignalR to other active viewers
    emitEvent("ProclaimAmen", {
      contentId: item.id,
      timestamp: new Date().toISOString(),
    });
  }, [hasAmened, item.id, emitEvent]);

  const standInAgreement = React.useCallback(() => {
    if (hasInterceded) return;
    setHasInterceded(true);
    setIntercessionsCount((prev) => prev + 1);
    triggerHaptic([30, 40, 30]);

    try {
      localStorage.setItem(`esocs:stream:intercede:${item.id}`, "true");
    } catch {}

    emitEvent("StandInAgreement", {
      contentId: item.id,
      timestamp: new Date().toISOString(),
    });
  }, [hasInterceded, item.id, emitEvent]);

  const toggleSaveJournal = React.useCallback(() => {
    setIsSaved((prev) => {
      const next = !prev;
      triggerHaptic([15]);
      try {
        const savedList = JSON.parse(localStorage.getItem("esocs:stream:journal") || "[]") as string[];
        const updated = next
          ? Array.from(new Set([...savedList, item.id]))
          : savedList.filter((id) => id !== item.id);
        localStorage.setItem("esocs:stream:journal", JSON.stringify(updated));
      } catch {}
      return next;
    });
  }, [item.id]);

  const shareIntoFellowship = React.useCallback(
    async (platform: "whatsapp" | "telegram" | "native" = "native") => {
      const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/stream#${item.id}` : "";
      const text = [
        `🕊️ *The Eternal Sacred Order of the Cherubim & Seraphim*`,
        `📖 *${item.title}*`,
        item.scriptureReference ? `_${item.scriptureReference}: "${item.scriptureText}"_\n` : "",
        item.caption,
        `\nWatch & Meditate on the Sacred Stream:`,
        shareUrl,
      ]
        .filter(Boolean)
        .join("\n");

      triggerHaptic([10]);

      if (platform === "whatsapp") {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        return;
      }

      if (platform === "telegram") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
          "_blank",
        );
        return;
      }

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: item.title,
            text,
            url: shareUrl,
          });
          return;
        } catch {
          // User dismissed or share failed, fallback to clipboard
        }
      }

      // Fallback copy to clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      }
    },
    [item.title, item.scriptureReference, item.scriptureText, item.caption, item.id],
  );

  return {
    amensCount,
    hasAmened,
    intercessionsCount,
    hasInterceded,
    isSaved,
    proclaimAmen,
    standInAgreement,
    toggleSaveJournal,
    shareIntoFellowship,
  };
}
