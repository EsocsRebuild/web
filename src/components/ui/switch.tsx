import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export function Switch({ className, label, id, ...props }: SwitchProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer items-center gap-3", className)}>
      <span className="relative inline-flex">
        <input id={inputId} type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span className="h-6 w-10 rounded-full bg-border-strong transition-colors duration-150 peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50" />
        <span className="absolute top-1 left-1 size-4 rounded-full bg-white shadow-raised transition-transform duration-150 peer-checked:translate-x-4 dark:peer-checked:bg-royal-950" />
      </span>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}
