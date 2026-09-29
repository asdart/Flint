#!/usr/bin/env node
// Converts PNG/JPG images to WebP next to the source file (seo.md S-10: served as WebP, exported at
// 2x the largest rendered size). Keeps transparency. Never enlarges and never deletes the source.
// Prints the output size: use it for the <img> width and height attributes.
// Usage: node scripts/to-webp.mjs <files...> [--width 1254] [--quality 85] [--lossless]
//   --width    output width in px (height follows the ratio): 2x the largest rendered width across
//              breakpoints (for object-fit: cover, the width the crop needs). Default: source size
//   --quality  lossy quality 1-100. Default 85
//   --lossless always lossless. Without it, each file is also encoded lossless and that version wins
//              when it is at most 10% larger than the lossy one (flat art: logos, icons, UI shapes)
// Defaults measured on the homepage images (2026-09-28, PSNR against the resized source):
// q85 + effort 6 + smart subsampling stays at 39-51 dB (visually lossless) and is 20-35% smaller
// than q90; q80 drops photos below 40 dB for ~10% less. alphaQuality 100 keeps cut-out edges clean.
// Example: node scripts/to-webp.mjs public/assets/home/webinar-call.png --width 1254
import { existsSync, statSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values, positionals: files } = parseArgs({
  allowPositionals: true,
  options: {
    width: { type: "string" },
    quality: { type: "string", default: "85" },
    lossless: { type: "boolean", default: false },
  },
});

if (files.length === 0) {
  console.error("Usage: node scripts/to-webp.mjs <files...> [--width N] [--quality N] [--lossless]");
  process.exit(1);
}

const width = values.width === undefined ? undefined : Number(values.width);
const quality = Number(values.quality);
if ((width !== undefined && !(width > 0)) || !(quality >= 1 && quality <= 100)) {
  console.error("--width must be a positive number and --quality between 1 and 100");
  process.exit(1);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let failed = false;
for (const file of files) {
  const extension = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(extension) || !existsSync(file)) {
    console.error(`skipped ${file}: not an existing .png/.jpg file`);
    failed = true;
    continue;
  }
  const target = `${file.slice(0, -extension.length)}.webp`;
  try {
    // autoOrient applies EXIF rotation (JPG); metadata is stripped and color converted to sRGB.
    const pipeline = () => sharp(file).autoOrient().resize({ width, withoutEnlargement: true });
    const lossless = () =>
      pipeline().webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true });
    let output;
    let mode = "lossless";
    if (values.lossless) {
      output = await lossless();
    } else {
      output = await pipeline()
        .webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });
      mode = `q${quality}`;
      const exact = await lossless();
      if (exact.info.size <= output.info.size * 1.1) [output, mode] = [exact, "lossless"];
    }
    // Write the encoded bytes as they are: sharp(...).toFile() would encode a second time.
    writeFileSync(target, output.data);
    const source = statSync(file).size;
    const warning = output.data.length > source ? " (larger than the source: check it)" : "";
    console.log(
      `${target} ${output.info.width}x${output.info.height} ${kb(output.data.length)} ${mode} (source ${kb(source)})${warning}`,
    );
  } catch (error) {
    console.error(`failed ${file}: ${error.message}`);
    failed = true;
  }
}
if (failed) process.exit(1);
