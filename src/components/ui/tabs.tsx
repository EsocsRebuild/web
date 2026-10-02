"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

const TabsVariantContext = React.createContext<"line" | "pill">("line");

export interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  variant?: "line" | "pill";
}

export function TabsList({ className, variant = "line", children, ...props }: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        className={cn(
          variant === "pill"
            ? "scrollbar-none inline-flex h-11 max-w-full items-center gap-1 overflow-x-auto rounded-pill border border-border bg-surface-muted/90 p-1 text-muted-foreground shadow-xs"
            : "scrollbar-none flex max-w-full gap-6 overflow-x-auto border-b border-border",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext.Provider>
  );
}

export interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  variant?: "line" | "pill";
}

export function TabsTrigger({ className, variant: propVariant, ...props }: TabsTriggerProps) {
  const contextVariant = React.useContext(TabsVariantContext);
  const variant = propVariant ?? contextVariant;

  return (
    <TabsPrimitive.Trigger
      className={cn(
        variant === "pill"
          ? "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-pill px-4 text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none hover:text-foreground active:scale-[0.98] data-[state=active]:bg-surface data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          : "-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center border-b-2 border-transparent text-sm font-semibold whitespace-nowrap text-muted-foreground transition-all duration-150 hover:text-foreground active:scale-[0.99] data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("pt-6 focus-visible:outline-none", className)} {...props} />;
}
