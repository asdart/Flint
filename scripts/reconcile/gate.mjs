// The reconcile gate's partial dump (reconcile phase 5): decide which raw reads a gate needs from the quick-check
// signals (`planGate`) and assemble a complete raw dump from those reads plus the unchanged files of the base's raw
// dump (`composeGate`). Offline: reads files only, never calls the Webflow MCP. See docs/webflow/snapshot/README.md
// ("The gate: a partial dump") and the flint-reconcile skill.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.mjs";
import { DEFAULT_DATA } from "./snapshot-io.mjs";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const kebab = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- reading raw results (the same tolerance as webflow-snapshot.mjs: wrapper, text blocks, arrays of either) -------------
const isWrapper = (v) => v && typeof v === "object" && !Array.isArray(v) && ("result" in v || "error" in v);
export function wrappersOf(value) {
  if (Array.isArray(value)) return value.flatMap(wrappersOf);
  if (value && typeof value === "object" && value.type === "text" && typeof value.text === "string") {
    try {
      return wrappersOf(JSON.parse(value.text));
    } catch {
      return [];
    }
  }
  return isWrapper(value) ? [value] : [];
}
const readJson = (dir, name) => {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${name} in ${dir} is not valid JSON (${e.message})`);
  }
};
/** The `result` of a single-result file, or undefined (also when the file holds an error). */
const resultOf = (dir, name) => {
  const raw = readJson(dir, name);
  if (raw === undefined) return undefined;
  const w = wrappersOf(raw)[0];
  if (!w || w.error) return undefined;
  return w.result;
};
const objectResult = (r) => (Array.isArray(r) && r.length === 1 && r[0] && !Array.isArray(r[0]) ? r[0] : r);

// The same file names as webflow-snapshot.mjs (a Webflow page without a slug is `home`, a template `template-<singular>`).
export const pageFile = (page) => (page.collectionId ? `template-${kebab(page.title.replace(/\s+template$/i, ""))}` : page.slug || "home");
/** `p-<x>` / `f-<x>` labels of page-code.json to a page (the snapshot script's `pageForLabel`). */
function pageForLabel(label, pages) {
  const key = String(label ?? "").slice(2);
  const exact = pages.filter((p) => p.file === key || p.file === `template-${key}`);
  if (exact.length === 1) return exact[0];
  const prefix = pages.filter((p) => p.file.startsWith(key));
  return prefix.length === 1 ? prefix[0] : undefined;
}

// ---- what a gate dump contains ---------------------------------------------------------------------------------------------
/** The five quick-check reads, saved under the dump's own file names. */
export const SIGNAL_CALLS = [
  { file: "site-before.json", tool: "data_sites_tool", action: "get_site", args: "site_id" },
  { file: "pages-before.json", tool: "data_pages_tool", action: "list_pages", args: "site_id (limit 100)" },
  { file: "interactions.json", tool: "data_interactions_tool", action: "list_interactions", args: "" },
  { file: "cms-collections.json", tool: "data_cms_tool", action: "get_collection_list", args: "siteId" },
  { file: "registered-scripts.json", tool: "data_scripts_tool", action: "get_registered_scripts", args: "" },
];
const ALWAYS = [
  { file: "styles.json", tool: "data_style_tool", action: "get_styles", args: "query all, include_properties, breakpoints main medium small tiny, base pseudos noPseudo hover active focus focus-visible focus-within placeholder", why: "styles have no timestamp" },
  { file: "components.json", tool: "data_component_tool", action: "get_all_components", args: "includeProps, includeVariants, includeInstanceCount", why: "components have no timestamp" },
  { file: "component-trees.json", tool: "data_element_tool", action: "get_all_elements", args: "one scope_component_id action per component (the component ids come from components.json)", why: "components have no timestamp" },
  { file: "variables.json", tool: "data_variable_tool", action: "get_variables", args: "collection Flint", why: "variables have no timestamp" },
];
const END = [
  { file: "site-after.json", tool: "data_sites_tool", action: "get_site", args: "site_id", why: "nothing edited during the dump (must equal site-before.json)" },
  { file: "pages-after.json", tool: "data_pages_tool", action: "list_pages", args: "site_id (limit 100)", why: "nothing edited during the dump (must equal pages-before.json)" },
];
/** Every raw file a complete dump has (webflow-snapshot.mjs REQUIRED, plus assets, trees and the CMS details). */
const COPY_FROM_BASE = ["variable-collections.json", "schema.json", "sitemap.json", "site-code.json", "fonts.json"];

// ---- the base ------------------------------------------------------------------------------------------------------------
export function loadBase(baseDir = DEFAULT_DATA, fromDir) {
  const manifestFile = path.join(baseDir, "manifest.json");
  if (!fs.existsSync(manifestFile)) {
    return { full: [`there is no base (${path.relative(ROOT, manifestFile) || manifestFile} is missing: new clone, cloud session or lost disk)`], rebuild: true };
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  const full = [];
  const dump = fromDir ? path.resolve(fromDir) : path.resolve(ROOT, manifest.dump ?? "");
  if (!manifest.dump && !fromDir) full.push("the base manifest names no raw dump");
  else if (!fs.existsSync(dump) || !fs.statSync(dump).isDirectory()) {
    full.push(`the base's raw dump folder is gone (${path.relative(ROOT, dump) || dump}); the unchanged files can't be reused`);
  } else {
    const bad = [];
    for (const [name, hash] of Object.entries(manifest.rawDump ?? {})) {
      const f = path.join(dump, name);
      if (!fs.existsSync(f)) bad.push(`${name} (missing)`);
      else if (sha256(fs.readFileSync(f)) !== hash) bad.push(`${name} (changed since the base was taken)`);
    }
    if (bad.length) full.push(`the base's raw dump folder no longer matches the manifest: ${bad.slice(0, 5).join(", ")}${bad.length > 5 ? ` and ${bad.length - 5} more` : ""}`);
  }
  const rows = manifest.refreshedRows ?? [];
  if (rows.length && manifest.dump !== rows[rows.length - 1].newDump) {
    full.push("the base was partially refreshed (reconcile apply): its raw dump no longer equals the base state, so unchanged files can't be taken from it. Finish with the sync's full rebuild first");
  }
  return { manifest, dump, full, rebuild: false };
}

