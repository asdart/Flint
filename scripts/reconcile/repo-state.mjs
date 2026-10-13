// What the repo looked like at the commit the snapshot matched (manifest repoCommit) and what it
// looks like now (committed + uncommitted), for the three-way compare of scripts/webflow-reconcile.mjs:
// git helpers, the repo's CSS as Webflow style properties (through scripts/webflow-style-actions.mjs,
// the mapping webflow-diff.mjs uses), tokens.css, and a line locator for CSS declarations.
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./paths.mjs";

export const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

export function git(args, { allowFail = true } = {}) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

export const commitReachable = (c) => git(["cat-file", "-e", `${c}^{commit}`]) !== null;
export const showFile = (commit, rel) => git(["show", `${commit}:${rel}`]);
export const readNow = (rel) => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
};

/** Files under `specs` (pathspecs) that differ between `commit` and the working tree, untracked included. */
export function changedSince(commit, specs) {
  const out = new Set();
  for (const f of (git(["diff", "--name-only", commit, "--", ...specs]) ?? "").split("\n")) if (f) out.add(f);
  for (const f of (git(["ls-files", "--others", "--exclude-standard", "--", ...specs]) ?? "").split("\n")) if (f) out.add(f);
  return [...out].sort();
}

/** Extracts `specs` of `commit` into a fresh scratch folder (git archive | tar). Returns the folder. */
export function exportCommit(commit, specs) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flint-reconcile-repo-"));
  const tar = execFileSync("git", ["archive", commit, "--", ...specs], { cwd: ROOT, maxBuffer: 1 << 28 });
  const r = spawnSync("tar", ["-x", "-C", dir], { input: tar });
  if (r.status !== 0) throw new Error(`tar failed: ${r.stderr}`);
  return dir;
}

// ---- CSS as Webflow properties ----------------------------------------------------------------

