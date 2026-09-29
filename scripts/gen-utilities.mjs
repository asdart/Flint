#!/usr/bin/env node
// Generates src/styles/utilities.css (and the utilities table in docs/webflow/classes.md) from
// src/styles/tokens.css and the closed lists below, so utilities can't drift from the tokens.
// docs/webflow/css-system.md defines the layer. To add a utility: add it here (rule 1: a utility
// exists only if the homepage uses it at least twice or it maps 1:1 to a token), then run
//   node scripts/gen-utilities.mjs
// Never edit utilities.css by hand.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const tokensCss = readFileSync(new URL("src/styles/tokens.css", root), "utf8");
const tokenNames = [...tokensCss.matchAll(/--([a-z0-9-]+):/g)].map((match) => match[1]);
const has = (name) => tokenNames.includes(name);

// Spacing tokens in scale order (space-1, space-1-5, space-2 …).
const SPACE = tokenNames.filter((name) => name.startsWith("space-")).map((name) => name.slice(6));

// Colors: backgrounds for panels, cards and surfaces; text colors for copy.
const BG = ["white", "brand", "brand-light", "secondary", "tertiary", "surface", "stone-50", "peach-100", "sand-100"];
const TEXT = ["ink", "ink-60", "subtle", "subtle-80", "brand", "brand-80", "white", "white-80", "white-60", "stone-100", "stone-400"];
const WIDTHS = ["container", "container-md", "content", "content-sm"];
const RADII = ["sm", "md", "lg", "xl", "2xl", "full"];

for (const name of [
  ...BG.map((c) => `color-${c}`),
  ...TEXT.map((c) => `color-${c}`),
  ...WIDTHS.map((w) => `width-${w}`),
  ...RADII.map((r) => `radius-${r}`),
]) {
  if (!has(name)) throw new Error(`Token --${name} is not in tokens.css`);
}

/** Base utilities: [class name (without fk-), declarations, group]. */
const BASE = [
  ["flex", { display: "flex" }, "Display"],
  ["block", { display: "block" }, "Display"],
  ["grid", { display: "grid" }, "Grid"],
  ...[1, 2, 3, 4].map((n) => [`cols-${n}`, { "grid-template-columns": n === 1 ? "minmax(0, 1fr)" : `repeat(${n}, minmax(0, 1fr))` }, "Grid"]),
  ["hidden", { display: "none" }, "Display"],
  ["flex-col", { "flex-direction": "column" }, "Flex"],
  ["flex-row", { "flex-direction": "row" }, "Flex"],
  ["wrap", { "flex-wrap": "wrap" }, "Flex"],
  ["items-start", { "align-items": "flex-start" }, "Flex"],
  ["items-center", { "align-items": "center" }, "Flex"],
  ["items-end", { "align-items": "flex-end" }, "Flex"],
  ["items-stretch", { "align-items": "stretch" }, "Flex"],
  ["justify-start", { "justify-content": "flex-start" }, "Flex"],
  ["justify-center", { "justify-content": "center" }, "Flex"],
  ["justify-between", { "justify-content": "space-between" }, "Flex"],
  ["justify-end", { "justify-content": "flex-end" }, "Flex"],
  ["self-center", { "align-self": "center" }, "Flex"],
  ["self-stretch", { "align-self": "stretch" }, "Flex"],
  ["grow", { "flex-grow": "1" }, "Flex"],
  ["shrink-0", { "flex-shrink": "0" }, "Flex"],
  ...SPACE.map((n) => [`gap-${n}`, { gap: `var(--space-${n})` }, "Gap"]),
  ["mx-auto", { "margin-left": "auto", "margin-right": "auto" }, "Spacing"],
  ["mt-auto", { "margin-top": "auto" }, "Spacing"],
  ["pt-2", { "padding-top": "var(--space-2)" }, "Spacing"],
  ["pt-4", { "padding-top": "var(--space-4)" }, "Spacing"],
  ["w-full", { width: "100%" }, "Sizing"],
  ["h-full", { height: "100%" }, "Sizing"],
  ["min-w-0", { "min-width": "0" }, "Sizing"],
  ["min-h-0", { "min-height": "0" }, "Sizing"],
  ...WIDTHS.map((w) => [`max-w-${w}`, { "max-width": `var(--width-${w})` }, "Sizing"]),
  ["relative", { position: "relative" }, "Position"],
  ["absolute", { position: "absolute" }, "Position"],
  ["inset-0", { top: "0", right: "0", bottom: "0", left: "0" }, "Position"],
  ["overflow-clip", { overflow: "clip" }, "Position"],
  ["overflow-hidden", { overflow: "hidden" }, "Position"],
  ["object-cover", { "object-fit": "cover" }, "Position"],
  ...RADII.map((r) => [`rounded-${r}`, { "border-radius": `var(--radius-${r})` }, "Radius"]),
  ...BG.map((c) => [`bg-${c}`, { "background-color": `var(--color-${c})` }, "Background"]),
  ...TEXT.map((c) => [`color-${c}`, { color: `var(--color-${c})` }, "Text color"]),
  ["text-left", { "text-align": "left" }, "Text"],
  ["text-center", { "text-align": "center" }, "Text"],
  ["font-medium", { "font-weight": "500" }, "Text"],
];

