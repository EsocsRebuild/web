"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Mail, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevotionalSubscribeFormProps {
  variant?: "card" | "hero" | "compact";
  className?: string;
  onSuccess?: (email: string) => void;
}

export function DevotionalSubscribeForm({
  variant = "card",
  className,
  onSuccess,
}: DevotionalSubscribeFormProps) {
  const [email, setEmail] = React.useState("");
  const [deliveryTime, setDeliveryTime] = React.useState<"dawn" | "vespers">("dawn");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/devotional/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, deliveryTime }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setStatus("error");
        setErrorMessage(data?.error || "Unable to complete subscription. Please try again.");
        return;
      }

      setSubmittedEmail(cleanEmail);
      setStatus("success");
      setEmail("");
      if (onSuccess) onSuccess(cleanEmail);
    } catch {
      setStatus("error");
      setErrorMessage("Network connection error. Please try again in a moment.");
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "animate-in fade-in zoom-in-95 rounded-2xl border border-amber-500/40 bg-linear-to-b from-amber-950/40 to-slate-950/90 p-6 text-center text-white shadow-2xl backdrop-blur-xl",
          className,
        )}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <CheckCircle2 className="size-6 text-amber-300" />
        </div>
        <h3 className="mt-3 font-serif text-lg font-bold text-amber-200">Inscribed into Daily Fellowship</h3>
        <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
          A confirmation and welcome blessing has been sent to{" "}
          <span className="font-semibold text-amber-300">{submittedEmail}</span>.
        </p>
        <p className="mt-3 font-serif text-[0.6875rem] text-amber-200/80 italic">
          &ldquo;Thy word is a lamp unto my feet, and a light unto my path.&rdquo; — Psalm 119:105
        </p>
        <div className="mt-4 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-xs font-semibold text-slate-400 transition-colors hover:text-amber-300"
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
        "relative rounded-2xl border border-white/15 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 sm:p-6",
        variant === "hero" && "border-amber-400/30 bg-slate-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]",
        className,
      )}
    >
      {/* Cadence Selection Pills */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="devotional-email-input"
          className="text-xs font-semibold tracking-wider text-slate-300 uppercase"
        >
          Preferred Delivery Hour
        </label>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/90 p-1">
          <button
            type="button"
            onClick={() => setDeliveryTime("dawn")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-all",
              deliveryTime === "dawn"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Sun className="size-3 text-current" />
            Dawn Manna (5:30 AM)
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTime("vespers")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-all",
              deliveryTime === "vespers"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Moon className="size-3 text-current" />
            Evening (6:00 PM)
          </button>
        </div>
      </div>

      {/* Email Input Field & Action Button */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="size-4.5 text-amber-400/80" />
          </div>
          <input
            id="devotional-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            placeholder="Enter your mailbox address (e.g. brother@example.com)"
            aria-label="Email Address for ESOCS Daily Devotionals"
            className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-400 shadow-inner transition-all duration-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-400/60 bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 px-5 py-3 font-sans text-xs font-bold tracking-wide text-slate-950 shadow-[0_4px_20px_rgba(251,191,36,0.4)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_25px_rgba(251,191,36,0.6)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin text-slate-950" />
              <span>Inscribing...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-slate-950 transition-transform duration-200 group-hover:scale-125" />
              <span>Receive Daily Devotionals</span>
            </>
          )}
        </button>
      </div>

      {/* Error Feedback */}
      {status === "error" && errorMessage && (
        <p className="mt-2 text-left text-xs font-medium text-rose-400">{errorMessage}</p>
      )}

      {/* Liturgical Trust & Security Guarantee */}
      <p className="mt-3 flex items-center justify-between text-[0.6875rem] text-slate-400">
        <span>Delivered free every dawn · One Fold, One Shepherd</span>
        <span className="hidden sm:inline">Zero spam · Unsubscribe at any time</span>
      </p>
    </form>
  );
}
