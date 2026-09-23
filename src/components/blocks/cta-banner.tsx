import * as React from "react";

import { Heading } from "@/components/typography/heading";
import { Text } from "@/components/typography/text";
import { cn } from "@/lib/utils";

export interface CtaBannerProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}

export function CtaBanner({ title, description, actions, className }: CtaBannerProps) {
  return (
    <div
      className={cn(
        "dark flex flex-col gap-8 rounded-card bg-inverse px-6 py-10 text-foreground sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14",
        className,
      )}
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <Heading size="md">{title}</Heading>
        {description && <Text tone="muted">{description}</Text>}
      </div>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{actions}</div>
    </div>
  );
}
