import * as React from "react";

import { SplitHeadline } from "@/components/motion/split-headline";
import { cn } from "@/lib/utils";

/** The opening of a standalone page: eyebrow, a bold headline, a line of context. */
export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-4", className)}>
      {eyebrow && <p className="text-overline font-semibold text-highlight uppercase">{eyebrow}</p>}
      <SplitHeadline text={title} className="font-display text-display-lg font-extrabold text-balance" />
      {description && <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>}
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
