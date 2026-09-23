import * as React from "react";

import { cn } from "@/lib/utils";

/** Small uppercase label placed above a heading. Use sparingly. */
export function Overline({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-sans text-overline font-semibold text-highlight uppercase", className)}
      {...props}
    />
  );
}