const BREAKPOINTS = [
  ["tablet", "@media screen and (max-width: 991px)"],
  ["mobile", "@media screen and (max-width: 767px)"],
  ["phone", "@media screen and (max-width: 479px)"],
];

// Responsive variants: `fk-<base>-<breakpoint>` applies at that breakpoint and below.
const RESPONSIVE_GAPS = ["2", "3", "4", "5", "6", "8", "10", "12", "16"].filter((n) => SPACE.includes(n));
const RESPONSIVE = [
  "grid",
  "cols-1",
  "cols-2",
  "cols-3",
  "cols-4",
  "flex",
  "block",
  "hidden",
  "flex-col",
  "flex-row",
  "items-start",
  "items-center",
  "items-stretch",
  "justify-start",
  "justify-center",
  "text-left",
  "text-center",
  "w-full",
  "pt-2",
  "pt-4",
  ...RESPONSIVE_GAPS.map((n) => `gap-${n}`),
];

const byName = new Map(BASE.map(([name, decls]) => [name, decls]));
for (const name of RESPONSIVE) {
  if (!byName.has(name)) throw new Error(`Responsive utility "${name}" has no base utility`);
}

const rule = (selector, decls, indent = "") =>
  `${indent}.${selector} {\n${Object.entries(decls)
    .map(([property, value]) => `${indent}  ${property}: ${value};`)
    .join("\n")}\n${indent}}`;

const header = `/* GENERATED by scripts/gen-utilities.mjs from tokens.css — do not edit by hand.
   Utilities layer: docs/webflow/css-system.md, registry: docs/webflow/classes.md → Utilities.
   One purpose each; a utility never sets a property the element's main class sets. */`;

const blocks = [header, ...BASE.map(([name, decls]) => rule(`fk-${name}`, decls))];
for (const [suffix, query] of BREAKPOINTS) {
  blocks.push(`${query} {\n${RESPONSIVE.map((name) => rule(`fk-${name}-${suffix}`, byName.get(name), "  ")).join("\n\n")}\n}`);
}
writeFileSync(new URL("src/styles/utilities.css", root), `${blocks.join("\n\n")}\n`);

// Registry table between markers in classes.md.
const groups = new Map();
for (const [name, decls, group] of BASE) {
  if (!groups.has(group)) groups.set(group, []);
  const value = Object.entries(decls).map(([p, v]) => `${p}: ${v.replace(/var\(--([a-z0-9-]+)\)/g, "$1")}`).join("; ");
  groups.get(group).push(`\`fk-${name}\` (${value})`);
}
const table = [
  "| Group | Utilities |",
  "| --- | --- |",
  ...[...groups].map(([group, items]) => `| ${group} | ${items.join(", ")} |`),
  `| Responsive (\`-tablet\` ≤991, \`-mobile\` ≤767, \`-phone\` ≤479) | ${RESPONSIVE.map((n) => `\`fk-${n}-*\``).join(", ")} |`,
].join("\n");
const classesPath = new URL("docs/webflow/classes.md", root);
const classes = readFileSync(classesPath, "utf8");
const start = "<!-- utilities:start -->";
const end = "<!-- utilities:end -->";
if (classes.includes(start)) {
  const next = classes.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${table}\n${end}`);
  writeFileSync(classesPath, next);
} else {
  console.warn(`classes.md has no ${start} … ${end} markers; table not written`);
}

const count = BASE.length + RESPONSIVE.length * BREAKPOINTS.length;
console.log(`utilities.css: ${count} utilities (${BASE.length} base, ${RESPONSIVE.length * BREAKPOINTS.length} responsive)`);
