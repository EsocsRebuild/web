"use client";

import { ArrowRight, Phone, RotateCcw, SendHorizontal, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Crest } from "@/components/icons/logo";
import { siteConfig } from "@/config/site";
import type { SearchEntry } from "@/features/search/index-builder";
import { cn } from "@/lib/utils";

import { GREETING, TOPICS, respond, topicReply, type GuideReply, type Topic } from "./brain";
import { PANEL_ID } from "./chat-launcher";

interface Message {
  id: number;
  from: "you" | "guide";
  text: string;
  reply?: GuideReply;
}

const STORE_KEY = "esocs:help:v1";

const context = { phones: siteConfig.contact.phones, headquarters: siteConfig.contact.headquarters };
const topicLabel = (t: Topic) => TOPICS.find((x) => x.topic === t)?.label ?? t;

/** The site index, fetched once per visit, the first time someone opens the guide. */
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

function readSaved(): Message[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "null") as Message[] | null;
    return Array.isArray(saved) && saved.length ? saved : [];
  } catch {
    return [];
  }
}

function GuideMessage({
  message,
  onTopic,
  onNavigate,
  latest,
}: {
  message: Message;
  onTopic: (t: Topic) => void;
  onNavigate: () => void;
  latest: boolean;
}) {
  const reply = message.reply;
  return (
    <li className="flex max-w-[92%] items-end gap-2">
      <Crest size={28} className="mb-0.5 shrink-0" />
      <div className="grid min-w-0 gap-2">
        <p className="rounded-2xl rounded-bl-md bg-surface-muted px-3.5 py-2.5 text-sm leading-6">
          {message.text}
        </p>
        {reply && reply.links.length > 0 && (
          <ul className="grid overflow-hidden rounded-card border border-border bg-surface">
            {reply.links.map((l) => {
              const Icon = l.kind === "phone" ? Phone : ArrowRight;
              const body = (
                <>
                  <span className="grid min-w-0 flex-1">
                    <span className="text-sm font-semibold text-pretty [overflow-wrap:anywhere]">
                      {l.label}
                    </span>
                    {l.hint && <span className="text-xs text-pretty text-muted-foreground">{l.hint}</span>}
                  </span>
                  <Icon aria-hidden className="size-4 shrink-0 text-accent" />
                </>
              );
              const row =
                "flex min-h-12 items-center gap-3 px-3.5 py-2 transition-colors hover:bg-surface-muted";
              return (
                <li key={l.href + l.label} className="border-border [&+&]:border-t">
                  {l.kind === "phone" ? (
                    <a href={l.href} className={row}>
                      {body}
                    </a>
                  ) : (
                    <Link href={l.href} className={row} onClick={onNavigate}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {latest && reply && reply.suggestions.length > 0 && (
          <ul aria-label="Suggestions" className="flex flex-wrap gap-1.5">
            {reply.suggestions.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onTopic(t)}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-pill border border-border-strong bg-background px-3 text-[0.8125rem] font-semibold transition-colors hover:border-foreground"
                >
                  {topicLabel(t)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/**
 * ESOCS Help, the site guide. It answers from the site's own index and hands over
 * to people (the church's phone lines, the prayer form) for anything else. On
 * phones it is a full-height sheet above the tab bar; on wider screens a card
 * above the launcher. The conversation is kept for the visit.
 */
export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = React.useState<Message[]>(() =>
    typeof window === "undefined" ? [] : readSaved(),
  );
  const [index, setIndex] = React.useState<SearchEntry[] | null>(null);
  const [typing, setTyping] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const panel = React.useRef<HTMLDivElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const log = React.useRef<HTMLOListElement>(null);
  const nextId = React.useRef((messages.at(-1)?.id ?? 0) + 1);
  // An empty conversation opens with the greeting.
  const shown: Message[] = messages.length
    ? messages
    : [{ id: 0, from: "guide", text: GREETING.text, reply: GREETING }];

  React.useEffect(() => {
    try {
      if (!messages.length) return;
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // Storage blocked: the conversation still lasts while the page is open.
    }
  }, [messages]);

  // Load the site index the first time the guide opens.
  React.useEffect(() => {
    if (!open || index) return;
    loadIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [open, index]);

  // Focus: the text field on devices with a keyboard; the panel itself on touch
  // screens, so the on-screen keyboard does not jump up uninvited.
  React.useEffect(() => {
    if (!open) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    (coarse ? panel.current : input.current)?.focus({ preventScroll: true });
  }, [open]);

  // Escape closes the guide wherever focus is (a tapped suggestion disappears once
  // answered), unless a dialog of the page itself is open on top.
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

  // Keep the newest message in view.
  React.useEffect(() => {
    const el = log.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, typing]);

  /** Keep keyboard focus in the conversation: the field with a keyboard, the panel on touch. */
  const refocus = () => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    (coarse ? panel.current : input.current)?.focus({ preventScroll: true });
  };

  const answer = (question: string, reply: () => GuideReply) => {
    refocus();
    setMessages((m) => [...m, { id: nextId.current++, from: "you", text: question }]);
    setTyping(true);
    // A brief pause so the answer reads as a reply rather than a flicker.
    window.setTimeout(() => {
      const r = reply();
      setMessages((m) => [...m, { id: nextId.current++, from: "guide", text: r.text, reply: r }]);
      setTyping(false);
    }, 420);
  };

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setDraft("");
    answer(q, () => respond(q, index, context));
  };

  const chooseTopic = (t: Topic) =>
    answer(topicLabel(t), () =>
      index ? topicReply(t, index, context) : respond(topicLabel(t), null, context),
    );

  const restart = () => {
    nextId.current = 1;
    setMessages([]);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      // Storage blocked: nothing was kept to clear.
    }
    input.current?.focus();
  };

  // On phones the guide covers the page, so following a link closes it.
  const onNavigate = () => {
    if (window.matchMedia("(max-width: 639px)").matches) onClose();
  };

  if (!open) return null;
  const lastGuide = shown.findLast((m) => m.from === "guide")?.id;
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
        // Phones: a sheet above the tab bar. Wider: a card above the launcher.
        "inset-x-2 top-[calc(env(safe-area-inset-top)+0.5rem)] bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+0.5rem)] rounded-panel",
        "sm:inset-x-auto sm:top-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+5rem)] sm:h-[min(40rem,calc(100dvh-12rem))] sm:w-[24rem]",
        "lg:right-6 lg:bottom-24 lg:h-[min(40rem,calc(100dvh-8rem))]",
      )}
    >
      <header className="dark flex items-center gap-3 bg-inverse px-4 py-3 text-foreground">
        <Crest size={36} className="shrink-0" />
        <div className="grid min-w-0 flex-1">
          <h2 className="font-display text-base font-bold">ESOCS Help</h2>
          <p className="text-xs text-muted-foreground">Automated guide · answers from this website</p>
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
        {shown.map((m) =>
          m.from === "you" ? (
            <li key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-royal-800 px-3.5 py-2.5 text-sm leading-6 [overflow-wrap:anywhere] text-white">
                <span className="sr-only">You: </span>
                {m.text}
              </p>
            </li>
          ) : (
            <GuideMessage
              key={m.id}
              message={m}
              latest={m.id === lastGuide && !typing}
              onTopic={chooseTopic}
              onNavigate={onNavigate}
            />
          ),
        )}
        {typing && (
          <li className="flex items-center gap-2" aria-label="ESOCS Help is replying">
            <Crest size={28} className="shrink-0" />
            <span className="inline-flex gap-1 rounded-2xl bg-surface-muted px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </span>
          </li>
        )}
        {failed && (
          <li role="alert" className="rounded-card bg-warning-soft px-3.5 py-2.5 text-sm">
            The directory didn’t load. You can still use the links below, or try again shortly.
          </li>
        )}
      </ol>

      <form
        className="grid gap-2 border-t border-border bg-surface px-3 pt-3 pb-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="esocs-help-input" className="sr-only">
            Ask ESOCS Help
          </label>
          <input
            id="esocs-help-input"
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={200}
            autoComplete="off"
            enterKeyHint="send"
            placeholder="Ask about a town, a service, giving…"
            className="h-11 min-w-0 flex-1 rounded-pill border border-input bg-background px-4 text-base outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!draft.trim() || typing}
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
