"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevotionalSubscribeFormProps {
  className?: string;
  variant?: "hero" | "card" | "sidebar";
}

export function DevotionalSubscribeForm({ className, variant = "card" }: DevotionalSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [deliveryTime, setDeliveryTime] = useState<"dawn" | "vespers">("dawn");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please provide a valid mailbox address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/devotional/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deliveryTime }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to complete inscription at this moment.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "A network irregularity occurred. Please try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="animate-fade-in rounded-panel border border-emerald-500/30 bg-emerald-950/20 p-6 text-center text-foreground sm:p-8"
      >
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>
        <h4 className="font-display text-xl font-bold text-foreground">
          Welcome to the Fellowship of Prayer
        </h4>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your email has been inscribed. Look forward to receiving your daily spiritual bread, Scripture
          meditation, and canticles every dawn.
        </p>
        <div className="mt-5 border-t border-border/70 pt-4">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-xs font-bold text-crimson-700 transition-colors hover:text-crimson-800 dark:text-crimson-400 dark:hover:text-crimson-300"
          >
            Inscribe another email address
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "bg-surface-raised relative rounded-panel border border-border/80 p-6 transition-all sm:p-8",
        variant === "hero" ? "shadow-md" : "shadow-sm",
        className,
      )}
    >
      {/* Cadence Selection Pills */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor="devotional-email-input"
          className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
        >
          Preferred Delivery Hour
        </label>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setDeliveryTime("dawn")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              deliveryTime === "dawn"
                ? "bg-[#5B101E] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sun className="size-3.5 text-current" />
            Dawn Manna (5:30 AM)
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTime("vespers")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              deliveryTime === "vespers"
                ? "bg-[#5B101E] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Moon className="size-3.5 text-current" />
            Vespers (6:00 PM)
          </button>
        </div>
      </div>

      {/* Email Input Field & Action Button */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
            <Mail className="size-4.5" />
          </div>
          <input
            id="devotional-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            placeholder="Enter your mailbox address (e.g. brother@example.com)"
            aria-label="Email Address for ESOCS Daily Devotionals"
            className="h-12 w-full rounded-pill border border-border bg-surface pr-4 pl-11 text-sm text-foreground shadow-xs transition-all outline-none placeholder:text-muted-foreground focus:border-crimson-700 focus:ring-2 focus:ring-crimson-700/20 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill bg-[#5B101E] px-7 text-sm font-bold text-white shadow-sm ring-1 ring-gold-500/20 transition-all hover:bg-[#430B16] hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin text-white" />
              <span>Inscribing...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-gold-300" />
              <span>Receive Daily Devotionals</span>
            </>
          )}
        </button>
      </div>

      {/* Error Feedback */}
      {status === "error" && errorMessage && (
        <p className="mt-2.5 text-left text-xs font-medium text-rose-500">{errorMessage}</p>
      )}

      {/* Trust & Guarantee */}
      <p className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Delivered free every dawn · One Fold, One Shepherd</span>
        <span className="hidden sm:inline">Zero spam · Unsubscribe at any time</span>
      </p>
    </form>
  );
}
