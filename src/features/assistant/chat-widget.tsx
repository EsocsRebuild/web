"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { RotateCcw, SendHorizontal, X } from "lucide-react";
import * as React from "react";

import { Crest } from "@/components/icons/logo";
import { siteConfig } from "@/config/site";
import type { SearchEntry } from "@/features/search/index-builder";
import { cn } from "@/lib/utils";

import { GREETING, TOPICS, type Topic } from "./brain";
import { PANEL_ID } from "./chat-launcher";

const STORE_KEY = "esocs:help:v2";

const topicLabel = (t: Topic) => TOPICS.find((x) => x.topic === t)?.label ?? t;

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : Promise.reject(new Error(String(r.status)))))
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

function extractText(parts?: Array<{ type: string; text?: string }>): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = React.useRef<HTMLDivElement>(null);
  const log = React.useRef<HTMLOListElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const [inputVal, setInputVal] = React.useState("");
  const [index, setIndex] = React.useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  const transport = React.useMemo(() => new TextStreamChatTransport({ api: "/api/assistant" }), []);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport,
    ...({ api: "/api/assistant" } as Record<string, unknown>),
  });

  const isStreaming = status === "streaming";
  const isSubmitted = status === "submitted";

  // Load the site index the first time the guide opens.
  React.useEffect(() => {
    if (!open || index) return;
    loadIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [open, index]);

  // Focus: the text field on devices with a keyboard; the panel itself on touch
  React.useEffect(() => {
    if (!open) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    (coarse ? panel.current : input.current)?.focus({ preventScroll: true });
  }, [open]);

  // Escape closes the guide
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || document.body.hasAttribute("data-scroll-locked"))
        return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Smooth autoscroll to the latest token / message
  React.useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, status]);

  const handleAsk = (text: string) => {
    const q = text.trim();
    if (!q || isSubmitted || isStreaming) return;
    setInputVal("");
    sendMessage({ text: q });
  };

  const chooseTopic = (t: Topic) => {
    handleAsk(topicLabel(t));
  };

  const restart = () => {
    stop();
    setMessages([]);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      // Storage blocked: nothing was kept to clear.
    }
    input.current?.focus();
  };

  if (!open) return null;
  const hotline = siteConfig.contact.phones.find((p) => /counsel/i.test(p.label));

  return (
    <div
      id={PANEL_ID}
      ref={panel}
      role="dialog"
      aria-label="ESOCS Help"
      tabIndex={-1}
      data-chat-panel
      className={cn(
        "fixed z-50 flex animate-pop-in flex-col overflow-hidden border border-border bg-background shadow-overlay outline-none",
        "inset-x-2 top-[calc(env(safe-area-inset-top)+0.5rem)] bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+0.5rem)] rounded-panel",
        "sm:inset-x-auto sm:top-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+5rem)] sm:h-[min(40rem,calc(100dvh-12rem))] sm:w-[24rem]",
        "lg:right-6 lg:bottom-24 lg:h-[min(40rem,calc(100dvh-8rem))]",
      )}
    >
      <header className="dark flex items-center gap-3 bg-inverse px-4 py-3 text-foreground">
        <Crest size={36} className="shrink-0" />
        <div className="grid min-w-0 flex-1">
          <h2 className="font-display text-base font-bold">ESOCS Assistant</h2>
          <p className="text-xs text-muted-foreground">
            Streaming real-time guide · grounded in church doctrine
          </p>
        </div>
        <button
          type="button"
          onClick={restart}
          aria-label="Start over"
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ESOCS Help"
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>

      <ol
        ref={log}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="grid flex-1 content-start gap-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
      >
        {messages.length === 0 && (
          <li className="flex max-w-[92%] items-end gap-2">
            <Crest size={28} className="mb-0.5 shrink-0" />
            <div className="grid min-w-0 gap-2">
              <p className="rounded-2xl rounded-bl-md bg-surface-muted px-3.5 py-2.5 text-sm leading-6">
                {GREETING.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPICS.map((t) => (
                  <button
                    key={t.topic}
                    type="button"
                    onClick={() => chooseTopic(t.topic)}
                    className="inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-muted"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        )}

        {messages.map((m) => {
          const text = extractText(m.parts as Array<{ type: string; text?: string }>);
          const isUser = m.role === "user";

          return isUser ? (
            <li key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-royal-800 px-3.5 py-2.5 text-sm leading-6 [overflow-wrap:anywhere] text-white">
                <span className="sr-only">You: </span>
                {text}
              </p>
            </li>
          ) : (
            <li key={m.id} className="flex max-w-[92%] items-end gap-2">
              <Crest size={28} className="mb-0.5 shrink-0" />
              <div className="grid min-w-0 gap-2">
                <p className="rounded-2xl rounded-bl-md bg-surface-muted px-3.5 py-2.5 text-sm leading-6 text-foreground">
                  {text}
                </p>
              </div>
            </li>
          );
        })}

        {/* Loading skeleton during TTFT (Time To First Token) */}
        {isSubmitted && (
          <li className="flex max-w-[92%] items-end gap-2" aria-label="Assistant is thinking">
            <Crest size={28} className="mb-0.5 shrink-0 animate-pulse opacity-70" />
            <div className="grid min-w-0 gap-2 rounded-2xl rounded-bl-md bg-surface-muted px-4 py-3">
              <div className="h-3 w-36 animate-pulse rounded-full bg-border" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-border" />
            </div>
          </li>
        )}

        {failed && (
          <li role="alert" className="rounded-card bg-warning-soft px-3.5 py-2.5 text-sm">
            The directory didn’t load. You can still use the quick topic buttons, or try again shortly.
          </li>
        )}

        <div ref={bottomRef} className="h-px" />
      </ol>

      <form
        className="grid gap-2 border-t border-border bg-surface px-3 pt-3 pb-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputVal);
        }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="esocs-help-input" className="sr-only">
            Ask ESOCS Help
          </label>
          <input
            id="esocs-help-input"
            ref={input}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            maxLength={200}
            autoComplete="off"
            enterKeyHint="send"
            placeholder="Ask about a church, services, giving…"
            className="h-11 min-w-0 flex-1 rounded-pill border border-input bg-background px-4 text-base outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isSubmitted}
            aria-label="Send"
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizontal aria-hidden className="size-4" />
          </button>
        </div>
        {hotline && (
          <p className="text-center text-[0.75rem] leading-5 text-muted-foreground">
            For urgent pastoral care, call{" "}
            <a href={`tel:${hotline.number}`} className="font-semibold text-foreground tabular">
              {hotline.display}
            </a>
          </p>
        )}
      </form>
    </div>
  );
}

export default ChatWidget;
