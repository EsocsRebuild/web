import * as React from "react";

/** Narrow, calm frame for member pages. These are personal, never indexed. */
export function MemberShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-gutter py-10">
      <header className="grid gap-2">
        {eyebrow && <p className="text-overline font-semibold text-highlight uppercase">{eyebrow}</p>}
        <h1 className="font-display text-display-md font-extrabold">{title}</h1>
      </header>
      {children}
    </div>
  );
}
