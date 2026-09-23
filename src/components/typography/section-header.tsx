import * as React from "react";

import { cn } from "@/lib/utils";

import { Heading, type HeadingProps } from "./heading";
import { Overline } from "./overline";
import { Lead } from "./text";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  size?: HeadingProps["size"];
  as?: HeadingProps["as"];
  /** Links or buttons. Right-aligned on wide screens when `align="left"`. */
  actions?: React.ReactNode;
}

export function SectionHeader({
  overline,
  title,
  description,
  align = "left",
  size = "lg",
  as = "h2",
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 md:mb-14",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cn("flex max-w-3xl flex-col gap-4", centered && "items-center")}>
        {overline && <Overline>{overline}</Overline>}
        <Heading as={as} size={size}>
          {title}
        </Heading>
        {description && <Lead className={cn(centered && "mx-auto")}>{description}</Lead>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
