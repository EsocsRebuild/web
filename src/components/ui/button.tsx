import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-semibold whitespace-nowrap select-none",
    "transition-[transform,background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "active:translate-y-0.5 active:scale-[0.985]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent-hover",
        /** Gold: giving, sacred stewardship, and primary liturgical actions */
        gold: "bg-gold-500 font-bold text-royal-950 shadow-xs hover:bg-gold-400 active:bg-gold-600",
        secondary:
          "border border-border/80 bg-surface-muted text-foreground hover:border-border hover:bg-surface-sunken",
        outline:
          "border border-border bg-surface text-foreground shadow-xs hover:border-border-strong hover:bg-surface-muted",
        ghost: "bg-transparent text-foreground hover:bg-surface-muted",
        /** High-contrast solid overlay for photography and hero media */
        overlay: "border border-white/40 bg-royal-950/40 text-white hover:bg-white hover:text-royal-950",
        danger: "bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover",
        link: "h-auto! rounded-none px-0! text-foreground underline underline-offset-4 hover:text-highlight active:translate-y-0! active:scale-100!",
      },
      shape: {
        control: "rounded-control",
        pill: "rounded-pill",
      },
      size: {
        sm: "h-9 px-3.5 text-sm [&_svg]:size-4 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4 [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5 [&_svg]:h-5 [&_svg]:w-5",
        "icon-sm": "size-9 [&_svg]:size-4 [&_svg]:h-4 [&_svg]:w-4",
        icon: "size-11 [&_svg]:size-5 [&_svg]:h-5 [&_svg]:w-5",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "control" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Merge styles onto the child element, e.g. a Next.js `<Link>`. */
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  shape,
  fullWidth,
  asChild = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, shape, fullWidth }), className)}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={asChild && isDisabled ? true : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      <Slottable>{children}</Slottable>
      {rightIcon}
    </Comp>
  );
}

export { buttonVariants };
