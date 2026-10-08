"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function BackButton({
  href,
  label = "Back",
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "hover:bg-muted inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur-xs transition-all hover:border-border-strong hover:text-foreground",
          className,
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className={cn(
        "hover:bg-muted inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur-xs transition-all hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}
