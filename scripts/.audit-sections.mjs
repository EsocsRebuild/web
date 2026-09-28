import { chromium } from "@playwright/test";
const base = "http://localhost:3000";
const WIDTHS = (process.argv[2] ?? "320,360,390,414,600,768,900,1024,1180,1280,1366,1440,1536,1920")
  .split(",")
  .map(Number);
const ROUTES = (
  process.argv[3] ??
  "/,/store,/store/category/garments,/store/esocs-hymn-book-english,/store/white-prayer-gown"
).split(",");
const SCOPES = [
  'nav[aria-label="Find your way around"]',
  'section[aria-labelledby="find-your-church"]',
  'section[aria-labelledby="store-teaser-heading"]',
  'main:has(nav[aria-label="Store categories"])',
  'main:has(nav[aria-label="Breadcrumb"])',
];
async function audit(SCOPES) {
  const vw = document.documentElement.clientWidth,
    out = [];
  if (document.documentElement.scrollWidth > vw + 1)
    out.push({ kind: "overflow", what: `page +${document.documentElement.scrollWidth - vw}px` });
  const desc = (el) =>
    `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48)}"`;
  const vis = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 1 && r.height > 1;
  };
  const lines = (el) => {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const tops = new Set();
    for (const r of rg.getClientRects()) if (r.width > 1) tops.add(Math.round(r.top / 4));
    return tops.size;
  };
  const seen = new Set();
  for (const sel of SCOPES)
    for (const root of document.querySelectorAll(sel)) {
      if (!vis(root)) continue;
      for (const el of root.querySelectorAll("*")) {
        if (seen.has(el) || !vis(el) || el.closest(".sr-only,[aria-hidden='true']")) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        if (
          (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) ||
          (cs.webkitLineClamp && cs.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 1)
        )
          out.push({ kind: "ellipsis", what: desc(el) });
        const r = el.getBoundingClientRect();
        const pr = el.parentElement.getBoundingClientRect();
        const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!direct) continue;
        const label =
          el.matches(
            "h1,h2,h3,h4,a,button,label,dt,dd,kbd,summary,[class*='font-bold'],[class*='font-semibold'],[class*='font-extrabold'],[class*='tabular']",
          ) || el.closest("a,button,summary,h3,dd,dt");
        const isProse = el.tagName === "P" && !/font-(bold|semibold)/.test(el.className);
        const n = lines(el);
        if (label && !isProse && n > 1)
          out.push({
            kind: /^H[12]$/.test(el.tagName) ? "headline-wrap" : "wrap",
            what: desc(el),
            detail: `${n} lines @ ${Math.round(r.width)}px`,
          });
        if (
          r.right > pr.right + 2 &&
          getComputedStyle(el.parentElement).display !== "contents" &&
          getComputedStyle(el.parentElement).overflowX === "visible"
        )
          out.push({ kind: "spill", what: desc(el) });
      }
    }
  return out;
}
const b = await chromium.launch();
const all = [];
for (const w of WIDTHS) {
  const ctx = await b.newContext({
    viewport: { width: w, height: w < 700 ? 844 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  for (const route of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(base + route, { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForTimeout(2500);
    await p.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    await p.waitForTimeout(300);
    for (const f of await p.evaluate(audit, SCOPES)) all.push({ route, w, ...f });
    await p.close();
  }
  await ctx.close();
}
await b.close();
const g = new Map();
for (const f of all) {
  const k = `${f.kind} | ${f.route} | ${f.what}`;
  const x = g.get(k) ?? { ...f, ws: [], ds: [] };
  x.ws.push(f.w);
  if (f.detail) x.ds.push(f.detail);
  g.set(k, x);
}
const kinds = {};
for (const x of g.values()) (kinds[x.kind] ??= []).push(x);
for (const [k, l] of Object.entries(kinds)) {
  console.log(`\n== ${k} (${l.length})`);
  for (const x of l)
    console.log(`  ${x.route} @ ${x.ws.join(",")}  ${x.what}${x.ds[0] ? `  [${x.ds[0]}]` : ""}`);
}
console.log(`\n${g.size} distinct findings`);
