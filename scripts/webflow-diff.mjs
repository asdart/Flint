#!/usr/bin/env node
// Compares repo CSS with what Webflow stores, property by property, so drift (Designer edits,
// stale Designer saves, old WHTML shorthands) shows up before a push. Input: a saved result of
// data_style_tool → get_styles { query: "all", include_properties: true, include_breakpoints:
// ["main","medium","small","tiny"], include_base_pseudos: [...] } — large results are written to a
// file by the MCP client, pass that path.
// Usage: node scripts/webflow-diff.mjs <get_styles-dump.json> <css files…> [--unregistered]
// Include src/styles/base.css to cover the tag styles (body, h1…h4, p, a, blockquote, img): its
// `:where(.fk-page)` rules are mapped to Webflow's tag selectors (see webflow-style-actions.mjs --tags).
// Exit code 1 when anything differs. Each line: selector @breakpoint:state property expected → actual.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const unregistered = args.includes("--unregistered");
const [dumpPath, ...files] = args.filter((arg) => arg !== "--unregistered");
if (!dumpPath || files.length === 0) {
  console.error("Usage: node scripts/webflow-diff.mjs <get_styles-dump.json> <css files…> [--unregistered]");
  process.exit(1);
}

let dump = JSON.parse(readFileSync(dumpPath, "utf8"));
// The MCP client saves large results as a JSON array of { type: "text", text: "<json>" } blocks: pick the
// block that holds the get_styles result ({ label, action, result: [...] }).
if (Array.isArray(dump) && dump.length && typeof dump[0]?.text === "string") {
  dump = dump.map((block) => { try { return JSON.parse(block.text); } catch { return null; } }).find((j) => Array.isArray(j?.result)) ?? dump;
}
const styles = dump.result ?? dump;
const ids = JSON.parse(readFileSync(new URL("../docs/webflow/webflow-ids.json", import.meta.url), "utf8"));
const variableNames = Object.fromEntries(Object.entries(ids.variables).map(([name, id]) => [id, name]));

const actions = JSON.parse(
  execFileSync("node", [new URL("./webflow-style-actions.mjs", import.meta.url).pathname, "--tags", "--pending-tokens", ...files], {
    encoding: "utf8",
  }),
);

// Values Webflow adds by itself (to every grid). Not drift.
const WEBFLOW_DEFAULTS = { "grid-template-rows": "auto", "grid-auto-columns": "1fr", "grid-template-columns": "1fr" };

