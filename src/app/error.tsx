"use client";

import { RotateCcw } from "lucide-react";

import { PageHero } from "@/components/blocks/page-hero";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageHero
      align="center"
      overline="Error"
      title="Something went wrong"
      description={error.digest ? `Reference: ${error.digest}` : "Please try again in a moment."}
      actions={
        <Button size="lg" variant="accent" leftIcon={<RotateCcw />} onClick={reset}>
          Try again
        </Button>
      }
      className="min-h-[70svh]"
    />
  );
}
