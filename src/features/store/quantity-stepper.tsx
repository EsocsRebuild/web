"use client";

import { Minus, Plus } from "lucide-react";

import { MAX_QUANTITY } from "@/data/pricing";
import { cn } from "@/lib/utils";

/** − 2 + with a live, labelled value. */
export function QuantityStepper({
  value,
  onChange,
  label,
  disabled,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  /** e.g. "Quantity of ESOCS Hymn Book". */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const button =
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-pill border border-border-strong bg-surface p-0.5",
        className,
      )}
    >
      <button
        type="button"
        className={button}
        aria-label="One fewer"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <output aria-live="polite" className="w-8 text-center text-sm font-semibold tabular">
        {value}
      </output>
      <button
        type="button"
        className={button}
        aria-label="One more"
        disabled={disabled || value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