const normalize = (value) => {
  if (value && typeof value === "object") return `var(${variableNames[value.id] ?? value.id})`;
  return String(value)
    .toLowerCase()
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*([*/])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .replace(/(^|[\s(,])0px\b/g, "$10")
    .trim();
};

const key = (selector, breakpoint, pseudo) => `${selector} @${breakpoint}:${pseudo}`;

// Tag styles come back from Webflow with the bare tag as selector (`h1`), classes with a dot.
const TAG_NAMES = new Set(["body", "h1", "h2", "h3", "h4", "p", "a", "blockquote", "img", "figure"]);
const expected = new Map();
// Tokens in tokens.css that aren't on Webflow yet (no id in webflow-ids.json): reported once each, and the
// properties using them compare as `var(token)`, which no Webflow value matches.
const pendingTokens = new Set();
for (const { update_style: u } of actions) {
  const selector = TAG_NAMES.has(u.style_name) && !u.parent_style_names ? u.style_name : `.${[...(u.parent_style_names ?? []), u.style_name].join(".")}`;
  const k = key(selector, u.breakpoint_id, u.pseudo ?? "noPseudo");
  const props = expected.get(k) ?? {};
  for (const p of u.properties) {
    if (p.pending_token) pendingTokens.add(p.pending_token);
    props[p.property_name] = p.pending_token
      ? `var(${p.pending_token})`
      : normalize(p.variable_as_value ? { id: p.variable_as_value } : p.property_value);
  }
  expected.set(k, props);
}

// Webflow keeps `overflow` as one property when x and y are equal; the repo push sends the longhands.
const longhands = (props = {}) =>
  "overflow" in props && !("overflow-x" in props) && !("overflow-y" in props)
    ? { ...Object.fromEntries(Object.entries(props).filter(([n]) => n !== "overflow")), "overflow-x": props.overflow, "overflow-y": props.overflow }
    : props;
const actual = new Map();
for (const style of styles) {
  const { base = {}, breakpoints = {} } = style.properties ?? {};
  actual.set(key(style.selector, "main", "noPseudo"), longhands(base.properties));
  for (const [pseudo, props] of Object.entries(base.pseudos ?? {})) {
    if (pseudo !== "noPseudo") actual.set(key(style.selector, "main", pseudo), longhands(props));
  }
  for (const [breakpoint, data] of Object.entries(breakpoints)) {
    if (breakpoint === "main") continue;
    actual.set(key(style.selector, breakpoint, "noPseudo"), longhands(data.properties));
    for (const [pseudo, props] of Object.entries(data.pseudos ?? {})) {
      if (pseudo !== "noPseudo") actual.set(key(style.selector, breakpoint, pseudo), longhands(props));
    }
  }
}
const selectors = new Set(styles.map((s) => s.selector));

const lines = [];
const expectedSelectors = new Set();
for (const [k, props] of expected) {
  const selector = k.slice(0, k.indexOf(" @"));
  expectedSelectors.add(selector);
  if (!selectors.has(selector)) {
    // w--current and w--open can't be created through the MCP (classes.md); they're set in the Designer.
    if (/w--(current|open)/.test(selector)) continue;
    if (!lines.includes(`MISSING STYLE ${selector}`)) lines.push(`MISSING STYLE ${selector}`);
    continue;
  }
  const have = Object.fromEntries(Object.entries(actual.get(k) ?? {}).map(([n, v]) => [n, normalize(v)]));
  for (const [name, value] of Object.entries(props)) {
    if (!(name in have)) lines.push(`${k} ${name}: ${value} → (missing)`);
    else if (have[name] !== value) lines.push(`${k} ${name}: ${value} → ${have[name]}`);
  }
  for (const name of Object.keys(have)) {
    if (name in props || WEBFLOW_DEFAULTS[name] === have[name]) continue;
    lines.push(`${k} ${name}: (not in repo) → ${have[name]}`);
  }
}
// States or breakpoints that exist in Webflow but not in the repo, for selectors the repo defines.
for (const [k, props] of actual) {
  const selector = k.slice(0, k.indexOf(" @"));
  const extra = Object.entries(props).filter(([n, v]) => WEBFLOW_DEFAULTS[n] !== normalize(v));
  if (expectedSelectors.has(selector) && !expected.has(k) && extra.length > 0) {
    lines.push(`${k} (not in repo): ${extra.map(([n]) => n).join(", ")}`);
  }
}
if (unregistered) {
  // Webflow creates an empty style for every stack of two combos (`fk-panel is-a is-b`), sometimes holding only
  // its own grid defaults (`grid-template-rows: auto` on a utility stack with `fk-grid`). Not drift.
  const onlyDefaults = (props = {}) => Object.entries(props).every(([n, v]) => WEBFLOW_DEFAULTS[n] === normalize(v));
  const isEmpty = (style) =>
    onlyDefaults(style.properties?.base?.properties) &&
    Object.entries(style.properties?.breakpoints ?? {}).every(([, data]) => onlyDefaults(data.properties) && !data.pseudos);
  for (const style of styles) {
    // `._w-button`, `._w-input`: the combo Webflow adds when a class sits on its own Button or Input element.
    if (/\._w-[a-z-]+/.test(style.selector)) continue;
    if (style.selector.startsWith(".") && !expectedSelectors.has(style.selector) && !isEmpty(style)) {
      lines.push(`NOT IN THESE FILES ${style.selector}`);
    }
  }
}

if (pendingTokens.size) lines.unshift(...[...pendingTokens].map((t) => `MISSING VARIABLE ${t} (in tokens.css, no id in webflow-ids.json)`));
console.log(lines.length ? lines.join("\n") : "No differences.");
process.exit(lines.length ? 1 : 0);
