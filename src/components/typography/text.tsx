import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs leading-5",
      sm: "text-sm leading-6",
      md: "text-base leading-7",
      lg: "text-lg leading-8",
      xl: "text-lg leading-8 md:text-xl md:leading-9",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      subtle: "text-subtle-foreground",
      highlight: "text-highlight",
      danger: "text-danger",
      success: "text-success",
    },
    weight: { regular: "font-normal", medium: "font-medium", semibold: "font-semibold" },
  },
  defaultVariants: { size: "md", tone: "default", weight: "regular" },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  asChild?: boolean;
  as?: "p" | "span" | "div" | "small" | "strong" | "figcaption";
}

export function Text({ as = "p", asChild, size, tone, weight, className, ...props }: TextProps) {
  const Comp = asChild ? Slot : as;
  return <Comp className={cn(textVariants({ size, tone, weight }), className)} {...props} />;
}

/** Introductory paragraph under a page or section heading. */
export function Lead({ className, ...props }: Omit<TextProps, "size">) {
  return <Text size="xl" tone="muted" className={cn("max-w-2xl", className)} {...props} />;
}

export { textVariants };
