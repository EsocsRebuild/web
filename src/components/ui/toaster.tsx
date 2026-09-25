"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "rounded-card! border-border! bg-surface! text-foreground! font-sans! shadow-overlay!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground! rounded-control!",
        },
      }}
    />
  );
}

export { toast } from "sonner";
