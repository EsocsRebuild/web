"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CalendarDays, Clock, FileText, Landmark, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { moreNav, primaryNav } from "@/config/navigation";
import type { SearchEntry, SearchKind } from "@/features/search/index-builder";
import { routes } from "@/lib/routes";

const PaletteContext = React.createContext<{ open: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>");
  return ctx;
}

const GROUPS: { kind: SearchKind; heading: string; icon: typeof Landmark }[] = [
  { kind: "page", heading: "Churches and pages", icon: Landmark },
  { kind: "person", heading: "People", icon: UserRound },
  { kind: "post", heading: "News and stories", icon: FileText },
  { kind: "event", heading: "Events", icon: CalendarDays },
];

const RECENT_KEY = "esocs:recent-searches";

function readRecent(): SearchEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as SearchEntry[];
  } catch {
    return [];
  }
}

function remember(entry: SearchEntry) {
  try {
    const next = [entry, ...readRecent().filter((r) => r.href !== entry.href)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: recent searches are a convenience only.
  }
}

/** Search everything from anywhere: `/` or ⌘K / Ctrl K, or the search field. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState<SearchEntry[]>([]);

  const openPalette = React.useCallback((next: boolean) => {
    if (next) setRecent(readRecent());
    setOpen(next);
  }, []);
  const open = React.useCallback(() => openPalette(true), [openPalette]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        openPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  React.useEffect(() => {
    if (!isOpen || index) return;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: SearchEntry[]) => setIndex(data))
      .catch(() => setFailed(true));
  }, [isOpen, index]);

  const go = (entry: SearchEntry) => {
    remember(entry);
    setOpen(false);
    setQuery("");
    router.push(entry.href);
  };

  const suggestions: SearchEntry[] = [
    ...primaryNav.slice(1),
    ...moreNav.flatMap((g) => g.items).slice(0, 6),
  ].map((n) => ({
    kind: "page",
    title: n.label,
    subtitle: n.description ?? "",
    href: n.href,
    keywords: "",
  }));

  const q = query.trim();

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      <DialogPrimitive.Root open={isOpen} onOpenChange={openPalette}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-3 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto max-w-2xl overflow-hidden rounded-panel border border-border bg-surface shadow-overlay outline-none data-[state=open]:animate-pop-in sm:top-[12vh]"
          >
            <DialogPrimitive.Title className="sr-only">Search ESOCS</DialogPrimitive.Title>
            <Command loop label="Search ESOCS">
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Search churches, people, news and events…"
              />
              <CommandList>
                {!q && (
                  <>
                    {recent.length > 0 && (
                      <CommandGroup heading="Recent">
                        {recent.map((r) => (
                          <CommandItem
                            key={`recent-${r.href}`}
                            value={`recent ${r.title}`}
                            onSelect={() => go(r)}
                          >
                            <Clock aria-hidden className="size-4 text-muted-foreground" />
                            <Result entry={r} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    <CommandGroup heading="Go to">
                      {suggestions.map((s) => (
                        <CommandItem key={`go-${s.href}`} value={`go ${s.title}`} onSelect={() => go(s)}>
                          <Result entry={s} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {q && !index && !failed && (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                    <Spinner /> Loading search…
                  </div>
                )}
                {q && failed && (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Search isn&apos;t available right now. Check your connection and try again.
                  </p>
                )}
                {q && index && (
                  <>
                    <CommandEmpty>No results for “{q}”. Try a town, province or name.</CommandEmpty>
                    {GROUPS.map(({ kind, heading, icon: Icon }) => {
                      const items = index.filter((e) => e.kind === kind);
                      return (
                        <CommandGroup key={kind} heading={heading}>
                          {items.map((e) => (
                            <CommandItem
                              key={e.href}
                              value={`${e.title} ${e.subtitle} ${e.keywords}`}
                              onSelect={() => go(e)}
                            >
                              <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                              <Result entry={e} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                    <CommandGroup heading="More">
                      <CommandItem
                        value={`search all ${q}`}
                        onSelect={() => {
                          setOpen(false);
                          router.push(routes.search(q));
                        }}
                      >
                        See all results for “{q}”
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
              <div className="hidden items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-subtle-foreground sm:flex">
                <span>↑↓ to move</span>
                <span>↵ to open</span>
                <span>Esc to close</span>
              </div>
            </Command>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </PaletteContext.Provider>
  );
}

function Result({ entry }: { entry: SearchEntry }) {
  return (
    <span className="grid min-w-0">
      <span className="truncate font-semibold">{entry.title}</span>
      {entry.subtitle && <span className="truncate text-xs text-muted-foreground">{entry.subtitle}</span>}
    </span>
  );
}
