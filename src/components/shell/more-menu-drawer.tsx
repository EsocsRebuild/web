"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import { MoreGroups } from "./more-menu";

/** The phone's "More" sheet. Loaded on the first tap of More (see BottomNav). */
export default function MoreMenuDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader>
          <DrawerTitle>More</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-3 pb-6">
          <MoreGroups onNavigate={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
