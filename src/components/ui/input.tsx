import * as React from "react";

import { cn } from "@/lib/utils";

/** Shared field styling for Input, Textarea and Select. */
export const fieldBase = cn(
  "w-full rounded-control border border-input bg-surface text-foreground",
  "placeholder:text-subtle-foreground",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-border-strong",
  "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

// Base font size is 16px on mobile so iOS Safari does not zoom on focus.
export function Input({ className, leftIcon, type = "text", ...props }: InputProps) {
  const input = (
    <input
      type={type}
      className={cn(
        fieldBase,
        "h-11 px-3.5 text-base sm:text-sm",
        leftIcon && "pl-10",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        className,
      )}
      {...props}
    />
  );
  if (!leftIcon) return input;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle-foreground [&_svg]:size-4">
        {leftIcon}
      </span>
      {input}
    </div>
  );
}