/** Same normalisation as scripts/webflow-diff.mjs, so a repo value and a snapshot value compare equal. */
export function normalizeValue(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*([*/])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .replace(/(^|[\s(,])0px\b/g, "$10")
    .trim();
}

const TAG_NAMES = new Set(["body", "h1", "h2", "h3", "h4", "p", "a", "blockquote", "img", "figure"]);
export const flatKey = (sel, bp, pseudo, prop) => [sel, bp, pseudo, prop].join("\u0000");

export function styleFiles(root) {
  const s = path.join(root, "src/styles");
  const comps = fs.existsSync(path.join(s, "components")) ? fs.readdirSync(path.join(s, "components")).filter((f) => f.endsWith(".css")).sort() : [];
  return [...["base.css", "layout.css", "typography.css", "utilities.css"].filter((f) => fs.existsSync(path.join(s, f))), ...comps.map((f) => `components/${f}`)].map((f) => `src/styles/${f}`);
}

/**
 * The repo's CSS under `root` (a checkout or an exported commit) as a Map of flatKey -> normalised value,
 * through that checkout's own scripts/webflow-style-actions.mjs. `varNames` maps a variable id to its name.
 */
export function repoStyles(root, varNames) {
  const files = styleFiles(root);
  const out = execFileSync("node", [path.join(root, "scripts/webflow-style-actions.mjs"), "--tags", "--pending-tokens", ...files], { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
  const flat = new Map();
  for (const { update_style: u } of JSON.parse(out)) {
    const sel = TAG_NAMES.has(u.style_name) && !u.parent_style_names ? u.style_name : `.${[...(u.parent_style_names ?? []), u.style_name].join(".")}`;
    for (const p of u.properties) {
      const v = p.pending_token ? `var(${p.pending_token})` : p.variable_as_value ? `var(${varNames[p.variable_as_value] ?? p.variable_as_value})` : normalizeValue(p.property_value);
      flat.set(flatKey(sel, u.breakpoint_id, u.pseudo ?? "noPseudo", p.property_name), v);
    }
  }
  return flat;
}

/** A snapshot style line as a Map of flatKey -> normalised value (Webflow side). */
export function snapshotStyles(styles) {
  const flat = new Map();
  const put = (sel, bp, pseudo, props) => {
    const p = { ...props };
    // Webflow keeps `overflow` as one property when x and y are equal; the repo has the longhands.
    if ("overflow" in p && !("overflow-x" in p) && !("overflow-y" in p)) {
      p["overflow-x"] = p.overflow;
      p["overflow-y"] = p.overflow;
      delete p.overflow;
    }
    for (const [k, v] of Object.entries(p)) flat.set(flatKey(sel, bp, pseudo, k), normalizeValue(v));
  };
  for (const s of styles) {
    for (const [pseudo, props] of Object.entries(s.base ?? {})) put(s.sel, "main", pseudo, props);
    for (const [bp, ps] of Object.entries(s.bp ?? {})) for (const [pseudo, props] of Object.entries(ps)) put(s.sel, bp, pseudo, props);
  }
  return flat;
}

// Values Webflow adds by itself (to every grid). Not drift.
export const WEBFLOW_DEFAULTS = { "grid-template-rows": "auto", "grid-auto-columns": "1fr", "grid-template-columns": "1fr" };

/** The repo value Webflow's `overflow` (x equal to y) stands for. */
export function repoValue(flat, sel, bp, pseudo, prop) {
  if (prop === "overflow") {
    const x = flat.get(flatKey(sel, bp, pseudo, "overflow-x"));
    return x !== undefined && x === flat.get(flatKey(sel, bp, pseudo, "overflow-y")) ? x : flat.get(flatKey(sel, bp, pseudo, "overflow"));
  }
  return flat.get(flatKey(sel, bp, pseudo, prop));
}

// ---- tokens -----------------------------------------------------------------------------------

export function parseTokens(text) {
  const out = new Map();
  if (!text) return out;
  const lines = text.split("\n");
  lines.forEach((l, i) => {
    const m = /^\s*--([a-z0-9-]+):\s*([^;]+);/.exec(l);
    if (m) out.set(m[1], { value: m[2].trim(), line: i + 1 });
  });
  return out;
}

/** Webflow variable name -> the CSS custom property name the repo uses (a dot is spelled with a hyphen). */
export const tokenName = (name) => name.replace(/\./g, "-");

/** A comparable string for a token value, from the repo's CSS or from a Webflow variable ({value, unit} / string). */
export function canonToken(type, v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "object" && "value" in v) return `${v.value}${v.unit ?? ""}`;
  const s = String(v).trim();
  if (type === "FontFamily") return s.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (type === "Size") return s.replace(/\s+/g, "").replace(/^(-?\d*\.?\d+?)0*(px|rem|em|%|vh|vw)?$/, "$1$2");
  return s.replace(/\s+/g, "").toLowerCase();
}

// ---- CSS line locator -------------------------------------------------------------------------

const BP = { "991px": "medium", "767px": "small", "479px": "tiny" };
const PSEUDOS = ["hover", "active", "focus-visible", "focus-within", "focus", "placeholder", "before", "after", "first-child", "last-child", "nth-child(odd)", "nth-child(even)"];

/** Splits `.a.b:hover` into the Webflow style chain and pseudo-state (null for a rule we cannot place). */
export function splitSelector(selector) {
  const t = selector.trim();
  if (t.includes(":where(")) {
    const m = t.match(/^:where\(\.fk-page\)(?:\s+:where\(([^)]*)\))?$/);
    return m ? { tags: m[1] ? m[1].split(",").map((x) => x.trim()) : ["body"] } : null;
  }
  const pseudo = PSEUDOS.find((p) => t.endsWith(`:${p}`) || t.endsWith(`::${p}`));
  const bare = pseudo ? t.replace(new RegExp(`::?${pseudo.replace(/[()]/g, "\\$&")}$`), "") : t;
  if (!/^(\.[a-z0-9-]+)+$/.test(bare)) return null;
  return { sel: bare, pseudo: pseudo ?? "noPseudo" };
}

const parsedCss = new Map();
/** Rules of one CSS file with the line of every declaration: [{ sel|tags, pseudo, bp, line, decls: [{ name, line }] }]. */
export function parseCssRules(rel) {
  if (parsedCss.has(rel)) return parsedCss.get(rel);
  const raw = readNow(rel) ?? "";
  // Blank the comments but keep newlines, so line numbers stay.
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const rules = [];
  let bp = "main";
  let depth = 0;
  let mediaDepth = -1;
  let buf = "";
  let line = 1;
  let bufLine = 1;
  let bodyLine = 1;
  let inRule = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") line++;
    if (ch === "{") {
      const head = buf.trim();
      const media = /^@media screen and \(max-width: (\d+px)\)$/.exec(head);
      if (media && depth === 0) {
        bp = BP[media[1]] ?? "main";
        mediaDepth = depth;
      } else if (head.startsWith("@")) inRule = { skip: true };
      else {
        inRule = { selector: head, line: bufLine, bp, decls: [] };
      }
      depth++;
      buf = "";
      bodyLine = line;
    } else if (ch === "}") {
      if (inRule && !inRule.skip) {
        const decls = parseDecls(buf, bodyLine);
        inRule.decls = decls;
        rules.push(inRule);
      }
      depth--;
      if (depth === mediaDepth) {
        bp = "main";
        mediaDepth = -1;
      }
      inRule = null;
      buf = "";
      bufLine = line;
    } else {
      if (!buf.trim() && !/\s/.test(ch)) bufLine = line;
      buf += ch;
    }
  }
  const out = [];
  for (const r of rules)
    for (const part of r.selector.split(",")) {
      const sp = splitSelector(part);
      if (sp) out.push({ ...sp, bp: r.bp, line: r.line, decls: r.decls, selector: part.trim() });
    }
  parsedCss.set(rel, out);
  return out;
}

