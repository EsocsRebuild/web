import Link from "next/link";

import { PageHero } from "@/components/blocks/page-hero";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageHero
      align="center"
      overline="404"
      title="This page could not be found"
      description="The page may have moved, or the link may be incorrect."
      actions={
        <Button asChild size="lg" variant="accent">
          <Link href="/">Return home</Link>
        </Button>
      }
      className="min-h-[70svh]"
    />
  );
}
