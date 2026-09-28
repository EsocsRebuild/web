import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex gap-3 rounded-card p-4 text-sm leading-6 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "bg-info-soft [&>svg]:text-info",
        success: "bg-success-soft [&>svg]:text-success",
        warning: "bg-warning-soft [&>svg]:text-warning",
        danger: "bg-danger-soft [&>svg]:text-danger",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
}

export function Alert({ className, variant, title, children, role, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  const urgent = variant === "danger" || variant === "warning";
  return (
    <div
      role={role ?? (urgent ? "alert" : "status")}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <div className="grid gap-0.5">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        {children && <div className="text-foreground/80">{children}</div>}
      </div>
    </div>
  );
}
