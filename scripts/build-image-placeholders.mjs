#!/usr/bin/env node
/**
 * Builds the tiny blurred previews shown while photographs load lazily.
 *
 * For every image this app serves (public/media/legacy and public/brand), it writes
 * a 16-pixel-wide WebP as a data URL into src/data/generated/image-placeholders.json,
 * keyed by the image's public path. The content layer attaches these to each image,
 * so a photo fades in from its own colours instead of popping into an empty box.
 *
 * Deterministic and committed; run it whenever photographs are added:
 *   npm run images:placeholders
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(root, "public");
const SOURCES = ["media/legacy", "brand"];
const OUT = path.join(root, "src/data/generated/image-placeholders.json");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(webp|png|jpe?g)$/i.test(name)) yield full;
  }
}

const out = {};
for (const source of SOURCES) {
  for (const file of walk(path.join(PUBLIC, source))) {
    const key = `/${path.relative(PUBLIC, file).split(path.sep).join("/")}`;
    const buffer = await sharp(file).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    out[key] = `data:image/webp;base64,${buffer.toString("base64")}`;
  }
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 1)}\n`);
const bytes = Object.values(sorted).reduce((n, v) => n + v.length, 0);
console.log(
  `${Object.keys(sorted).length} placeholders, ${Math.round(bytes / 1024)}KB → ${path.relative(root, OUT)}`,
);
