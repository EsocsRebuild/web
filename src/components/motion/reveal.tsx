import * as React from "react";

/**
 * Marks an item for the section scroll reveal: when its section rises into view,
 * marked items follow one after another (see ScrollReveal). It renders the element
 * as it is, so it can wrap list items, cards or anything else; the timing of the
 * cascade is automatic.
 */
export function Reveal({
  as: Comp = "div",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return (
    <Comp data-reveal="" {...props}>
      {children}
    </Comp>
  );
}