// ---- the plan ------------------------------------------------------------------------------------------------------------
/**
 * @param {string} partialDir folder with the quick-check reads (and, for compose, the reads the plan asked for)
 * @returns {{mode: "full"|"signals"|"partial", reasons: string[], missingSignals: object[], moved: object, reads: object[], calls: number, base?: object}}
 */
export function planGate(partialDir, { baseDir = DEFAULT_DATA, fromDir } = {}) {
  const base = loadBase(baseDir, fromDir);
  if (base.full.length) return { mode: "full", rebuild: base.rebuild, reasons: base.full, missingSignals: [], moved: {}, reads: [], calls: 58 };
  const { manifest } = base;
  const sig = manifest.signals ?? {};
  const partial = path.resolve(partialDir);

  // The five signal reads.
  const site = resultOf(partial, "site-before.json");
  const pagesList = (resultOf(partial, "pages-before.json") ?? resultOf(partial, "pages.json"))?.pages;
  const ixList = (() => {
    const r = objectResult(resultOf(partial, "interactions.json"));
    return r?.items;
  })();
  const collections = resultOf(partial, "cms-collections.json")?.collections;
  const registered = resultOf(partial, "registered-scripts.json")?.registeredScripts;
  const missingSignals = SIGNAL_CALLS.filter((c) => ({ "site-before.json": !site, "pages-before.json": !pagesList, "interactions.json": !ixList, "cms-collections.json": !collections, "registered-scripts.json": !registered })[c.file]);
  if (missingSignals.length) {
    return { mode: "signals", reasons: [`read the quick-check signals first (${missingSignals.length} of 5 missing in ${shown(partial)})`], missingSignals, moved: {}, reads: [], calls: missingSignals.length, base: { dump: manifest.dump, repoCommit: manifest.repoCommit, takenAt: manifest.takenAt } };
  }
  if (site.id !== manifest.siteId) return { mode: "full", reasons: [`get_site returned ${site.id}, the base is for ${manifest.siteId}: wrong site`], missingSignals: [], moved: {}, reads: [], calls: 58 };

  const pages = pagesList.map((p) => ({ ...p, file: pageFile(p) }));
  const moved = { pages: [], added: [], removed: [], interactions: [], interactionsAdded: [], interactionsRemoved: [], collections: [], registered: false, site: false };
  const pageSig = sig.pageLastUpdated ?? {};
  for (const p of pages) {
    if (!(p.id in pageSig)) moved.added.push(p);
    else if (pageSig[p.id] !== p.lastUpdated) moved.pages.push(p);
  }
  const ids = new Set(pages.map((p) => p.id));
  moved.removed = Object.keys(pageSig).filter((id) => !ids.has(id));
  const ixSig = sig.interactionVersion ?? {};
  for (const i of ixList) {
    if (!(i.id in ixSig)) moved.interactionsAdded.push(i);
    else if (ixSig[i.id] !== i.version) moved.interactions.push(i);
  }
  moved.interactionsRemoved = Object.keys(ixSig).filter((id) => !ixList.some((i) => i.id === id));
  const colSig = sig.collectionLastUpdated ?? {};
  for (const c of collections) if (colSig[c.id] !== c.lastUpdated) moved.collections.push(c);
  moved.collectionsRemoved = Object.keys(colSig).filter((id) => !collections.some((c) => c.id === id));
  const regKey = (list) => JSON.stringify([...list.map((s) => [s.id, s.version])].sort((a, b) => (`${a}` < `${b}` ? -1 : 1)));
  moved.registered = regKey(registered) !== JSON.stringify(sig.registeredScripts ?? []);
  moved.site = site.lastUpdated !== sig.siteLastUpdated || site.lastPublished !== sig.siteLastPublished;

  const reads = [];
  const add = (r) => reads.push(r);
  for (const r of ALWAYS) add({ ...r, scope: "always" });
  const pageChanged = moved.pages.length + moved.added.length + moved.removed.length > 0;
  for (const p of [...moved.pages, ...moved.added]) {
    add({ file: `tree-${p.file}.json`, tool: "data_element_tool", action: "get_all_elements", args: `pageId ${p.id} (${p.title})`, why: `${moved.added.includes(p) ? "new page" : "lastUpdated moved"}: ${sig.pageLastUpdated?.[p.id] ?? "none"} -> ${p.lastUpdated}`, scope: "moved" });
  }
  const codePages = moved.registered ? pages : [...moved.pages, ...moved.added];
  if (codePages.length) {
    add({ file: "page-code.json", tool: "data_scripts_tool", action: "get_page_scripts + get_page_freeform_code", args: `labels ${codePages.map((p) => `p-${p.file.replace(/^template-/, "")} / f-${p.file.replace(/^template-/, "")}`).join(", ")}`, entries: codePages.map((p) => p.file), why: moved.registered ? "a registered script id or version moved: every page's applied scripts" : "page lastUpdated moved: its applied scripts and head/footer code", scope: "moved" });
  }
  if (pageChanged) {
    add({ file: "schema.json", tool: "data_pages_tool", action: "query_pages_schema_markup", args: "all pages in one action", why: "page JSON-LD and settings (a page moved or the page set changed)", scope: "moved" });
    add({ file: "sitemap.json", tool: "data_sitemap_tool", action: "list_pages_sitemap_status", args: "", why: "sitemap inclusion (a page moved or the page set changed)", scope: "moved" });
  }
  const ixToRead = [...moved.interactions, ...moved.interactionsAdded];
  if (ixToRead.length) {
    add({ file: "interactions-full.json", tool: "data_interactions_tool", action: "get_interaction", args: ixToRead.map((i) => i.id).join(", "), entries: ixToRead.map((i) => i.id), why: "interaction version moved or new interaction", scope: "moved" });
  }
  if (moved.collections.length) {
    add({ file: "cms-details.json", tool: "data_cms_tool", action: "get_collection_details", args: moved.collections.map((c) => c.id).join(", "), entries: moved.collections.map((c) => c.id), why: "collection lastUpdated moved", scope: "moved" });
  }
  if (moved.registered || moved.site) {
    add({ file: "site-code.json", tool: "data_scripts_tool", action: "get_site_freeform_code + get_site_scripts + get_registered_scripts", args: "3 actions in one call", why: moved.registered ? "a registered script moved" : "siteLastUpdated / siteLastPublished moved (site head and footer code)", scope: "moved" });
  }
  if (moved.site) {
    add({ file: "fonts.json", tool: "data_fonts_tool", action: "list_fonts", args: "", why: "siteLastUpdated / siteLastPublished moved", scope: "moved" });
    add({ file: "assets-1.json", tool: "data_assets_tool", action: "list_assets", args: "limit 100, offset 0, then offset 100 as assets-2.json ... until pagination.total", why: "siteLastUpdated / siteLastPublished moved (assets have no timestamp of their own)", scope: "moved" });
  }
  for (const r of END) add({ ...r, scope: "end" });

  // Rough call count: one per file; page-code is one call; assets are two calls (197 assets).
  const calls = SIGNAL_CALLS.length + reads.length + (moved.site ? 1 : 0);
  const reasons = [];
  if (!pageChanged && !ixToRead.length && !moved.collections.length && !moved.registered && !moved.site) reasons.push("no signal moved: only styles, components and variables are re-read");
  return { mode: "partial", reasons, missingSignals: [], moved, reads, calls, base: { dump: manifest.dump, repoCommit: manifest.repoCommit, takenAt: manifest.takenAt }, pages };
}

