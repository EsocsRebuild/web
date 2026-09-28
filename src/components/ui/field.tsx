import * as React from "react";

import { cn } from "@/lib/utils";

import { Label } from "./label";

export interface FieldProps {
  label: React.ReactNode;
  /** Must match the id of the control passed as children. */
  htmlFor: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label, control and hint or error message. The message element's id is
 * `${htmlFor}-msg`; reference it from the control with aria-describedby.
 */
export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const message = error ?? hint;
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {message && (
        <p
          id={`${htmlFor}-msg`}
          role={error ? "alert" : undefined}
          className={cn("text-[0.8125rem] leading-5", error ? "text-danger" : "text-muted-foreground")}
        >
          {message}
        </p>
      )}
    </div>
  );
}
