import { cn } from "@/lib/utils";

export interface ScriptureProps {
  children: React.ReactNode;
  /** Book, chapter and verse, e.g. "Psalm 122:1". */
  reference: string;
  /** Translation abbreviation, e.g. "KJV". */
  version?: string;
  align?: "left" | "center";
  className?: string;
}

export function Scripture({ children, reference, version, align = "center", className }: ScriptureProps) {
  return (
    <figure
      className={cn("flex flex-col gap-6", align === "center" && "items-center text-center", className)}
    >
      <blockquote className="max-w-3xl font-display text-display-md font-normal text-balance italic">
        <p>{children}</p>
      </blockquote>
      <figcaption className="text-sm font-semibold text-muted-foreground">
        <cite className="not-italic">{reference}</cite>
        {version && <span className="text-subtle-foreground"> ({version})</span>}
      </figcaption>
    </figure>
  );
}