function parseDecls(body, startLine) {
  const decls = [];
  let line = startLine;
  for (const chunk of body.split(";")) {
    const lead = chunk.match(/^\s*/)[0];
    const l = line + (lead.match(/\n/g)?.length ?? 0);
    const name = chunk.slice(0, chunk.indexOf(":")).trim();
    if (name && chunk.includes(":")) decls.push({ name, line: l, value: chunk.slice(chunk.indexOf(":") + 1).trim() });
    line += chunk.match(/\n/g)?.length ?? 0;
  }
  return decls;
}

// Shorthand -> longhands Webflow stores (enough to tell that a declaration covers a property).
const COVERS = (decl, prop) => {
  if (decl === prop) return true;
  const side = (p) => ["top", "right", "bottom", "left"].map((s) => `${p}-${s}`);
  const table = {
    padding: side("padding"), margin: side("margin"), "padding-inline": ["padding-left", "padding-right"], "padding-block": ["padding-top", "padding-bottom"],
    "margin-inline": ["margin-inline-start", "margin-inline-end"], gap: ["grid-row-gap", "grid-column-gap"], inset: ["top", "right", "bottom", "left"],
    "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"], overflow: ["overflow-x", "overflow-y"],
    border: ["top", "right", "bottom", "left"].flatMap((s) => ["width", "style", "color"].map((k) => `border-${s}-${k}`)), flex: ["flex-grow", "flex-shrink", "flex-basis"],
    "grid-area": ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"],
    "border-color": side("border").map((x) => `${x}-color`), "border-width": side("border").map((x) => `${x}-width`), "border-style": side("border").map((x) => `${x}-style`),
  };
  return (table[decl] ?? []).includes(prop);
};

/**
 * Finds the declaration that sets `prop` of the style `sel` (".a.b" or a tag) at `bp` / `pseudo` in src/styles.
 * Returns { file, line, decl, shorthand, rule: line } or { rule: {file, line} } when only the rule exists, or null.
 */
export function locateCss(rootRel, sel, bp, pseudo, prop) {
  let ruleOnly = null;
  for (const rel of rootRel) {
    for (const r of parseCssRules(rel)) {
      const same = r.tags ? r.tags.includes(sel) && bp === r.bp && pseudo === "noPseudo" : r.sel === sel && r.pseudo === pseudo && r.bp === bp;
      if (!same) continue;
      ruleOnly ??= { rule: { file: rel, line: r.line } };
      const d = r.decls.filter((x) => COVERS(x.name, prop)).at(-1);
      if (d) return { file: rel, line: d.line, decl: d.name, shorthand: d.name !== prop, value: d.value, rule: { file: rel, line: r.line } };
    }
  }
  return ruleOnly;
}

/** Where a brand-new class goes: the component CSS file of its family (classes.md), else layout/typography/utilities. */
export function familyFile(selector, files) {
  const cls = selector.replace(/^\./, "").split(".")[0];
  const comps = files.filter((f) => f.includes("/components/")).map((f) => [path.basename(f, ".css"), f]);
  const hit = comps.filter(([b]) => cls === `fk-${b}` || cls.startsWith(`fk-${b}-`)).sort((a, b) => b[0].length - a[0].length)[0];
  if (hit) return { file: hit[1], generated: false };
  // A new element of an existing family (`fk-input-container` beside input-field.css): the longest shared word prefix.
  const words = cls.replace(/^fk-/, "").split("-");
  for (let k = words.length; k >= 1; k--) {
    const prefix = words.slice(0, k).join("-");
    const near = comps.find(([b]) => b === prefix || b.startsWith(`${prefix}-`));
    if (near) return { file: near[1], generated: false };
  }
  if (/^fk-(page|section|panel|container|panel-content)\b/.test(cls)) return { file: "src/styles/layout.css", generated: false };
  if (/^fk-(heading|text|eyebrow)\b/.test(cls)) return { file: "src/styles/typography.css", generated: false };
  return { file: null, generated: false };
}
