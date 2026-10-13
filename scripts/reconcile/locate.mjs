// Finds the source line of a string in a repo file (JSX text, a prop string, an array literal, a
// JSON value), tolerant of JSX line wrapping and entities.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.mjs";

const files = new Map();
const ENT = [
  [/&apos;|&#39;|\\'/g, "'"], [/&quot;|\\"/g, '"'], [/&rsquo;/g, "’"], [/&lsquo;/g, "‘"], [/&ldquo;/g, "“"],
  [/&rdquo;/g, "”"], [/&mdash;/g, "—"], [/&ndash;/g, "–"], [/&nbsp;/g, " "], [/&hellip;/g, "…"],
  [/&lt;/g, "<"], [/&gt;/g, ">"], [/&amp;/g, "&"], [/\{" "\}/g, " "], [/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))],
];

/** Source text with entities and string escapes decoded line by line, so line numbers are unchanged. */
function source(rel) {
  if (files.has(rel)) return files.get(rel);
  let info = null;
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    const lines = fs.readFileSync(abs, "utf8").split("\n").map((l) => ENT.reduce((s, [re, to]) => s.replace(re, to), l));
    const starts = [];
    let off = 0;
    for (const l of lines) {
      starts.push(off);
      off += l.length + 1;
    }
    info = { text: lines.join("\n"), starts, lines };
  }
  files.set(rel, info);
  return info;
}

const lineOf = (info, index) => {
  let lo = 0;
  let hi = info.starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (info.starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const pattern = (words) => new RegExp(words.map(esc).join("\\s+"), "g");

/** Lines (1-based) where `str` starts in `rel`; `partial` when only its first or last words matched. */
export function findString(rel, str) {
  const info = source(rel);
  const words = str.split(/\s+/).filter(Boolean);
  if (!info || words.length === 0) return { lines: [] };
  const run = (w) => [...info.text.matchAll(pattern(w))].map((m) => lineOf(info, m.index));
  const full = run(words);
  if (full.length) return { lines: full };
  if (words.length >= 4) {
    const head = run(words.slice(0, Math.min(5, words.length - 1)));
    if (head.length) return { lines: head, partial: true };
    const tail = run(words.slice(-Math.min(5, words.length - 1)));
    if (tail.length) return { lines: tail, partial: true };
  }
  return { lines: [] };
}

/** First line at or after `from` (default 1) within `span` lines where `re` matches in `rel`. */
export function findPattern(rel, re, from = 1, span = 60) {
  const info = source(rel);
  if (!info) return null;
  for (let i = from - 1; i < Math.min(info.lines.length, from - 1 + span); i++) if (re.test(info.lines[i])) return i + 1;
  return null;
}

let srcFiles = null;
export function allSourceFiles() {
  if (srcFiles) return srcFiles;
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (/\.(tsx?|json)$/.test(e.name)) out.push(rel);
    }
  };
  walk("src");
  srcFiles = out.sort();
  return srcFiles;
}

/** Component name → repo file (the repo names a file like its component). */
export function componentFile(name) {
  const hit = allSourceFiles().filter((f) => /^src\/(components\/(global|ui)|sections)\//.test(f) && path.basename(f).replace(/\.tsx$/, "") === name);
  return hit[0] ?? null;
}

/**
 * Picks the hit to use: the first at or after `anchor`, else the closest before it. Returns the
 * location fields for a map entry.
 */
export function pick(file, found, anchor) {
  const { lines, partial } = found;
  let idx = 0;
  if (anchor) {
    const after = lines.findIndex((l) => l >= anchor);
    idx = after >= 0 ? after : lines.length - 1;
  }
  const loc = { file, line: lines[idx], locate: partial ? "partial" : "literal" };
  if (lines.length > 1) {
    loc.occ = idx + 1;
    loc.of = lines.length;
    loc.alts = lines.filter((_, i) => i !== idx).slice(0, 6);
  }
  return loc;
}
