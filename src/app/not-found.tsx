import { MapPin, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60svh] max-w-xl place-content-center gap-5 px-gutter py-20 text-center">
      <p className="text-overline font-semibold text-highlight uppercase">Page not found</p>
      <h1 className="font-display text-display-md font-extrabold text-balance">
        We can&apos;t find that page
      </h1>
      <p className="text-muted-foreground">
        It may have moved, or the link may be incorrect. Try finding a church or searching the site.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="accent" leftIcon={<MapPin />}>
          <Link href={routes.find()}>Find a Church</Link>
        </Button>
        <Button asChild size="lg" variant="outline" leftIcon={<Search />}>
          <Link href={routes.search()}>Search</Link>
        </Button>
      </div>
    </div>
  );
}
