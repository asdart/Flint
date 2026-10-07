#!/usr/bin/env node
// Converts PNG/JPG/WebP images to WebP (seo.md S-10: served as WebP, exported at 2x the largest
// rendered size, capped at the source width). Keeps transparency. Never enlarges. A PNG/JPG writes
// the .webp next to it and keeps the source; a .webp input is rewritten in place, only after both
// encodes finished in memory. Prints the output size: use it for the <img> width and height attributes.
// Usage: node scripts/to-webp.mjs <files...> [--width 1254] [--height 104] [--quality 78] [--lossless]
//          [--psnr [--allow-below]] [--out path.webp] [--force-reencode]
//   --width    output width in px (height follows the ratio): 2x the largest rendered width across
//              breakpoints up to 1920px viewports (for object-fit: cover, the width the crop needs).
//              Default: source size. A .webp input must get a --width below its own width
//   --height   with --width: exact width x height centred cover crop (like CSS object-fit: cover)
//   --quality  lossy quality 1-100. Default 78 (retry at 85 when --psnr fails)
//   --lossless always lossless. Without it, each file is also encoded lossless and that version wins
//              when it is at most 10% larger than the lossy one (flat art: logos, icons, UI shapes)
//   --psnr     compare the output with the source resized the same way (lanczos3; with alpha, the
//              worse of the image flattened on white and on black). Prints "PSNR NN dB", warns and
//              exits 1 below 38 dB without writing, unless --allow-below (small images checked by eye)
//   --out      output path (one input only), e.g. a git-restored original written to its final name
//   --force-reencode  allow a same-width .webp re-encode (WebP-only sources). Lossy on lossy: keep
//              it only when --psnr passes
// Defaults measured on the repo's images (2026-10-06, PSNR against the resized source): q78 + effort
// 6 + smart subsampling gives 37-53 dB (about 41-44 dB for photos, 20-30% smaller than q85); tiny
// or very flat images dip lower, so those retry at q85. alphaQuality 100 keeps cut-out edges clean.
// Example: node scripts/to-webp.mjs public/assets/home/webinar-call.png --width 1254 --psnr
import { existsSync, statSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values, positionals: files } = parseArgs({
  allowPositionals: true,
  options: {
    width: { type: "string" },
    height: { type: "string" },
    quality: { type: "string", default: "78" },
    lossless: { type: "boolean", default: false },
    psnr: { type: "boolean", default: false },
    "allow-below": { type: "boolean", default: false },
    out: { type: "string" },
    "force-reencode": { type: "boolean", default: false },
  },
});

if (files.length === 0) {
  console.error("Usage: node scripts/to-webp.mjs <files...> [--width N] [--height N] [--quality N] [--lossless] [--psnr] [--out path] [--force-reencode]");
  process.exit(1);
}

const width = values.width === undefined ? undefined : Number(values.width);
const height = values.height === undefined ? undefined : Number(values.height);
const quality = Number(values.quality);
if (
  (height !== undefined && !(height > 0 && width > 0)) ||
  (values.out && files.length !== 1) ||
  (width !== undefined && !(width > 0)) || !(quality >= 1 && quality <= 100)) {
  console.error("--width must be a positive number, --height needs --width, --out takes one input, --quality is 1-100");
  process.exit(1);
}

// PSNR (dB) over RGB between two same-size RGBA buffers, flattened on a background (255 white, 0 black).
function psnrOn(a, b, background) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 4) {
    const alphaA = a[i + 3] / 255;
    const alphaB = b[i + 3] / 255;
    for (let c = 0; c < 3; c++) {
      const diff = a[i + c] * alphaA + background * (1 - alphaA) - (b[i + c] * alphaB + background * (1 - alphaB));
      sum += diff * diff;
    }
  }
  const mse = sum / ((a.length / 4) * 3);
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let failed = false;
for (const file of files) {
  const extension = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension) || !existsSync(file)) {
    console.error(`skipped ${file}: not an existing .png/.jpg/.webp file`);
    failed = true;
    continue;
  }
  const target = values.out ?? `${file.slice(0, -extension.length)}.webp`;
  try {
    if (extension === ".webp" && target === file) {
      const sourceWidth = (await sharp(file).metadata()).width;
      if (!values["force-reencode"] && !(width < sourceWidth)) {
        console.error(`skipped ${file}: a .webp input needs --width below ${sourceWidth} (or --force-reencode)`);
        failed = true;
        continue;
      }
    }
    // autoOrient applies EXIF rotation (JPG); metadata is stripped and color converted to sRGB.
    const pipeline = () =>
      sharp(file).autoOrient().resize({ width, height, fit: "cover", withoutEnlargement: true });
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
    let psnr = "";
    if (values.psnr) {
      const reference = await pipeline().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const decoded = await sharp(output.data).ensureAlpha().raw().toBuffer();
      const worst = Math.min(psnrOn(reference.data, decoded, 255), psnrOn(reference.data, decoded, 0));
      psnr = ` PSNR ${worst === Infinity ? "inf" : worst.toFixed(1)} dB`;
      if (worst < 38 && !values["allow-below"]) {
        console.error(`not written ${target}: ${output.info.width}x${output.info.height} ${mode}${psnr} is below 38 dB`);
        failed = true;
        continue;
      }
      if (worst < 38) console.warn(`warning: below 38 dB, check ${target} by eye`);
    }
    // Write the encoded bytes as they are: sharp(...).toFile() would encode a second time.
    const source = statSync(file).size;
    writeFileSync(target, output.data);
    const warning = output.data.length > source ? " (larger than the source: check it)" : "";
    console.log(
      `${target} ${output.info.width}x${output.info.height} ${kb(output.data.length)} ${mode}${psnr} (source ${kb(source)})${warning}`,
    );
  } catch (error) {
    console.error(`failed ${file}: ${error.message}`);
    failed = true;
  }
}
if (failed) process.exit(1);
