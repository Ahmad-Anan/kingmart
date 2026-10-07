// Generates the responsive hero-slider images served by the home page.
//
// Usage:
//   node scripts/optimize-slider-images.mjs
//
// Reads the original PNGs from assets-src/img-slider/ (kept out of public/ so they never ship)
// and writes `<name>-<width>.webp` into public/assets/images/img-slider/.
//
// WebP only (no AVIF <picture> source): the slide-0 <img> is `priority`, so the prerendered HTML
// gets a <link rel="preload"> for its WebP srcset — an AVIF <source> would make the browser
// download the hero twice. AVIF only saved ~10 KB per image here.
//
// The widths must stay in sync with SLIDER_WIDTHS in
// src/app/features/home/slider/slider-image.ts (the srcset the slider asks for).
//
// Why these widths: the hero is full-bleed with `object-fit: cover`, 340–560px tall, and the
// originals are ~1.83:1 (≈1400×768). On a phone the image is height-bound (~620 CSS px wide),
// so a 1.75–3x DPR phone wants ~1100–1900px; desktop is width-bound and tops out at the
// original's ~1376px, which is the largest size we produce (no upscaling).

import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'assets-src/img-slider');
const OUT_DIR = path.join(ROOT, 'public/assets/images/img-slider');

const WIDTHS = [640, 960, 1280, 1376];
const WEBP = { quality: 72, effort: 6 };

await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png'));
let total = 0;

for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(SRC_DIR, file);

  for (const width of WIDTHS) {
    const out = path.join(OUT_DIR, `${name}-${width}.webp`);
    await sharp(input).resize({ width, withoutEnlargement: true }).webp(WEBP).toFile(out);

    const { size } = await stat(out);
    total += size;
    console.log(`${name}-${width}.webp: ${(size / 1024).toFixed(0)} KB`);
  }
}

console.log(`\n${files.length} images → ${(total / 1024 / 1024).toFixed(2)} MB total on disk`);
