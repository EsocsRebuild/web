import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Container, type ContainerProps } from "./container";

const sectionVariants = cva("relative", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-surface-muted text-foreground",
      surface: "bg-surface text-foreground",
      // `.dark` makes every descendant resolve dark-theme tokens.
      inverse: "dark bg-inverse text-foreground",
    },
    spacing: {
      none: "",
      sm: "py-12 md:py-16",
      md: "py-section",
    },
  },
  defaultVariants: { tone: "default", spacing: "md" },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  /** Inner container width, or `false` to render children directly. */
  container?: ContainerProps["size"] | false;
  containerClassName?: string;
  as?: "section" | "div" | "article" | "aside";
}

export function Section({
  as: Comp = "section",
  tone,
  spacing,
  container = "default",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <Comp className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
      {container === false ? (
        children
      ) : (
        <Container size={container} className={containerClassName}>
          {children}
        </Container>
      )}
    </Comp>
  );
}
