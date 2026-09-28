"use client";

import dynamic from "next/dynamic";
import * as React from "react";

const PaletteContext = React.createContext<{ open: () => void; preload: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>");
  return ctx;
}

const loadDialog = () => import("./command-palette-dialog");
const CommandPaletteDialog = dynamic(loadDialog, { ssr: false });

/**
 * Search everything from anywhere: `/` or ⌘K / Ctrl K, or the search button. Only
 * the shortcuts and the open state live here; the dialog and its search library
 * load the first time search opens, and are warmed when the search button is
 * hovered or focused, so opening still feels instant.
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  // Mounted from the first open onwards, so its state (and the index) is kept.
  const [used, setUsed] = React.useState(false);

  const openPalette = React.useCallback((next: boolean) => {
    if (next) setUsed(true);
    setOpen(next);
  }, []);
  const open = React.useCallback(() => openPalette(true), [openPalette]);
  const preload = React.useCallback(() => void loadDialog(), []);

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

  return (
    <PaletteContext.Provider value={{ open, preload }}>
      {children}
      {used && <CommandPaletteDialog open={isOpen} onOpenChange={openPalette} />}
    </PaletteContext.Provider>
  );
}
