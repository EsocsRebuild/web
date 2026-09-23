import Image from "next/image";
import * as React from "react";

import { cn, initials } from "@/lib/utils";

const sizes = { sm: 32, md: 40, lg: 56, xl: 96 } as const;

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const px = sizes[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-royal-100 font-semibold text-royal-800 dark:bg-royal-800 dark:text-royal-100",
        className,
      )}
      style={{ width: px, height: px, fontSize: Math.round(px * 0.36) }}
    >
      {src ? (
        <Image src={src} alt={name} width={px} height={px} className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={name}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export function AvatarGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex -space-x-2 [&>*]:ring-2 [&>*]:ring-background", className)}>{children}</div>;
}
