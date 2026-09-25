"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60svh] max-w-xl place-content-center gap-5 px-gutter py-20 text-center">
      <p className="text-overline font-semibold text-highlight uppercase">Something went wrong</p>
      <h1 className="font-display text-display-md font-extrabold text-balance">
        We couldn&apos;t load this page
      </h1>
      <p className="text-muted-foreground">
        Check your connection and try again.{error.digest && ` Reference: ${error.digest}`}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="accent" leftIcon={<RotateCcw />} onClick={reset}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={routes.home()}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
