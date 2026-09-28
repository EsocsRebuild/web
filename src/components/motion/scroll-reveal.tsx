"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Section reveal for the whole site, with no per-page wiring. After each page
 * renders it finds the page's sections (the blocks inside <main>), leaves any
 * already on screen exactly as they are, and holds back only those still below
 * the fold; each one then rises into place as it scrolls into view, its cards or
 * list items following in a short cascade.
 *
 * It works purely through the Web Animations API and never touches the page's
 * attributes, classes or styles. That matters: parts of a page can hydrate after
 * this runs (streaming), and React must find exactly the HTML it rendered. It also
 * means the server HTML is complete and readable without JavaScript and for search
 * engines, and it does nothing at all when the reader prefers reduced motion.
 *
 * Blocks: semantic sections (section, header, article, aside, nav, figure, form,
 * lists) found by walking down through plain layout wrappers, at most two deep.
 * Items: anything marked with <Reveal>, otherwise the first list of two or more.
 * Opt out with data-sr-skip; mark a custom block with data-sr-block.
 */
const BLOCK = "section, header, article, aside, nav, figure, form, ol, ul, [data-sr-block]";
const MAX_ITEMS = 16;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const BLOCK_FROM: Keyframe = { opacity: 0, translate: "0 40px", scale: "0.985" };
const ITEM_FROM: Keyframe = { opacity: 0, translate: "0 24px" };
const AT_REST: Keyframe = { opacity: 1, translate: "0 0", scale: "1" };

function findBlocks(main: HTMLElement) {
  const blocks: HTMLElement[] = [];
  const visit = (el: Element, depth: number) => {
    for (const child of el.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.matches("[data-overlay-hero], [data-sr-skip], script, style, template")) continue;
      if (child.matches(BLOCK) || depth >= 2) blocks.push(child);
      else visit(child, depth + 1);
    }
  };
  visit(main, 0);
  return blocks;
}

function findItems(block: HTMLElement) {
  const marked = block.querySelectorAll<HTMLElement>("[data-reveal]");
  if (marked.length) return [...marked].slice(0, MAX_ITEMS);
  const list = block.matches("ul, ol") ? block : block.querySelector("ul, ol");
  const items = list ? [...list.children].filter((c): c is HTMLElement => c instanceof HTMLElement) : [];
  return items.length >= 2 ? items.slice(0, MAX_ITEMS) : [];
}

interface Held {
  block: HTMLElement;
  items: HTMLElement[];
  holds: Animation[];
}

export function ScrollReveal() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("main");
    if (!main) return;

    const seen = new WeakSet<Element>();
    const held = new Map<Element, Held>();

    /** Hold an element at its starting pose (an animation with no attributes involved). */
    const hold = (el: HTMLElement, from: Keyframe) =>
      el.animate([from, from], { duration: 1, fill: "forwards" });

    const reveal = ({ block, items, holds }: Held) => {
      holds.forEach((h) => h.cancel());
      block.animate([BLOCK_FROM, AT_REST], { duration: 1000, easing: EASE });
      items.forEach((item, i) =>
        item.animate([ITEM_FROM, AT_REST], {
          duration: 900,
          easing: EASE,
          delay: 140 + Math.min(i, 10) * 70,
          fill: "backwards",
        }),
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const h = held.get(entry.target);
          if (h) reveal(h);
          held.delete(entry.target);
          io.unobserve(entry.target);
        }
      },
      // Reveal as the block's top passes the lower eighth of the screen. Threshold 0,
      // so even a block taller than the screen appears the moment it arrives.
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    const arm = () => {
      for (const block of findBlocks(main)) {
        if (seen.has(block)) continue;
        seen.add(block);
        // Any part already on screen (or above it): never hide what someone can see.
        if (block.getBoundingClientRect().top < window.innerHeight) continue;
        const items = findItems(block);
        held.set(block, {
          block,
          items,
          holds: [hold(block, BLOCK_FROM), ...items.map((item) => hold(item, ITEM_FROM))],
        });
        io.observe(block);
      }
    };

    // Content that arrives later (a page streaming in, "Show more") is armed too.
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        arm();
      });
    });

    // Printing, or leaving the page: nothing may stay held back.
    const releaseAll = () => {
      held.forEach((h) => h.holds.forEach((a) => a.cancel()));
      held.clear();
    };
    window.addEventListener("beforeprint", releaseAll);

    arm();
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("beforeprint", releaseAll);
      releaseAll();
    };
  }, [pathname]);

  return null;
}
