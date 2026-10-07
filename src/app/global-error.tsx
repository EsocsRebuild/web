"use client";

import { ErrorView } from "@/components/patterns/error-view";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";
import "@/styles/system.scss";

/**
 * Root Layout Global Error Boundary:
 *
 * Catches uncaught exceptions that occur within the root layout itself or during
 * server-side rendering initialization. Wraps its own `<html>` and `<body>` tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-gold-500/20 selection:text-gold-500">
        <main id="main-content">
          <ErrorView error={error} reset={reset} isGlobal />
        </main>
      </body>
    </html>
  );
}
