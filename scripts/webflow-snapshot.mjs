#!/usr/bin/env node
// Turns a raw Webflow MCP dump (.cache/webflow-dump/<UTC timestamp>/) into the normalised snapshot described in
// docs/webflow/snapshot/README.md. Offline: it reads files only, never calls the MCP. The output is a pure function of
// the dump (no clock, no repo files), so two runs on the same dump are byte-identical.
// Usage: node scripts/webflow-snapshot.mjs <dump-dir> [--out <dir>] [--commit <hash>] [--rebuild] [--yes] [--check]
//   --check     only verify the dump (every expected file, consistent counts, nothing edited during the dump); print counts
//   --out       write to another folder (default docs/webflow/snapshot/data) to compare dumps without touching the base
//   --commit    repo commit the snapshot matched (default: git rev-parse HEAD)
//   --rebuild   overwrite an existing output folder (the default data/ asks for a yes first; --yes answers it)
// Exit code 1 when the dump is incomplete or inconsistent, 2 on a usage error.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOut = path.join(repoRoot, "docs/webflow/snapshot/data");
const SCHEMA = 1;
const INLINE_CODE_LIMIT = 8 * 1024; // bytes; larger custom code is stored as sha256 + length

const REBUILD_WARNING = `Rebuilding resets the base. Any Webflow edit made since the last sync is absorbed silently
instead of reported. If the old \`data/\` still exists, run a reconcile first.`;

