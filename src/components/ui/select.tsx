import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { fieldBase } from "./input";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          "h-11 cursor-pointer appearance-none pr-10 pl-3.5 text-base sm:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-subtle-foreground"
      />
    </div>
  );
}
