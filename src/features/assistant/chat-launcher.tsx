"use client";

import { MessageCircleMore, X } from "lucide-react";

import { cn } from "@/lib/utils";

export const PANEL_ID = "esocs-help";

/** The round ESOCS Help button. The panel it opens is loaded on first use. */
export function ChatLauncher({
  open,
  onToggle,
  onWarm,
  ref,
}: {
  open: boolean;
  onToggle: () => void;
  /** Hover or focus: fetch the panel ahead of the tap. */
  onWarm?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      onPointerEnter={onWarm}
      onFocus={onWarm}
      aria-expanded={open}
      aria-controls={PANEL_ID}
      aria-label={open ? "Close ESOCS Help" : "Open ESOCS Help, the site guide"}
      data-chat-launcher
      className="group/chat pointer-events-auto relative inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-royal-900 text-white shadow-[0_14px_36px_-12px_oklch(0.2_0.08_265/0.65)] ring-1 ring-white/10 transition-[transform,background-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-royal-800 active:scale-95"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-0 ring-2 ring-gold-400/60 ring-offset-2 ring-offset-transparent transition-opacity duration-300 group-hover/chat:opacity-100"
      />
      <MessageCircleMore
        aria-hidden
        className={cn(
          "absolute size-6 transition-[opacity,scale,rotate] duration-300",
          open ? "scale-50 -rotate-45 opacity-0" : "opacity-100",
        )}
      />
      <X
        aria-hidden
        className={cn(
          "absolute size-6 transition-[opacity,scale,rotate] duration-300",
          open ? "opacity-100" : "scale-50 rotate-45 opacity-0",
        )}
      />
    </button>
  );
}
