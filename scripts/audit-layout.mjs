#!/usr/bin/env node
/**
 * Layout audit: loads every page template at every width and measures, rather than
 * assumes, that nothing breaks. Reports, per page and width:
 *
 *   overflow   the page scrolls sideways
 *   offscreen  an element pokes past the screen edge (outside intentional scrollers)
 *   clipped    text cut off by its container
 *   ellipsis   text cut with "…" (text-overflow or line-clamp): never allowed
 *   cut        a button, link or field cut off by the box around it
 *   distorted  an image drawn out of proportion
 *   blurry     an image drawn larger than its file's true pixels (visibly soft)
 *
 * Usage: start a production server, then
 *   node scripts/audit-layout.mjs [baseUrl=http://localhost:3123] [--widths=320,390,1440]
 * Exits non-zero when anything is found.
 */
import { readFileSync } from "node:fs";

import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3123";
const widthsArg = args.find((a) => a.startsWith("--widths="));
const WIDTHS = widthsArg
  ? widthsArg.slice(9).split(",").map(Number)
  : [320, 360, 390, 414, 600, 768, 900, 1024, 1280, 1440, 1920];
const ROUTES = [
  ...readFileSync(new URL("../e2e/routes.ts", import.meta.url), "utf8").matchAll(/^\s+"(\/[^"]*)",/gm),
].map((m) => m[1]);

