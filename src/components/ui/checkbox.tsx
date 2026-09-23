import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Checkbox({ className, label, description, id, ...props }: CheckboxProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-(--primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        {...props}
      />
      {(label || description) && (
        <label htmlFor={inputId} className="grid cursor-pointer gap-0.5 text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {description && <span className="text-muted-foreground">{description}</span>}
        </label>
      )}
    </div>
  );
}
