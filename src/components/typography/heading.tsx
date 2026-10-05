import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const headingVariants = cva("text-foreground", {
  variants: {
    size: {
      "2xl": "font-display text-display-2xl font-extrabold tracking-[-0.028em]",
      xl: "font-display text-display-xl font-extrabold tracking-[-0.024em]",
      lg: "font-display text-display-lg font-bold tracking-[-0.02em]",
      md: "font-display text-display-md font-bold tracking-[-0.016em]",
      sm: "font-display text-display-sm font-bold tracking-[-0.012em]",
      title: "font-sans text-xl leading-snug font-bold tracking-tight",
      subtitle: "font-sans text-base leading-snug font-semibold",
    },
    align: { left: "text-left", center: "text-center" },
  },
  defaultVariants: { size: "md" },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  /** Document outline level. Visual size is set independently with `size`. */
  as?: HeadingTag;
}

export function Heading({ as: Comp = "h2", size, align, className, ...props }: HeadingProps) {
  return <Comp className={cn(headingVariants({ size, align }), className)} {...props} />;
}

export { headingVariants };
