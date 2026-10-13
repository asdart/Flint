// Mechanical edits for scripts/webflow-reconcile-apply.mjs: pure text functions (a string in, a string out, or a
// reason why the edit is not safe) plus a Workspace that holds the files in memory until they are written.
// Every function checks that the old value is still where the report says it is (the guard) and refuses
// anything it cannot do with certainty; the caller turns a refusal into a task for the agent.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const ok = (value, extra = {}) => ({ ok: true, value, ...extra });
const no = (reason) => ({ ok: false, reason });

// ---- the workspace -------------------------------------------------------------------------------

export class Workspace {
  constructor(root) {
    this.root = root;
    this.texts = new Map();
    this.orig = new Map();
  }

  read(rel) {
    if (this.texts.has(rel)) return this.texts.get(rel);
    const abs = path.join(this.root, rel);
    if (!fs.existsSync(abs)) return null;
    const text = fs.readFileSync(abs, "utf8");
    this.texts.set(rel, text);
    this.orig.set(rel, text);
    return text;
  }

  write(rel, text) {
    if (!this.orig.has(rel)) this.orig.set(rel, this.read(rel) ?? "");
    this.texts.set(rel, text);
  }

  changed() {
    return [...this.texts.keys()].filter((rel) => this.texts.get(rel) !== (this.orig.get(rel) ?? "")).sort();
  }

  flush() {
    for (const rel of this.changed()) fs.writeFileSync(path.join(this.root, rel), this.texts.get(rel));
  }

