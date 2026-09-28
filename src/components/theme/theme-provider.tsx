"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

import { CommandPaletteProvider } from "@/components/shell/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocialProvider } from "@/features/social/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <SocialProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </SocialProvider>
      </TooltipProvider>
    </NextThemesProvider>
  );
}