/** Runs in the page. Returns a list of findings. */
async function audit() {
  const vw = document.documentElement.clientWidth;
  const findings = [];
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls =
      typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
    const text = (el.getAttribute("aria-label") || el.textContent || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 50);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ""}`;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    // Visually hidden text (screen-reader only) is collapsed to a pixel on purpose.
    return r.width > 1 && r.height > 1;
  };
  const inIgnored = (el) => el.closest("[aria-hidden='true'], .sr-only, [data-marquee], dialog:not([open])");
  /** Nearest ancestor that clips horizontally (a scroller or overflow hidden/clip). */
  const clipper = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== "visible") return { el: p, scrolls: ox === "auto" || ox === "scroll" };
    }
    return null;
  };

  if (document.documentElement.scrollWidth > vw + 1) {
    findings.push({
      kind: "overflow",
      what: `page is ${document.documentElement.scrollWidth - vw}px wider than the screen`,
    });
  }

  const reported = new Set();
  const images = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (inIgnored(el) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // Off the screen, unless an ancestor clips or scrolls it on purpose.
    if ((r.right > vw + 1 || r.left < -1) && cs.position !== "fixed") {
      const c = clipper(el);
      if (!c && ![...reported].some((p) => p.contains(el))) {
        reported.add(el);
        findings.push({
          kind: "offscreen",
          what: describe(el),
          detail: `${Math.round(r.left)}→${Math.round(r.right)} of ${vw}`,
        });
      }
    }

    // Controls must be whole: never cut by a box that hides overflow.
    if (el.matches("a, button, input, select, textarea, [role='button']")) {
      const c = clipper(el);
      if (c && !c.scrolls) {
        const cr = c.el.getBoundingClientRect();
        if (r.right > cr.right + 1 || r.left < cr.left - 1) {
          findings.push({
            kind: "cut",
            what: describe(el),
            detail: `${Math.round(r.left)}→${Math.round(r.right)} in box ${Math.round(cr.left)}→${Math.round(cr.right)}`,
          });
        }
      }
    }

    // "…" in any form.
    const clamp = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
    if ((cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) || clamp) {
      findings.push({ kind: "ellipsis", what: describe(el) });
    }

    // Text cut off by its own box or by a clipping ancestor (scrollers excepted).
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText) {
      if (cs.overflowX !== "visible" && cs.overflowX !== "auto" && el.scrollWidth > el.clientWidth + 1) {
        findings.push({ kind: "clipped", what: describe(el), detail: `${el.scrollWidth}>${el.clientWidth}` });
      } else {
        const range = document.createRange();
        range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        const c = clipper(el);
        if (c && !c.scrolls && tr.width > 0) {
          const cr = c.el.getBoundingClientRect();
          if (tr.right > cr.right + 2 || tr.left < cr.left - 2) {
            findings.push({
              kind: "clipped",
              what: describe(el),
              detail: `text ${Math.round(tr.left)}→${Math.round(tr.right)} in box ${Math.round(cr.left)}→${Math.round(cr.right)}`,
            });
          }
        }
      }
    }

    // Images: proportion and sharpness, from the file's true pixels (a responsive
    // image's naturalWidth is already divided by its density, so decode it afresh).
    if (el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0)
      images.push({ el, r, fit: cs.objectFit });
  }
  for (const { el, r, fit } of images) {
    const file = new Image();
    file.src = el.currentSrc || el.src;
    try {
      await file.decode();
    } catch {
      continue;
    }
    const drawnRatio = r.width / r.height;
    const fileRatio = file.naturalWidth / file.naturalHeight;
    if ((fit === "fill" || fit === "") && Math.abs(drawnRatio - fileRatio) / fileRatio > 0.03) {
      findings.push({
        kind: "distorted",
        what: describe(el),
        detail: `drawn ${drawnRatio.toFixed(2)} vs file ${fileRatio.toFixed(2)}`,
      });
    }
    // object-fit: cover fills the larger of the two scales; contain/fill the smaller.
    const scale =
      fit === "cover"
        ? Math.max(r.width / file.naturalWidth, r.height / file.naturalHeight)
        : Math.min(r.width / file.naturalWidth, r.height / file.naturalHeight);
    // Softness shows once one file pixel is stretched over more than one screen
    // pixel (at 1x); the size hints still ask for sharper files on dense screens.
    if (scale > 1.1 && r.width > 64) {
      findings.push({
        kind: "blurry",
        what: describe(el),
        detail: `${file.naturalWidth}px file drawn at ${Math.round(r.width)}px ×${devicePixelRatio} (${file.src.split("url=")[1]?.split("&")[0] ?? file.src})`,
      });
    }
  }
  return findings;
}

const browser = await chromium.launch();
const all = [];
for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: width < 700 ? 844 : 900 },
    deviceScaleFactor: width < 700 ? 2 : 1,
    reducedMotion: "reduce",
    hasTouch: width < 700,
  });
  for (const route of ROUTES) {
    // A fresh tab per page, so one stalled connection cannot hold up the rest.
    let page = await context.newPage();
    // The image optimiser can be slow on a first visit, and local networks blip:
    // allow time, and try up to three times before giving up.
    for (let attempt = 1; ; attempt++) {
      try {
        await page.goto(base + route, { waitUntil: "load", timeout: 60_000 });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
        await page.close();
        await new Promise((r) => setTimeout(r, 2000));
        page = await context.newPage();
      }
    }
    // Load lazy images: step down the page, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 250));
    });
    const findings = await page.evaluate(audit);
    for (const f of findings) all.push({ route, width, ...f });
    await page.close();
  }
  await context.close();
  process.stdout.write(`${width}px checked\n`);
}
await browser.close();

// Group identical findings across widths, so each problem is listed once.
const grouped = new Map();
for (const f of all) {
  const key = `${f.kind} | ${f.route} | ${f.what}`;
  const g = grouped.get(key) ?? { ...f, widths: [] };
  g.widths.push(f.width);
  grouped.set(key, g);
}
const byKind = {};
for (const g of grouped.values()) (byKind[g.kind] ??= []).push(g);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n== ${kind} (${list.length})`);
  for (const g of list)
    console.log(`  ${g.route} @ ${g.widths.join(",")}  ${g.what}${g.detail ? `  [${g.detail}]` : ""}`);
}
console.log(`\n${grouped.size} distinct finding(s) across ${ROUTES.length} pages × ${WIDTHS.length} widths.`);
process.exit(grouped.size ? 1 : 0);