// ---------------------------------------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
};
const optionNames = new Set(["--out", "--commit"]);
const positional = argv.filter((a, i) => !a.startsWith("--") && !optionNames.has(argv[i - 1]));
const usage = "Usage: node scripts/webflow-snapshot.mjs <dump-dir> [--out <dir>] [--commit <hash>] [--rebuild] [--yes] [--check]";
if (positional.length !== 1) {
  console.error(usage);
  process.exit(2);
}
const dumpDir = path.resolve(positional[0]);
if (!fs.existsSync(dumpDir) || !fs.statSync(dumpDir).isDirectory()) {
  console.error(`Not a folder: ${dumpDir}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------------------------- helpers
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const readRaw = (name) => JSON.parse(fs.readFileSync(path.join(dumpDir, name), "utf8"));
const has = (name) => fs.existsSync(path.join(dumpDir, name));
const kebab = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Object keys sorted at every depth (arrays keep their order).
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
};
const line = (value) => JSON.stringify(sortKeys(value));
const pretty = (value) => `${JSON.stringify(sortKeys(value), null, 2)}\n`;
const deepEqual = (a, b) => JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));

// The MCP client saves a result in several shapes: the plain { label, action, result|error } wrapper, an array of
// { type: "text", text: "<json>" } blocks, an array of wrappers, or a one-element array around any of them. Blocks
// that are not a wrapper (a leading { session_id } block, unparsable text) are skipped.
const isWrapper = (v) => v && typeof v === "object" && !Array.isArray(v) && ("result" in v || "error" in v);
const wrappersOf = (value) => {
  if (Array.isArray(value)) return value.flatMap(wrappersOf);
  if (value && typeof value === "object" && value.type === "text" && typeof value.text === "string") {
    try {
      return wrappersOf(JSON.parse(value.text));
    } catch {
      return [];
    }
  }
  return isWrapper(value) ? [value] : [];
};
// One wrapper from a single-result file; a file with several wrappers is returned as is (the caller indexes it).
const unwrap = (value) => {
  const list = wrappersOf(value);
  return list.length === 1 ? list[0] : list;
};
// Same wrappers in the order of the file (for files that hold one result per page, component or interaction).
const parseBlocks = (value) => wrappersOf(value);
// A one-element array around the result object ([{ items }] instead of { items }).
const objectResult = (r) => (Array.isArray(r) && r.length === 1 && r[0] && !Array.isArray(r[0]) ? r[0] : r);

// A file that is valid JSON in a stable layout where every item sits on its own line.
// header: [[key, value], …] one line each, then the list under `listKey`.
const lineDoc = (header, listKey, items) => {
  const parts = header.map(([key, value]) => `${JSON.stringify(key)}:${line(value)}`);
  const body = items.length ? `[\n${items.map((item) => (typeof item === "string" ? item : line(item))).join(",\n")}\n]` : "[]";
  parts.push(`${JSON.stringify(listKey)}:${body}`);
  return `{\n${parts.join(",\n")}\n}\n`;
};

// ---------------------------------------------------------------------------------------------- load the dump
const errors = [];
const warnings = [];
const gaps = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const REQUIRED = [
  "site-before", "site-after", "pages", "pages-before", "pages-after", "components", "component-trees", "styles",
  "variable-collections", "variables", "schema", "sitemap", "site-code", "page-code", "interactions",
  "interactions-full", "cms-collections", "fonts",
];
const raw = {};
for (const name of REQUIRED) {
  if (!has(`${name}.json`)) {
    fail(`missing file ${name}.json`);
    continue;
  }
  try {
    raw[name] = name === "site-code" ? readRaw(`${name}.json`) : unwrap(readRaw(`${name}.json`));
  } catch (error) {
    fail(`${name}.json is not valid JSON (${error.message})`);
  }
}
const assetFiles = fs.readdirSync(dumpDir).filter((f) => /^assets-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(7), 10) - parseInt(b.slice(7), 10));
if (assetFiles.length === 0) fail("missing file assets-1.json");
const treeFiles = fs.readdirSync(dumpDir).filter((f) => /^tree-.+\.json$/.test(f)).sort();
if (treeFiles.length === 0) fail("no tree-<slug>.json files");
if (errors.some((e) => e.startsWith("missing file") && REQUIRED.some((n) => e.includes(`${n}.json`)))) {
  console.error(`Dump ${dumpDir} is incomplete:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const resultOf = (name) => {
  const w = raw[name];
  if (w && w.error) fail(`${name}.json holds an error: ${JSON.stringify(w.error).slice(0, 120)}`);
  return w?.result;
};

const siteBefore = resultOf("site-before");
const siteAfter = resultOf("site-after");
const pagesList = resultOf("pages")?.pages ?? [];
const pagesBefore = resultOf("pages-before")?.pages ?? [];
const pagesAfter = resultOf("pages-after")?.pages ?? [];
const components = resultOf("components") ?? [];
const variables = resultOf("variables") ?? [];
const variableCollections = resultOf("variable-collections") ?? [];
const styles = resultOf("styles") ?? [];
const schemaPages = resultOf("schema")?.pages ?? [];
const sitemapPages = resultOf("sitemap")?.pages ?? [];
const interactionList = objectResult(resultOf("interactions")) ?? { items: [] };
const collections = resultOf("cms-collections")?.collections ?? [];
const fontsResult = resultOf("fonts") ?? { customFonts: [] };

const interactionsFull = parseBlocks(raw["interactions-full"]).map((w) => {
  if (w.error) fail(`interactions-full: ${w.label} holds an error`);
  return w.result?.[0];
}).filter(Boolean);

const componentTrees = parseBlocks(raw["component-trees"]).map((w) => {
  const item = w.result?.[0];
  if (!item || item.status !== "success") fail(`component-trees: ${w.label} has no tree`);
  return { label: w.label, data: item?.data };
}).filter((t) => t.data);

const trees = treeFiles.map((file) => {
  const w = unwrap(readRaw(file));
  const item = w.result?.[0];
  if (!item || item.status !== "success") fail(`${file} has no tree`);
  return { file, label: w.label, data: item?.data };
}).filter((t) => t.data);

const assetPages = assetFiles.map((file) => {
  const w = unwrap(readRaw(file));
  if (w.error) fail(`${file} holds an error`);
  return w.result;
});

// page-code.json: 13 get_page_scripts results (label p-<x>) then 13 get_page_freeform_code results (label f-<x>)
const pageCode = parseBlocks(raw["page-code"]);
const siteCode = raw["site-code"];

// ---------------------------------------------------------------------------------------------- page identity
// Static pages use their slug (the Home page has none: `home`). A template is `template-<collection singular, kebab>`,
// from its title ("Posts Template" -> template-posts), the same names the dump's tree files carry.
const pageSlug = (page) => {
  if (page.collectionId) return `template-${kebab(page.title.replace(/\s+template$/i, ""))}`;
  return page.slug || "home";
};
const pages = pagesList.map((page) => ({ ...page, file: pageSlug(page) }));
const pageById = new Map(pages.map((p) => [p.id, p]));
const treeByPage = new Map(trees.map((t) => [t.data.id.component, t]));
// get_page_scripts / get_page_freeform_code labels are short (p-terms, f-facility): match them to a page file name.
const pageForLabel = (label) => {
  const key = label.slice(2);
  const exact = pages.filter((p) => p.file === key || p.file === `template-${key}`);
  if (exact.length === 1) return exact[0];
  const prefix = pages.filter((p) => p.file.startsWith(key));
  return prefix.length === 1 ? prefix[0] : undefined;
};
const scriptsByPage = new Map();
const freeformByPage = new Map();
for (const w of pageCode) {
  const page = pageForLabel(w.label ?? "");
  if (!page) {
    fail(`page-code: label ${w.label} matches no page`);
    continue;
  }
  (w.action === "get_page_scripts" ? scriptsByPage : freeformByPage).set(page.id, w);
}

// ---------------------------------------------------------------------------------------------- the check
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

if (siteBefore && siteAfter) {
  for (const key of ["lastUpdated", "lastPublished"]) {
    if (siteBefore[key] !== siteAfter[key]) fail(`site ${key} moved during the dump (${siteBefore[key]} -> ${siteAfter[key]}): someone edited or published`);
  }
}
if (!deepEqual(pagesBefore.map((p) => [p.id, p.lastUpdated]), pagesAfter.map((p) => [p.id, p.lastUpdated]))) {
  fail("a page lastUpdated moved between pages-before.json and pages-after.json: someone edited during the dump");
}
if (!deepEqual(pagesList.map((p) => [p.id, p.lastUpdated]), pagesBefore.map((p) => [p.id, p.lastUpdated]))) {
  fail("pages.json differs from pages-before.json");
}
const pagesTotal = resultOf("pages")?.pagination?.total;
if (pagesTotal !== undefined && pagesTotal !== pagesList.length) fail(`pages.json lists ${pagesList.length} pages, pagination.total is ${pagesTotal}`);
if (!sameSet(pages.map((p) => p.id), trees.map((t) => t.data.id.component))) fail("the tree files and pages.json do not cover the same page ids");
if (new Set(pages.map((p) => p.file)).size !== pages.length) fail("two pages normalise to the same file name");
for (const t of trees) {
  const page = pageById.get(t.data.id.component);
  if (page && t.file !== `tree-${page.file}.json`) warn(`${t.file} is named differently from the page file name ${page.file}`);
}
if (!sameSet(schemaPages.map((p) => p.id), pages.map((p) => p.id))) fail("schema.json does not cover the same pages as pages.json");
for (const p of sitemapPages) if (!pageById.has(p.id)) fail(`sitemap.json lists unknown page ${p.id}`);
for (const page of pages) {
  const scripts = scriptsByPage.get(page.id);
  const freeform = freeformByPage.get(page.id);
  if (!scripts) fail(`page-code: no get_page_scripts result for ${page.file}`);
  else if (scripts.error && scripts.error.status !== 404) fail(`page-code: get_page_scripts failed for ${page.file} (${scripts.error.status})`);
  if (!freeform) fail(`page-code: no get_page_freeform_code result for ${page.file}`);
  else if (freeform.error) fail(`page-code: get_page_freeform_code failed for ${page.file}`);
}
const ixListIds = interactionList.items.map((i) => i.id);
if (interactionList.hasMore) fail("interactions.json has more items than it lists");
if (interactionList.total !== undefined && interactionList.total !== ixListIds.length) fail(`interactions.json lists ${ixListIds.length}, total is ${interactionList.total}`);
if (!sameSet(ixListIds, interactionsFull.map((i) => i.id))) fail("interactions-full.json ids differ from interactions.json ids");
for (const full of interactionsFull) {
  const listed = interactionList.items.find((i) => i.id === full.id);
  if (listed && listed.version !== full.version) fail(`interaction ${full.id} version differs between the list (${listed.version}) and the full read (${full.version})`);
}
if (new Set(interactionsFull.map((i) => i.name)).size !== interactionsFull.length) fail("two interactions share a name");
const allAssets = assetPages.flatMap((p) => p?.assets ?? []);
const assetsTotal = assetPages[0]?.pagination?.total;
if (assetsTotal !== undefined && assetsTotal !== allAssets.length) fail(`assets files hold ${allAssets.length} assets, pagination.total is ${assetsTotal}`);
if (new Set(allAssets.map((a) => a.id)).size !== allAssets.length) fail("duplicate asset ids across the assets files");
if (!sameSet(components.map((c) => c.id), componentTrees.map((t) => t.data.id.component))) fail("component-trees.json does not cover the same components as components.json");
for (const t of componentTrees) {
  const comp = components.find((c) => c.id === t.data.id.component);
  if (comp && comp.name !== t.label) warn(`component tree label "${t.label}" differs from the component name "${comp.name}"`);
}
if (new Set(components.map((c) => kebab(c.name))).size !== components.length) fail("two components normalise to the same file name");
if (new Set(styles.map((s) => s.selector)).size !== styles.length) fail("duplicate style selectors in styles.json");
if (!variableCollections.some((c) => c.name === "Flint")) fail("variable-collections.json has no collection named Flint");
const fontsTotal = fontsResult.pagination?.total;
if (fontsTotal !== undefined && fontsTotal !== fontsResult.customFonts.length) fail(`fonts.json lists ${fontsResult.customFonts.length}, total is ${fontsTotal}`);
if (collections.length === 0) fail("cms-collections.json lists no collections");
const cmsDetailsFile = ["cms-collection-details.json", "cms-details.json"].find(has);
if (!cmsDetailsFile) gaps.push("cms-details.json missing: CMS field schemas are not in this dump (re-read get_collection_details for each collection)");
gaps.push("variantStyles: get_variant_styles was not part of the dump, so components carry no variantStyles");
gaps.push("site instruction (search_instructions path and version) is not part of the dump");

// ---------------------------------------------------------------------------------------------- styles
const varById = new Map(variables.map((v) => [v.id, v.name]));
const styleById = new Map(styles.map((s) => [s.id, s.selector]));
const unresolvedVars = new Set();
const valueOf = (v) => {
  if (v && typeof v === "object") {
    const name = varById.get(v.id);
    if (!name) unresolvedVars.add(v.id);
    return `var(${name ?? `?${v.id}`})`;
  }
  return v;
};
const propsOf = (props) => {
  const entries = Object.entries(props ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return Object.fromEntries(entries.map(([name, value]) => [name, valueOf(value)]));
};
const statesOf = (data, label) => {
  // data = { properties, pseudos }: `properties` is the no-pseudo block, `pseudos.noPseudo` repeats it.
  const states = {};
  const none = propsOf(data?.properties);
  if (data?.pseudos?.noPseudo && !deepEqual(propsOf(data.pseudos.noPseudo), none)) warn(`${label}: pseudos.noPseudo differs from properties`);
  if (Object.keys(none).length) states.noPseudo = none;
  for (const [pseudo, props] of Object.entries(data?.pseudos ?? {})) {
    if (pseudo === "noPseudo") continue;
    const converted = propsOf(props);
    if (Object.keys(converted).length) states[pseudo] = converted;
  }
  return Object.fromEntries(Object.entries(states).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
};
const styleLines = [];
let emptyStyles = 0;
for (const style of [...styles].sort((a, b) => (a.selector < b.selector ? -1 : a.selector > b.selector ? 1 : 0))) {
  const base = statesOf(style.properties?.base, style.selector);
  const bp = {};
  for (const [name, data] of Object.entries(style.properties?.breakpoints ?? {})) {
    const states = statesOf(data, `${style.selector} @${name}`);
    if (name === "main") {
      // `main` is a copy of the desktop block in the MCP result.
      if (!deepEqual(states.noPseudo ?? {}, base.noPseudo ?? {})) warn(`${style.selector}: breakpoint main differs from base`);
      continue;
    }
    if (Object.keys(states).length) bp[name] = states;
  }
  const bpSorted = Object.fromEntries(Object.entries(bp).sort(([a], [b]) => (a < b ? -1 : 1)));
  if (Object.keys(base).length === 0 && Object.keys(bp).length === 0) {
    emptyStyles++;
    continue;
  }
  // Fixed key order: sel, type, base, bp. Property and pseudo-state keys are already sorted.
  const entry = { sel: style.selector, type: style.type, base, ...(Object.keys(bp).length ? { bp: bpSorted } : {}) };
  styleLines.push(JSON.stringify(entry));
}
if (unresolvedVars.size) fail(`styles reference ${unresolvedVars.size} variable id(s) missing from variables.json (first: ${[...unresolvedVars][0]})`);

// ---------------------------------------------------------------------------------------------- element trees
const ELEMENT_KEYS = new Set(["id", "type", "children", "styleNames", "settings", "instanceDetails", "attributes", "textContent"]);
const componentById = new Map(components.map((c) => [c.id, c]));
const treeStats = { elements: 0, instances: 0 };
const unknownKeys = new Set();
const cleanSettings = (settings = {}) => {
  const out = {};
  for (const [key, value] of Object.entries(settings)) {
    if (key === "visibility" && value === true) continue;
    // `block` and `dom` repeat `tag` (the same shape in every tree).
    if ((key === "block" || key === "dom") && deepEqual(value, { tag: settings.tag })) continue;
    out[key] = value;
  }
  return out;
};
const instanceOf = (details) => {
  const i = { comp: details.id, name: details.name };
  const props = {};
  for (const prop of details.props ?? []) if (prop.hasOverride) props[prop.name] = prop.value;
  if (Object.keys(props).length) i.props = props;
  const slots = (details.slots ?? []).map((slot) => (typeof slot === "string" ? slot : slot.name ?? slot.id));
  if (slots.length) i.slots = slots;
  return i;
};
const convertTree = (root, label) => {
  const out = [];
  const seen = new Set();
  const walk = (element, parent) => {
    for (const key of Object.keys(element)) if (!ELEMENT_KEYS.has(key)) unknownKeys.add(`${label}: element key ${key}`);
    const id = element.id.element;
    if (seen.has(id)) fail(`${label}: duplicate element id ${id}`);
    seen.add(id);
    const entry = { id, p: parent, t: element.type };
    if (element.styleNames?.length) entry.c = element.styleNames;
    const s = cleanSettings(element.settings);
    if (Object.keys(s).length) entry.s = s;
    if (element.attributes && Object.keys(element.attributes).length) entry.a = element.attributes;
    if (element.type === "String") entry.x = element.textContent ?? "";
    if (element.instanceDetails) {
      entry.i = instanceOf(element.instanceDetails);
      treeStats.instances++;
      if (!componentById.has(entry.i.comp)) fail(`${label}: instance of unknown component ${entry.i.comp}`);
    }
    // Fixed key order for element lines: id, p, t, c, s, a, x, i. Inside s, a and i the keys are sorted.
    const ordered = { id: entry.id, p: entry.p, t: entry.t };
    for (const key of ["c", "s", "a", "x", "i"]) if (key in entry) ordered[key] = entry[key];
    out.push(JSON.stringify(Object.fromEntries(Object.entries(ordered).map(([k, v]) => [k, sortKeys(v)]))));
    for (const child of element.children ?? []) walk(child, id);
  };
  walk(root, null);
  treeStats.elements += out.length;
  return out;
};

// ---------------------------------------------------------------------------------------------- custom code
const codeBlock = (text) => {
  const content = text ?? "";
  if (Buffer.byteLength(content) <= INLINE_CODE_LIMIT) return content;
  return { length: content.length, sha256: sha256(content) };
};
const pageScripts = (page) => {
  const w = scriptsByPage.get(page.id);
  if (!w || w.error) return [];
  return (w.result.scripts ?? []).map((s) => {
    const entry = { id: s.id, location: s.location, version: s.version };
    if (s.attributes && Object.keys(s.attributes).length) entry.attributes = s.attributes;
    return entry;
  }).sort((a, b) => (a.id + a.version < b.id + b.version ? -1 : 1));
};
const freeformOf = (page) => {
  const w = freeformByPage.get(page.id);
  const result = { head: "", footer: "" };
  for (const block of w?.result ?? []) if (block.location in result) result[block.location] = block.content ?? "";
  return result;
};

// ---------------------------------------------------------------------------------------------- interactions
const resolveClasses = (value) => {
  if (typeof value === "string") {
    const selector = styleById.get(value);
    return selector ? { class: selector, id: value } : value;
  }
  if (Array.isArray(value)) return value.map(resolveClasses);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveClasses(v)]));
  return value;
};
const interactionFile = (ix) => {
  const { pageId: _pageId, timelines = [], ...rest } = ix;
  const doc = { ...rest, timelines: timelines.map(({ pageId: _timelinePage, ...timeline }) => timeline) };
  return pretty(resolveClasses(doc));
};

// ---------------------------------------------------------------------------------------------- build the files
const files = new Map(); // relative path -> content
const put = (rel, content) => files.set(rel, content);

// variables
{
  const flint = {};
  for (const v of [...variables].sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if ((v.modeValues ?? []).length > 1) warn(`variable ${v.name} has several modes; only the base value is stored`);
    flint[v.name] = { id: v.id, type: v.type, value: v.value };
  }
  put("variables.json", `{\n${Object.entries(flint).map(([name, v]) => `${JSON.stringify(name)}:${line(v)}`).join(",\n")}\n}\n`);
}

put("styles.jsonl", `${styleLines.join("\n")}\n`);

// site
{
  const registered = (siteCode["registered"]?.result?.registeredScripts ?? [])
    .map((s) => ({ displayName: s.displayName, id: s.id, version: s.version }))
    .sort((a, b) => (a.id + a.version < b.id + b.version ? -1 : 1));
  const freeform = siteCode["site-freeform"]?.result ?? [];
  const siteScriptsWrap = siteCode["site-scripts"];
  if (!siteCode["site-freeform"] || siteCode["site-freeform"].error) fail("site-code.json: site-freeform missing or an error");
  if (!siteCode["registered"] || siteCode["registered"].error) fail("site-code.json: registered scripts missing or an error");
  let siteScripts = [];
  if (siteScriptsWrap?.error) {
    if (siteScriptsWrap.error.status !== 404) fail("site-code.json: site-scripts failed with something other than 404");
  } else siteScripts = siteScriptsWrap?.result?.scripts ?? [];
  const code = { head: "", footer: "" };
  for (const block of freeform) if (block.location in code) code[block.location] = block.content ?? "";
  put("site.json", pretty({
    code: { footer: codeBlock(code.footer), head: codeBlock(code.head) },
    fonts: [...(fontsResult.customFonts ?? [])]
      .map((f) => ({ fileHash: f.fileHash, fileName: f.fileName, fontDisplay: f.fontDisplay, fontFamily: f.fontFamily, format: f.format, id: f.id, italic: f.italic, weight: f.weight }))
      .sort((a, b) => (a.fileName < b.fileName ? -1 : 1)),
    registeredScripts: registered,
    site: {
      customDomains: siteAfter.customDomains,
      dataCollectionEnabled: siteAfter.dataCollectionEnabled,
      dataCollectionType: siteAfter.dataCollectionType,
      displayName: siteAfter.displayName,
      googleTagIds: siteAfter.googleTagIds,
      id: siteAfter.id,
      locales: siteAfter.locales,
      shortName: siteAfter.shortName,
      timeZone: siteAfter.timeZone,
      workspaceId: siteAfter.workspaceId,
    },
    siteScripts: siteScripts.map((s) => ({ id: s.id, location: s.location, version: s.version })),
    variableCollections: variableCollections.map((c) => ({ id: c.id, modes: c.modes.map((m) => m.name), name: c.name })),
  }));
}

// pages
const pageFiles = [];
for (const page of [...pages].sort((a, b) => (a.file < b.file ? -1 : 1))) {
  const tree = treeByPage.get(page.id);
  if (!tree) continue;
  const schema = schemaPages.find((s) => s.id === page.id);
  const sitemap = sitemapPages.find((s) => s.id === page.id);
  const free = freeformOf(page);
  const header = [
    ["pageId", page.id],
    ["file", page.file],
    ["title", page.title],
    ["slug", page.slug ?? ""],
    ["publishedPath", page.publishedPath],
    ["draft", page.draft],
    ["archived", page.archived],
    ["seo", page.seo],
    ["openGraph", page.openGraph],
  ];
  if (page.collectionId) header.push(["collectionId", page.collectionId]);
  header.push(["includeInSitemap", sitemap ? sitemap.includeInSitemap : null]);
  header.push(["jsonLd", schema?.jsonLdSchema ?? null]);
  if (schema?.rawJsonLdSchema) header.push(["jsonLdRaw", schema.rawJsonLdSchema]);
  header.push(["scripts", pageScripts(page)]);
  header.push(["head", codeBlock(free.head)]);
  header.push(["footer", codeBlock(free.footer)]);
  // Head code that uses CMS tokens (x-schema-post) is not returned by get_page_freeform_code.
  if (typeof schema?.rawJsonLdSchema === "string" && schema.rawJsonLdSchema.includes("{{wf")) header.push(["headUnreadable", true]);
  put(`pages/${page.file}.json`, lineDoc(header, "elements", convertTree(tree.data, page.file)));
  pageFiles.push(page.file);
}

// components
for (const comp of [...components].sort((a, b) => (kebab(a.name) < kebab(b.name) ? -1 : 1))) {
  const tree = componentTrees.find((t) => t.data.id.component === comp.id);
  if (!tree) continue;
  const header = [
    ["id", comp.id],
    ["name", comp.name],
    ["group", comp.group],
    ["description", comp.description ?? ""],
    ["props", comp.props.map((p) => ({ default: p.defaultValue ?? null, id: p.id, name: p.name, type: p.type }))],
    ["variants", comp.variants.map((v, order) => ({ id: v.id, name: v.name, order }))],
  ];
  put(`components/${kebab(comp.name)}.json`, lineDoc(header, "elements", convertTree(tree.data, `component ${comp.name}`)));
}

// interactions
for (const ix of [...interactionsFull].sort((a, b) => (a.name < b.name ? -1 : 1))) put(`interactions/${kebab(ix.name)}.json`, interactionFile(ix));

// assets
{
  const items = allAssets
    .map((a) => ({ altText: a.altText ?? null, contentType: a.contentType, displayName: a.displayName, folderId: a.folderId ?? null, id: a.id }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  put("assets.json", `[\n${items.map(line).join(",\n")}\n]\n`);
}

// cms
{
  const doc = {
    collections: [...collections]
      .map((c) => ({ displayName: c.displayName, id: c.id, singularName: c.singularName, slug: c.slug }))
      .sort((a, b) => (a.slug < b.slug ? -1 : 1)),
    fields: null,
  };
  if (cmsDetailsFile) {
    // Best effort: the shape was never seen. Keep what each detail result holds, minus timestamps.
    // The file is a { "<label>": wrapper } map, or blocks / wrappers; each wrapper holds one get_collection_details result.
    const rawDetails = readRaw(cmsDetailsFile);
    const wrappers = wrappersOf(Array.isArray(rawDetails) ? rawDetails : Object.values(rawDetails).flatMap((v) => wrappersOf(v)));
    const details = wrappers.flatMap((w) => [w.result ?? w].flat());
    const strip = (v) => {
      if (Array.isArray(v)) return v.map(strip);
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([k]) => !["lastUpdated", "createdOn"].includes(k)).map(([k, x]) => [k, strip(x)]));
      return v;
    };
    doc.fields = strip(details).sort((a, b) => ((a.id ?? "") < (b.id ?? "") ? -1 : 1));
  }
  put("cms.json", pretty(doc));
}

// ---------------------------------------------------------------------------------------------- manifest
for (const key of unknownKeys) warn(key);
const dumpName = path.basename(dumpDir);
const stamp = dumpName.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
const relDump = path.relative(repoRoot, dumpDir);
const resolveCommit = () => {
  const given = option("--commit");
  try {
    return execFileSync("git", ["rev-parse", "--verify", `${given ?? "HEAD"}^{commit}`], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    if (given) {
      warn(`--commit ${given} is not a commit in this repo; stored as given`);
      return given;
    }
    warn("could not run git rev-parse HEAD; repoCommit is null");
    return null;
  }
};
const rawHashes = {};
for (const f of fs.readdirSync(dumpDir).filter((n) => n.endsWith(".json")).sort()) rawHashes[f] = sha256(fs.readFileSync(path.join(dumpDir, f)));

const signals = {
  collectionLastUpdated: Object.fromEntries(collections.map((c) => [c.id, c.lastUpdated]).sort()),
  interactionVersion: Object.fromEntries(interactionList.items.map((i) => [i.id, i.version]).sort()),
  pageLastUpdated: Object.fromEntries(pages.map((p) => [p.id, p.lastUpdated]).sort()),
  pageScriptsLastUpdated: Object.fromEntries(pages.map((p) => [p.id, scriptsByPage.get(p.id)?.result?.lastUpdated]).filter(([, v]) => v).sort()),
  registeredScripts: (siteCode["registered"]?.result?.registeredScripts ?? []).map((s) => [s.id, s.version]).sort((a, b) => (`${a}` < `${b}` ? -1 : 1)),
  siteLastPublished: siteAfter?.lastPublished,
  siteLastUpdated: siteAfter?.lastUpdated,
};
const counts = {
  assets: allAssets.length,
  collections: collections.length,
  components: components.length,
  elements: treeStats.elements,
  emptyStyles,
  fonts: fontsResult.customFonts.length,
  instances: treeStats.instances,
  interactions: interactionsFull.length,
  pages: pages.length,
  styles: styleLines.length,
  stylesInDump: styles.length,
  variables: variables.length,
};

// ---------------------------------------------------------------------------------------------- report
const printReport = () => {
  console.log(`Dump ${relDump || dumpDir}`);
  console.log(`Counts: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`Site lastUpdated ${siteBefore?.lastUpdated} before, ${siteAfter?.lastUpdated} after; lastPublished ${siteBefore?.lastPublished}`);
  for (const message of warnings) console.log(`WARNING ${message}`);
  for (const message of gaps) console.log(`GAP ${message}`);
  for (const message of errors) console.log(`ERROR ${message}`);
  console.log(errors.length ? `Check failed: ${errors.length} error(s).` : "Check passed.");
};

if (flag("--check")) {
  printReport();
  process.exit(errors.length ? 1 : 0);
}
if (errors.length) {
  printReport();
  console.error("Not writing a snapshot from an incomplete or inconsistent dump.");
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------- write
const out = path.resolve(option("--out") ?? defaultOut);
const isDefaultOut = out === defaultOut;
const MANAGED = ["manifest.json", "site.json", "variables.json", "styles.jsonl", "assets.json", "cms.json", "pages", "components", "interactions"];
const outExists = fs.existsSync(out) && fs.readdirSync(out).length > 0;
if (outExists && !flag("--rebuild")) {
  console.error(`${path.relative(repoRoot, out) || out} already exists. Run a reconcile first, or pass --rebuild to replace it.`);
  process.exit(1);
}
if (isDefaultOut && (flag("--rebuild") || outExists)) {
  console.log(REBUILD_WARNING);
  if (!flag("--yes")) {
    if (!process.stdin.isTTY) {
      console.error("Not an interactive terminal: pass --yes to confirm the rebuild.");
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question("Type yes to continue: ")).trim().toLowerCase();
    rl.close();
    if (answer !== "yes") {
      console.error("Aborted, nothing written.");
      process.exit(1);
    }
  }
}
fs.mkdirSync(out, { recursive: true });
for (const name of MANAGED) fs.rmSync(path.join(out, name), { recursive: true, force: true });
const fileHashes = {};
for (const [rel, content] of [...files].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const target = path.join(out, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  fileHashes[rel] = sha256(content);
}
const manifest = {
  schema: SCHEMA,
  takenAt: stamp ? `${stamp[1]}-${stamp[2]}-${stamp[3]}T${stamp[4]}:${stamp[5]}:${stamp[6]}Z` : null,
  repoCommit: resolveCommit(),
  dump: relDump.startsWith("..") ? dumpDir : relDump,
  siteId: siteAfter.id,
  signals,
  counts,
  gaps,
  files: fileHashes,
  rawDump: rawHashes,
};
fs.writeFileSync(path.join(out, "manifest.json"), pretty(manifest));
// A warning that came from resolving the commit is only known now.
printReport();
const bytes = [...files.values()].reduce((sum, c) => sum + Buffer.byteLength(c), 0);
console.log(`Wrote ${files.size + 1} files (${(bytes / 1024).toFixed(0)} KB) to ${path.relative(repoRoot, out) || out}`);
