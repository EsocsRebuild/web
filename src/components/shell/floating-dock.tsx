"use client";

import { ArrowUp } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import { ChatLauncher } from "@/features/assistant/chat-launcher";
import { cn } from "@/lib/utils";

const loadChat = () => import("@/features/assistant/chat-widget");
const ChatPanel = dynamic(loadChat, { ssr: false });

/** Shown once the reader is well into a page that is worth jumping back up. */
function useFarDown() {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange);
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
      };
    },
    () =>
      window.scrollY > Math.max(480, window.innerHeight * 0.9) &&
      document.documentElement.scrollHeight > window.innerHeight * 2,
    () => false,
  );
}

/**
 * Back to top: a round button whose gold ring fills as the reader goes down the
 * page. The ring is drawn straight from the scroll position (no re-renders); the
 * button glides the page back up and returns keyboard focus to the start of the
 * content, so the next Tab lands where the reader now is.
 */
function ScrollTop({ suppressed }: { suppressed: boolean }) {
  const farDown = useFarDown();
  const ring = React.useRef<SVGCircleElement>(null);
  const shown = farDown && !suppressed;

  React.useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ring.current?.style.setProperty("stroke-dashoffset", String(1 - progress));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <div className="group/top relative flex items-center">
      <span
        aria-hidden
        className="pointer-events-none absolute right-full mr-3 hidden rounded-pill bg-foreground px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-background opacity-0 transition-[opacity,translate] duration-200 group-hover/top:translate-x-0 group-hover/top:opacity-100 lg:block lg:translate-x-1"
      >
        Back to top
      </span>
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        aria-hidden={!shown}
        tabIndex={shown ? 0 : -1}
        data-scroll-top
        className={cn(
          "pointer-events-auto relative inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-[0_10px_30px_-12px_oklch(0.2_0.06_265/0.45)] backdrop-blur-md",
          "transition-[opacity,translate,scale,background-color] duration-300 ease-[var(--ease-out-expo)] hover:bg-surface",
          shown
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-90 opacity-0",
        )}
      >
        <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="2"
          />
          <circle
            ref={ring}
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="var(--color-gold-500)"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        </svg>
        <ArrowUp
          aria-hidden
          className="relative size-5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
        />
      </button>
    </div>
  );
}

/**
 * The corner dock: back to top above the ESOCS Help launcher, one column so they
 * never collide. It sits above the phone's tab bar, clears the safe area, waits
 * for the opening splash, and steps aside while a dialog or menu is open.
 */
export function FloatingDock() {
  const [chatOpen, setChatOpen] = React.useState(false);
  // The panel is fetched on first use and then kept, with its conversation.
  const [chatUsed, setChatUsed] = React.useState(false);
  const launcher = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => {
    setChatOpen(false);
    launcher.current?.focus();
  }, []);

  return (
    <>
      <div
        data-dock
        className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+0.875rem)] z-30 flex flex-col items-end gap-3 lg:right-6 lg:bottom-6"
      >
        <ScrollTop suppressed={chatOpen} />
        <ChatLauncher
          ref={launcher}
          open={chatOpen}
          onWarm={() => void loadChat()}
          onToggle={() => {
            if (chatOpen) return close();
            setChatUsed(true);
            setChatOpen(true);
          }}
        />
      </div>
      {chatUsed && <ChatPanel open={chatOpen} onClose={close} />}
    </>
  );
}
