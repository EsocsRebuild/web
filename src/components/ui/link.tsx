import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextLinkProps extends React.ComponentProps<typeof NextLink> {
  external?: boolean;
}

export function TextLink({ className, external, children, ...props }: TextLinkProps) {
  return (
    <NextLink
      className={cn(
        "font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-current",
        className,
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </NextLink>
  );
}

/** Standalone navigational link, e.g. "View all events". */
export function ArrowLink({ className, children, ...props }: React.ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      className={cn(
        "group/arrow inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-highlight",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="size-4 transition-transform duration-150 group-hover/arrow:translate-x-0.5"
      />
    </NextLink>
  );
}
