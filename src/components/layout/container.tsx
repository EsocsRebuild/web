import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-gutter", {
  variants: {
    size: {
      prose: "max-w-prose",
      narrow: "max-w-3xl",
      default: "max-w-site",
      wide: "max-w-wide",
      full: "max-w-none",
    },
  },
  defaultVariants: { size: "default" },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

export function Container({ className, size, asChild, ...props }: ContainerProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(containerVariants({ size }), className)} {...props} />;
}
