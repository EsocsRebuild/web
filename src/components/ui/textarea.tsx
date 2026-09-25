import * as React from "react";

import { cn } from "@/lib/utils";

import { fieldBase } from "./input";

export function Textarea({
  className,
  rows = 5,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldBase, "min-h-28 resize-y px-3.5 py-2.5 text-base leading-6 sm:text-sm", className)}
      {...props}
    />
  );
}