const shown = (p) => {
  const r = path.relative(ROOT, path.resolve(p));
  return r && !r.startsWith("..") ? r : path.resolve(p);
};
/** Plain text of a plan, for the dump agent and the user. */
export function formatPlan(plan, partialDir) {
  const lines = [];
  const rel = shown(partialDir);
  if (plan.mode === "full") {
    lines.push("FULL DUMP REQUIRED (about 58 reads, see flint-reconcile skill):");
    for (const r of plan.reasons) lines.push(`- ${r}`);
    if (plan.rebuild) lines.push("- With no base there is nothing to compare: take the full dump, then `node scripts/webflow-snapshot.mjs <dump> --rebuild --yes`. WARNING: a rebuild resets the base; any Webflow edit made since the last sync is absorbed silently instead of reported.");
    return lines.join("\n");
  }
  if (plan.mode === "signals") {
    lines.push(`Step 1 of 2: save these ${plan.missingSignals.length} quick-check reads to ${rel}/, then run the plan again:`);
    for (const c of plan.missingSignals) lines.push(`- ${c.file}: ${c.tool} ${c.action} ${c.args}`.trimEnd());
    return lines.join("\n");
  }
  lines.push(`Base: dump ${plan.base.dump}, repo ${String(plan.base.repoCommit).slice(0, 7)}, taken ${plan.base.takenAt}.`);
  const m = plan.moved;
  const bits = [];
  if (m.pages.length) bits.push(`pages moved: ${m.pages.map((p) => p.file).join(", ")}`);
  if (m.added.length) bits.push(`pages added: ${m.added.map((p) => p.file).join(", ")}`);
  if (m.removed.length) bits.push(`pages removed: ${m.removed.join(", ")}`);
  if (m.interactions.length || m.interactionsAdded.length) bits.push(`interactions changed: ${[...m.interactions, ...m.interactionsAdded].map((i) => i.name).join(", ")}`);
  if (m.interactionsRemoved.length) bits.push(`interactions removed: ${m.interactionsRemoved.join(", ")}`);
  if (m.collections.length) bits.push(`collections moved: ${m.collections.map((c) => c.displayName).join(", ")}`);
  if (m.registered) bits.push("registered scripts moved");
  if (m.site) bits.push("site lastUpdated / lastPublished moved");
  lines.push(`Signals: ${bits.length ? bits.join("; ") : "none moved"}.`);
  lines.push(`Save these reads to ${rel}/ (the five signal files are already there), about ${plan.calls} calls in all:`);
  for (const r of plan.reads) {
    lines.push(`- [${r.scope}] ${r.file}: ${r.tool} ${r.action}${r.args ? ` (${r.args})` : ""}. ${r.why}`);
  }
  lines.push("Everything else is taken from the base's raw dump by `--compose`.");
  return lines.join("\n");
}