  /** `diff -u` of every changed file, for --dry-run. */
  diff() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flint-apply-diff-"));
    const out = [];
    try {
      for (const rel of this.changed()) {
        const a = path.join(dir, "a");
        const b = path.join(dir, "b");
        fs.writeFileSync(a, this.orig.get(rel) ?? "");
        fs.writeFileSync(b, this.texts.get(rel));
        try {
          execFileSync("diff", ["-u", "--label", `a/${rel}`, "--label", `b/${rel}`, a, b], { encoding: "utf8" });
        } catch (e) {
          out.push(e.stdout ?? "");
        }
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return out.join("");
  }
}

// ---- strings in source files -----------------------------------------------------------------------

// Ways a string can be spelled in JSX text, a JSX attribute or a JS string.
const VARIANTS = [
  { name: "plain", enc: (s) => s },
  { name: "apos", enc: (s) => s.replace(/'/g, "&apos;"), aposEntity: true },
  { name: "apos39", enc: (s) => s.replace(/'/g, "&#39;"), aposEntity: true },
  { name: "bsapos", enc: (s) => s.replace(/'/g, "\\'") },
  { name: "bsquote", enc: (s) => s.replace(/"/g, '\\"') },
  { name: "quot", enc: (s) => s.replace(/"/g, "&quot;") },
  { name: "ent", enc: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") },
];

/**
 * Replaces the string `old` on one source line by `neu`, spelled the way the context needs it.
 * `attr`: only inside the value of that attribute (`label="…"`, `alt={"…"}`). `json`: the file is JSON.
 * Refuses when `old` is not on the line exactly once.
 */
export function replaceInLine(line, old, neu, { attr = null, json = false } = {}) {
  if (!old) return no("the old value is empty");
  const hits = new Map();
  for (const v of VARIANTS) {
    const raw = v.enc(old);
    if (!raw) continue;
    let from = 0;
    for (;;) {
      const idx = line.indexOf(raw, from);
      if (idx < 0) break;
      from = idx + 1;
      const before = line.slice(0, idx);
      if (attr && !new RegExp(`(?<![\\w-])${esc(attr)}\\s*=\\s*\\{?\\s*["']$`).test(before)) continue;
      if (!hits.has(idx)) hits.set(idx, { idx, raw, v });
    }
  }
  if (hits.size === 0) return no(attr ? `\`${attr}="${old}"\` is not on this line` : "the old text is not on this line (it may span lines or be spelled differently)");
  if (hits.size > 1) return no(`the old ${attr ? "attribute value" : "text"} appears ${hits.size} times on this line`);
  const { idx, raw, v } = [...hits.values()][0];
  const before = line[idx - 1];
  const after = line[idx + raw.length];
  const quote = before === after && ['"', "'", "`"].includes(before) ? before : null;
  let enc;
  if (json) {
    if (quote !== '"') return no("not a JSON string");
    enc = JSON.stringify(neu).slice(1, -1);
  } else if (quote === "`") {
    if (/[`\\]|\$\{/.test(neu) || /\n/.test(neu)) return no("the new text has characters that need escaping in a template string");
    enc = neu;
  } else if (quote) {
    if (/\n/.test(neu)) return no("the new text has a line break");
    const inAttr = new RegExp(`=\\s*\\{?\\s*$`).test(line.slice(0, idx - 1));
    if (inAttr) enc = neu.replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replaceAll(quote, quote === '"' ? "&quot;" : "&apos;");
    else enc = neu.replace(/\\/g, "\\\\").replaceAll(quote, `\\${quote}`);
    if (v.aposEntity && quote !== "'") enc = enc.replace(/'/g, v.name === "apos39" ? "&#39;" : "&apos;");
  } else {
    // JSX text.
    if (/[{}<>]/.test(neu) || /\n/.test(neu)) return no("the new text has { } < > or a line break, which JSX text can't hold as is");
    enc = neu.replace(/&(?![a-z#0-9]+;)/gi, "&amp;");
    if (v.aposEntity) enc = enc.replace(/'/g, v.name === "apos39" ? "&#39;" : "&apos;");
  }
  return ok(line.slice(0, idx) + enc + line.slice(idx + raw.length));
}

/** Replaces a text on line `lineNo` of `text`; returns the new file text. */
export function replaceText(text, lineNo, old, neu, opts = {}) {
  const lines = text.split("\n");
  if (!lines[lineNo - 1] && lines[lineNo - 1] !== "") return no(`line ${lineNo} does not exist`);
  const r = replaceInLine(lines[lineNo - 1], old, neu, opts);
  if (!r.ok) return no(`${r.reason} (line ${lineNo})`);
  lines[lineNo - 1] = r.value;
  return ok(lines.join("\n"));
}

/** Swaps one class token for another on a line (`className="a b"`, a utility list, a variant map). */
export function replaceClass(text, lineNo, remove, add) {
  const lines = text.split("\n");
  const l = lines[lineNo - 1];
  if (l === undefined) return no(`line ${lineNo} does not exist`);
  const re = new RegExp(`(^|[^a-z0-9_-])${esc(remove)}(?![a-z0-9_-])`, "g");
  const n = (l.match(re) ?? []).length;
  if (n === 0) return no(`class \`${remove}\` is not on line ${lineNo}`);
  if (n > 1) return no(`class \`${remove}\` appears ${n} times on line ${lineNo}`);
  if (new RegExp(`(^|[^a-z0-9_-])${esc(add)}(?![a-z0-9_-])`).test(l)) return no(`class \`${add}\` is already on line ${lineNo}`);
  lines[lineNo - 1] = l.replace(re, (_, p) => `${p}${add}`);
  return ok(lines.join("\n"));
}

// ---- CSS ---------------------------------------------------------------------------------------------

export const normCssValue = (value) =>
  String(value)
    .toLowerCase()
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*([*/])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .replace(/(^|[\s(,])0px\b/g, "$10")
    .trim();

/** A Webflow value (`var(space-2)`) as the repo writes it (`var(--space-2)`; a dot in a variable name is a hyphen). */
export const cssFromWebflow = (v) => (v === null || v === undefined ? v : String(v).replace(/var\((?:--)?([^),]+)\)/g, (_, n) => `var(--${n.trim().replace(/\./g, "-")})`));

const DECL = /^(\s*)([a-z-]+)\s*:\s*(.*?)\s*;(\s*\/\*.*\*\/)?\s*$/;

export function setDeclaration(text, { line, decl, old, neu }) {
  const lines = text.split("\n");
  const m = DECL.exec(lines[line - 1] ?? "");
  if (!m || m[2] !== decl) return no(`line ${line} is not a one-line \`${decl}\` declaration now`);
  if (normCssValue(m[3]) !== normCssValue(old)) return no(`\`${decl}\` is \`${m[3]}\` at line ${line}, the report expected \`${old}\``);
  lines[line - 1] = `${m[1]}${decl}: ${neu};${m[4] ?? ""}`;
  return ok(lines.join("\n"));
}

export function removeDeclaration(text, { line, decl, old }) {
  const lines = text.split("\n");
  const m = DECL.exec(lines[line - 1] ?? "");
  if (!m || m[2] !== decl) return no(`line ${line} is not a one-line \`${decl}\` declaration now`);
  if (normCssValue(m[3]) !== normCssValue(old)) return no(`\`${decl}\` is \`${m[3]}\` at line ${line}, the report expected \`${old}\``);
  lines.splice(line - 1, 1);
  const prev = lines.slice(0, line - 1).reverse().find((l) => l.trim());
  const next = lines.slice(line - 1).find((l) => l.trim());
  const empty = prev?.trim().endsWith("{") && next?.trim().startsWith("}");
  return ok(lines.join("\n"), empty ? { followUp: `the rule around \`${decl}\` (line ${line - 1}) has no declaration left: remove the empty rule` } : {});
}

/** Appends `decl: value;` to the rule whose selector starts at `line` (one selector, a body on its own lines). */
export function addDeclaration(text, { line, selector, decl, neu }) {
  const lines = text.split("\n");
  let open = -1;
  for (let i = line - 1; i < Math.min(lines.length, line + 5); i++) {
    if (lines[i].includes("{")) {
      open = i;
      break;
    }
  }
  if (open < 0) return no(`no rule body found at line ${line}`);
  const head = lines.slice(line - 1, open + 1).join(" ").replace(/\{.*$/, "").replace(/\s+/g, "");
  if (head.includes(",")) return no(`the rule at line ${line} serves several selectors (\`${head}\`): adding a declaration would change the others`);
  if (!head.startsWith(selector.replace(/\s+/g, "")) || !/^(::?[a-z-]+(\([a-z0-9+]*\))?)?$/.test(head.slice(selector.length))) return no(`the rule at line ${line} is \`${head}\`, not \`${selector}\``);
  if (/\}/.test(lines[open].slice(lines[open].indexOf("{")))) return no(`the rule at line ${line} is written on one line`);
  let close = -1;
  for (let i = open + 1; i < lines.length; i++) {
    if (/^\s*\}/.test(lines[i])) {
      close = i;
      break;
    }
    if (lines[i].includes("{")) return no(`the rule at line ${line} has a nested block`);
  }
  if (close < 0) return no(`the rule at line ${line} is never closed`);
  const body = lines.slice(open + 1, close);
  if (body.some((l) => new RegExp(`^\\s*${esc(decl)}\\s*:`).test(l))) return no(`the rule at line ${line} already sets \`${decl}\``);
  const last = [...body].reverse().find((l) => DECL.test(l));
  const indent = last ? /^\s*/.exec(last)[0] : `${/^\s*/.exec(lines[line - 1])[0]}  `;
  lines.splice(close, 0, `${indent}${decl}: ${neu};`);
  return ok(lines.join("\n"), { at: close + 1 });
}

const PSEUDO_CSS = { noPseudo: "", hover: ":hover", active: ":active", focus: ":focus", "focus-visible": ":focus-visible", "focus-within": ":focus-within", placeholder: "::placeholder", before: "::before", after: "::after", "first-child": ":first-child", "last-child": ":last-child", "nth-child(odd)": ":nth-child(odd)", "nth-child(even)": ":nth-child(even)" };
const BP_CSS = { medium: 991, small: 767, tiny: 479 };

/** A new rule (or a rule per state and breakpoint) for `selector`, appended to the end of the file. */
export function addRules(text, { selector, properties, skip = () => false }) {
  if (!/^(\.[a-z0-9-]+)+$/.test(selector)) return no(`\`${selector}\` is not a plain class chain`);
  const groups = new Map();
  for (const p of properties) {
    if (skip(p)) continue;
    if (!(p.pseudo in PSEUDO_CSS)) return no(`the state \`${p.pseudo}\` has no CSS spelling here`);
    if (p.bp !== "main" && !(p.bp in BP_CSS)) return no(`the breakpoint \`${p.bp}\` is not one of Webflow's four`);
    const key = `${p.bp}\u0000${p.pseudo}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  if (!groups.size) return no("no property to write");
  const order = (k) => {
    const [bp, pseudo] = k.split("\u0000");
    return [bp === "main" ? 0 : 1 + Object.keys(BP_CSS).indexOf(bp), pseudo === "noPseudo" ? "" : pseudo];
  };
  const keys = [...groups.keys()].sort((a, b) => {
    const [ba, pa] = order(a);
    const [bb, pb] = order(b);
    return ba - bb || (pa < pb ? -1 : pa > pb ? 1 : 0);
  });
  const blocks = [];
  let currentBp = null;
  for (const k of keys) {
    const [bp, pseudo] = k.split("\u0000");
    const inner = bp === "main" ? "" : "  ";
    const rule = [`${inner}${selector}${PSEUDO_CSS[pseudo]} {`, ...groups.get(k).map((p) => `${inner}  ${p.prop}: ${p.value};`), `${inner}}`];
    if (bp === "main") blocks.push(rule.join("\n"));
    else if (bp === currentBp) blocks[blocks.length - 1] = blocks.at(-1).replace(/\n\}$/, `\n\n${rule.join("\n")}\n}`);
    else blocks.push(`@media screen and (max-width: ${BP_CSS[bp]}px) {\n${rule.join("\n")}\n}`);
    currentBp = bp === "main" ? null : bp;
  }
  return ok(`${text.replace(/\n*$/, "\n")}\n${blocks.join("\n\n")}\n`);
}

// ---- tokens -------------------------------------------------------------------------------------------

export function setToken(text, { name, old, neu }) {
  const re = new RegExp(`^(\\s*--${esc(name)}\\s*:\\s*)([^;]+)(;.*)$`, "m");
  const m = re.exec(text);
  if (!m) return no(`--${name} is not in tokens.css`);
  if (old !== null && old !== undefined && m[2].trim().replace(/\s+/g, "").toLowerCase() !== String(old).trim().replace(/\s+/g, "").toLowerCase()) return no(`--${name} is \`${m[2].trim()}\` now, the report expected \`${old}\``);
  return ok(text.replace(re, `$1${neu}$3`));
}

export function addToken(text, { name, neu }) {
  if (new RegExp(`^\\s*--${esc(name)}\\s*:`, "m").test(text)) return no(`--${name} is already in tokens.css`);
  const lines = text.split("\n");
  const prefix = name.split("-")[0];
  let at = -1;
  lines.forEach((l, i) => {
    if (new RegExp(`^\\s*--${esc(prefix)}-`).test(l)) at = i;
  });
  if (at < 0) return no(`no \`--${prefix}-*\` group in tokens.css to put it in`);
  // Keep a numeric scale in order: after the last token of the group whose number is not above the new one.
  const num = (n) => Number(n.slice(prefix.length + 1).replace(/-/g, "."));
  if (Number.isFinite(num(name))) {
    let best = -1;
    lines.forEach((l, i) => {
      const m = new RegExp(`^\\s*--(${esc(prefix)}-[0-9][0-9-]*)\\s*:`).exec(l);
      if (m && Number.isFinite(num(m[1])) && num(m[1]) <= num(name)) best = i;
    });
    if (best >= 0) at = best;
  }
  const indent = /^\s*/.exec(lines[at])[0];
  lines.splice(at + 1, 0, `${indent}--${name}: ${neu};`);
  return ok(lines.join("\n"));
}

/** Updates the value cell of the `tokens.md` row of a token. Returns { ok:false } when no row has the old value. */
export function setTokenDoc(text, { name, old, neu }) {
  const lines = text.split("\n");
  const flat = (s) => s.replace(/[`\s]/g, "").toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].split("|");
    const idx = cells.findIndex((c) => c.trim() === `\`${name}\``);
    if (idx < 0 || !lines[i].startsWith("|")) continue;
    const value = cells[idx + 1];
    if (value === undefined || flat(value) !== flat(old)) continue;
    const ticks = value.includes("`") ? "`" : "";
    cells[idx + 1] = ` ${ticks}${neu}${ticks} `;
    lines[i] = cells.join("|");
    return ok(lines.join("\n"), { line: i + 1 });
  }
  return no(`no row of tokens.md has \`${name}\` with the value ${old}`);
}
