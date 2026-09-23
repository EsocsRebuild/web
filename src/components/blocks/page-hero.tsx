import Image from "next/image";
import * as React from "react";

import { Container } from "@/components/layout/container";
import { Heading } from "@/components/typography/heading";
import { Overline } from "@/components/typography/overline";
import { Lead } from "@/components/typography/text";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional background photograph. */
  image?: string | null;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}

/** Opening band for inner pages. Place it first in the page for the transparent header. */
export function PageHero({ overline, title, description, actions, image, align = "left", className, children }: PageHeroProps) {
  const centered = align === "center";
  return (
    <section
      data-hero
      className={cn(
        "dark relative isolate overflow-hidden bg-inverse text-foreground",
        "pt-[calc(var(--spacing-header)+env(safe-area-inset-top)+3.5rem)] pb-14 md:pt-[calc(var(--spacing-header)+5.5rem)] md:pb-20",
        className,
      )}
    >
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-inverse/70" />
        </>
      )}
      <Container className={cn("flex flex-col gap-5", centered && "items-center text-center")}>
        {overline && <Overline>{overline}</Overline>}
        <Heading as="h1" size="xl" className="max-w-4xl">
          {title}
        </Heading>
        {description && <Lead className={cn(centered && "mx-auto")}>{description}</Lead>}
        {actions && <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
        {children}
      </Container>
    </section>
  );
}
