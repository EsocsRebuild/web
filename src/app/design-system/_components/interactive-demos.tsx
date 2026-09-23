"use client";

import { Search, Share2 } from "lucide-react";
import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";

export function OverlayDemos() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prayer request</DialogTitle>
            <DialogDescription>Requests are shared only with the intercessory team.</DialogDescription>
          </DialogHeader>
          <Field label="Name" htmlFor="dlg-name" hint="Optional">
            <Input id="dlg-name" aria-describedby="dlg-name-msg" />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => toast.success("Prayer request sent")}>Send</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Sheet</Button>
        </SheetTrigger>
        <SheetContent className="gap-2 p-6">
          <SheetTitle className="text-xl font-semibold">Filters</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">Side panel content.</SheetDescription>
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        onClick={() => toast("Service update", { description: "Bible Study moves to the Youth Hall this week." })}
      >
        Toast
      </Button>

      <Tooltip content="Share">
        <Button variant="outline" size="icon" aria-label="Share">
          <Share2 />
        </Button>
      </Tooltip>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="sunday">
      <TabsList>
        <TabsTrigger value="sunday">Sunday</TabsTrigger>
        <TabsTrigger value="midweek">Midweek</TabsTrigger>
        <TabsTrigger value="special">Special services</TabsTrigger>
      </TabsList>
      <TabsContent value="sunday" className="text-muted-foreground">
        Sunday Worship, 9:00 AM, Main Sanctuary.
      </TabsContent>
      <TabsContent value="midweek" className="text-muted-foreground">
        Bible Study, Wednesdays at 6:00 PM.
      </TabsContent>
      <TabsContent value="special" className="text-muted-foreground">
        Vigils, anniversaries and harvest services.
      </TabsContent>
    </Tabs>
  );
}

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="a" className="max-w-2xl">
      <AccordionItem value="a">
        <AccordionTrigger>How long is the Sunday service?</AccordionTrigger>
        <AccordionContent>About two hours, including hymns, prayer, readings and the sermon.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is there a dress code?</AccordionTrigger>
        <AccordionContent>Members worship in white garments. Visitors may come as they are.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Is there provision for children?</AccordionTrigger>
        <AccordionContent>Sunday school runs during the main service for ages 3 to 12.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function LoadingButtonDemo() {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
      }}
    >
      Submit
    </Button>
  );
}

export function SearchDemo() {
  return <Input type="search" leftIcon={<Search />} placeholder="Search sermons and events" aria-label="Search" />;
}
