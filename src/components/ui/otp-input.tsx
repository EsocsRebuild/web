"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One-time code entry: one box per digit, auto-advance, backspace to go back,
 * paste a whole code anywhere, and SMS autofill via `autocomplete="one-time-code"`.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  label = "One-time code",
  id,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string, focusIndex?: number) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (focusIndex !== undefined) refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (clean.length === length) onComplete?.(clean);
  };

  return (
    <div role="group" aria-label={label} className="flex gap-2 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          maxLength={length}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const typed = e.currentTarget.value.replace(/\D/g, "");
            if (!typed) return;
            // Typing or autofill may deliver several digits at once.
            const next = (value.slice(0, i) + typed + value.slice(i + typed.length)).slice(0, length);
            commit(next, i + typed.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (digit) commit(value.slice(0, i) + value.slice(i + 1), i);
              else if (i > 0) commit(value.slice(0, i - 1) + value.slice(i), i - 1);
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            commit(e.clipboardData.getData("text"), e.clipboardData.getData("text").length);
          }}
          className={cn(
            "size-12 rounded-control border border-input bg-surface text-center font-display text-2xl font-bold text-foreground tabular sm:size-14",
            "transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
            "disabled:opacity-60 aria-invalid:border-danger",
          )}
        />
      ))}
    </div>
  );
}
