#!/usr/bin/env node
/**
 * Builds web-ready copies of the legacy media library so the platform never
 * depends on the slow legacy WordPress host at runtime.
 *
 *   node scripts/legacy/optimise-media.mjs
 *
 * Reads the originals downloaded by export-wordpress.mjs (data/legacy/media, gitignored)
 * and writes WebP versions, at most 1280px on the long edge, to public/media/legacy
 * at the same relative path plus ".webp". Idempotent: existing outputs are skipped.
 * When media moves to object storage, upload these files and change LEGACY_MEDIA_BASE.
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SOURCE = path.join(ROOT, "data/legacy/media");
const TARGET = path.join(ROOT, "public/media/legacy");
const MAX = 1280;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) yield full;
  }
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

let written = 0;
let skipped = 0;
let bytes = 0;
for await (const file of walk(SOURCE)) {
  // Keep the original extension (photo.jpg.webp) so names never collide and map back to their source.
  const rel = `${path.relative(SOURCE, file)}.webp`;
  const out = path.join(TARGET, rel);
  if (await exists(out)) {
    skipped++;
    continue;
  }
  await mkdir(path.dirname(out), { recursive: true });
  const info = await sharp(file)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74, effort: 5 })
    .toFile(out);
  written++;
  bytes += info.size;
}
console.log(`${written} written (${(bytes / 1e6).toFixed(1)} MB), ${skipped} already present`);