// ---- compose -------------------------------------------------------------------------------------------------------------
/**
 * Writes a complete raw dump to `outDir`. Throws an Error whose `.missing` lists absent reads, or whose message says why not.
 * @returns {{out: string, reused: string[], reread: string[], plan: object}}
 */
export function composeGate(partialDir, outDir, { baseDir = DEFAULT_DATA, fromDir, force = false } = {}) {
  const plan = planGate(partialDir, { baseDir, fromDir });
  if (plan.mode === "full") throw Object.assign(new Error(`a full dump is required:\n- ${plan.reasons.join("\n- ")}`), { code: "full" });
  if (plan.mode === "signals") throw Object.assign(new Error(formatPlan(plan, partialDir)), { code: "signals" });
  const base = loadBase(baseDir, fromDir);
  const partial = path.resolve(partialDir);
  const out = path.resolve(outDir);
  const baseRaw = base.dump;
  const missing = [];
  const has = (name) => fs.existsSync(path.join(partial, name));

  // The new page list and the edit-during-the-dump test.
  const siteBefore = resultOf(partial, "site-before.json");
  const siteAfter = resultOf(partial, "site-after.json");
  const pagesBefore = (resultOf(partial, "pages-before.json") ?? resultOf(partial, "pages.json")).pages;
  const pagesAfter = resultOf(partial, "pages-after.json")?.pages;
  if (!siteAfter) missing.push("site-after.json");
  if (!pagesAfter) missing.push("pages-after.json");
  const pages = pagesBefore.map((p) => ({ ...p, file: pageFile(p) }));
  const basePages = (resultOf(baseRaw, "pages.json")?.pages ?? []).map((p) => ({ ...p, file: pageFile(p) }));

  // Required reads, file by file.
  for (const r of plan.reads) {
    if (r.scope === "end") continue;
    if (!r.entries && !has(r.file)) missing.push(r.file);
    if (r.file === "assets-1.json" && has(r.file)) {
      // assets-2.json ... must exist as far as pagination.total says
      const first = resultOf(partial, "assets-1.json");
      const total = first?.pagination?.total ?? first?.assets?.length ?? 0;
      const need = Math.ceil(total / 100);
      for (let n = 2; n <= need; n++) if (!has(`assets-${n}.json`)) missing.push(`assets-${n}.json`);
    }
  }

  // Per-entry merges: page-code, interactions-full, cms-details.
  const codeWrappers = (dir) => (has2(dir, "page-code.json") ? wrappersOf(readJson(dir, "page-code.json")) : []);
  function has2(dir, name) {
    return fs.existsSync(path.join(dir, name));
  }
  const pageCodeOut = [];
  {
    const read = plan.reads.find((r) => r.file === "page-code.json");
    const newBy = new Map();
    for (const w of codeWrappers(partial)) {
      const page = pageForLabel(w.label, pages);
      if (page) newBy.set(`${w.action}:${page.id}`, w);
    }
    const oldBy = new Map();
    for (const w of codeWrappers(baseRaw)) {
      const page = pageForLabel(w.label, basePages);
      if (page) oldBy.set(`${w.action}:${page.id}`, w);
    }
    const wanted = new Set(read?.entries ?? []);
    for (const page of pages) {
      for (const action of ["get_page_scripts", "get_page_freeform_code"]) {
        const key = `${action}:${page.id}`;
        const fresh = newBy.get(key);
        if (wanted.has(page.file)) {
          if (!fresh) missing.push(`page-code.json: ${action} for ${page.file}`);
          else pageCodeOut.push(fresh);
        } else if (fresh) pageCodeOut.push(fresh);
        else if (oldBy.has(key)) pageCodeOut.push(oldBy.get(key));
        else missing.push(`page-code.json: ${action} for ${page.file} (not in the base dump either)`);
      }
    }
  }
  const ixOut = [];
  {
    const idOf = (w) => (Array.isArray(w.result) ? w.result[0]?.id : w.result?.id);
    const fresh = new Map(wrappersOf(has("interactions-full.json") ? readJson(partial, "interactions-full.json") : []).map((w) => [idOf(w), w]));
    const old = new Map(wrappersOf(readJson(baseRaw, "interactions-full.json") ?? []).map((w) => [idOf(w), w]));
    const list = objectResult(resultOf(partial, "interactions.json")).items;
    const wanted = new Set(plan.reads.find((r) => r.file === "interactions-full.json")?.entries ?? []);
    for (const i of list) {
      if (wanted.has(i.id)) {
        if (!fresh.has(i.id)) missing.push(`interactions-full.json: ${i.id} (${i.name})`);
        else ixOut.push(fresh.get(i.id));
      } else if (fresh.has(i.id)) ixOut.push(fresh.get(i.id));
      else if (old.has(i.id)) ixOut.push(old.get(i.id));
      else missing.push(`interactions-full.json: ${i.id} (${i.name}; not in the base dump either)`);
    }
  }
  const cmsOut = {};
  {
    const mapOf = (dir) => {
      const name = ["cms-details.json", "cms-collection-details.json"].find((n) => has2(dir, n));
      if (!name) return new Map();
      const raw = readJson(dir, name);
      const list = raw && !Array.isArray(raw) && !isWrapper(raw) && !raw.type ? Object.values(raw) : raw;
      return new Map(wrappersOf(list).map((w) => [w.result?.id, w]));
    };
    const fresh = mapOf(partial);
    const old = mapOf(baseRaw);
    const wanted = new Set(plan.reads.find((r) => r.file === "cms-details.json")?.entries ?? []);
    const list = resultOf(partial, "cms-collections.json").collections;
    for (const c of list) {
      const w = wanted.has(c.id) ? fresh.get(c.id) : (fresh.get(c.id) ?? old.get(c.id));
      if (!w) missing.push(`cms-details.json: collection ${c.id} (${c.displayName})`);
      else cmsOut[`detail-${c.slug}`] = w;
    }
  }

  // Page trees: the new page list decides which files exist.
  const treeSource = new Map();
  for (const page of pages) {
    const name = `tree-${page.file}.json`;
    if (has(name)) treeSource.set(name, path.join(partial, name));
    else if (has2(baseRaw, name) && !plan.moved.pages.some((p) => p.id === page.id) && !plan.moved.added.some((p) => p.id === page.id)) treeSource.set(name, path.join(baseRaw, name));
    else missing.push(name);
  }
  if (missing.length) {
    throw Object.assign(new Error(`these reads are missing from ${shown(partial)} (run --plan again for the calls):\n- ${[...new Set(missing)].join("\n- ")}`), { code: "missing", missing });
  }
  if (!same(siteBefore.lastUpdated, siteAfter.lastUpdated) || !same(siteBefore.lastPublished, siteAfter.lastPublished)) {
    throw Object.assign(new Error(`site lastUpdated / lastPublished moved during the gate dump (${siteBefore.lastUpdated} -> ${siteAfter.lastUpdated}): someone edited or published. Repeat the dump.`), { code: "edited" });
  }
  if (!same(pagesBefore.map((p) => [p.id, p.lastUpdated]), pagesAfter.map((p) => [p.id, p.lastUpdated]))) {
    throw Object.assign(new Error("a page lastUpdated moved between pages-before.json and pages-after.json: someone edited during the dump. Repeat it."), { code: "edited" });
  }

  // Write.
  if (fs.existsSync(out) && fs.readdirSync(out).length) {
    if (!force) throw Object.assign(new Error(`${path.relative(ROOT, out) || out} already exists; pass --force to replace it`), { code: "exists" });
    fs.rmSync(out, { recursive: true, force: true });
  }
  fs.mkdirSync(out, { recursive: true });
  const reused = [];
  const reread = [];
  const put = (name, srcFile, from) => {
    fs.copyFileSync(srcFile, path.join(out, name));
    (from === "base" ? reused : reread).push(name);
  };
  const putJson = (name, value, from) => {
    fs.writeFileSync(path.join(out, name), JSON.stringify(value));
    (from === "base" ? reused : reread).push(name);
  };
  // Always from the partial dir.
  for (const n of ["site-before.json", "site-after.json", "pages-after.json", "interactions.json", "cms-collections.json", "styles.json", "components.json", "component-trees.json", "variables.json"]) put(n, path.join(partial, n), "partial");
  const pagesFile = has("pages-before.json") ? "pages-before.json" : "pages.json";
  put("pages-before.json", path.join(partial, pagesFile), "partial");
  put("pages.json", path.join(partial, pagesFile), "partial");
  // From the partial dir when supplied, else the base.
  for (const n of COPY_FROM_BASE) {
    if (has(n)) put(n, path.join(partial, n), "partial");
    else put(n, path.join(baseRaw, n), "base");
  }
  const partialAssets = fs.readdirSync(partial).filter((f) => /^assets-\d+\.json$/.test(f));
  const assetSource = partialAssets.length ? partial : baseRaw;
  for (const f of fs.readdirSync(assetSource).filter((f) => /^assets-\d+\.json$/.test(f))) put(f, path.join(assetSource, f), partialAssets.length ? "partial" : "base");
  for (const [name, src] of treeSource) put(name, src, src.startsWith(partial) ? "partial" : "base");
  putJson("page-code.json", pageCodeOut, "partial");
  putJson("interactions-full.json", ixOut, "partial");
  putJson("cms-details.json", cmsOut, "partial");
  fs.writeFileSync(path.join(out, "COMPOSED.txt"), `A reconcile gate dump, assembled by scripts/webflow-gate.mjs --compose.\nBase raw dump: ${path.relative(ROOT, baseRaw) || baseRaw}\nPartial reads: ${shown(partial)}\nTaken from the base: ${reused.sort().join(", ")}\nRe-read: ${reread.sort().join(", ")}\n`);
  return { out, reused: reused.sort(), reread: reread.sort(), plan };
}
