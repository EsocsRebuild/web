"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

import { DialogCloseButton, DialogOverlay } from "./dialog";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

/** Full-height panel sliding in from the right. */
export function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col bg-background text-foreground shadow-overlay focus:outline-none sm:max-w-sm",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          "data-[state=open]:animate-sheet-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogCloseButton className="top-[calc(env(safe-area-inset-top)+1rem)] right-4" />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
