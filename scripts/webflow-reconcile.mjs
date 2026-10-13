#!/usr/bin/env node
// The reconcile: compares a new Webflow dump with the base snapshot (what Webflow was at the last sync) and
// with the repo (what changed there since), and writes the changes report. Offline: no Webflow MCP call, no
// file outside --out is written. See docs/webflow/plans/reconcile.md and docs/webflow/snapshot/README.md
// ("Reconcile report").
// Usage: node scripts/webflow-reconcile.mjs <new-dump-dir> [--base <snapshot dir>] [--base-map <map dir>]
//          [--out <report.md>] [--json] [--date YYYY-MM-DD] [--quiet]
//   <new-dump-dir> is a raw dump (.cache/webflow-dump/<UTC>/, checked and normalised first; the run is
//   refused when the check fails) or an already normalised snapshot folder (it has a manifest.json).
//   --base      the base snapshot (default docs/webflow/snapshot/data); its manifest names the repo commit.
//   --base-map  the id map of the base (default <base>/map).
//   --out       the report (default docs/webflow/reconcile/<date>.md); --json also writes <out>.json.
// Exit code 0 when the report was written, 2 when the run is refused.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildMaps, loadMaps } from "./reconcile/build-map.mjs";
import { diffSnapshots } from "./reconcile/diff.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { renderMarkdown } from "./reconcile/report.mjs";
import { startRenderer } from "./reconcile/repo-render.mjs";
import { Rows } from "./reconcile/rows.mjs";
import { changedSince, commitReachable, exportCommit, flatKey, git, parseTokens, readNow, repoStyles, showFile, snapshotStyles, styleFiles } from "./reconcile/repo-state.mjs";
import { DEFAULT_DATA, loadSnapshot } from "./reconcile/snapshot-io.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const VALUE_FLAGS = new Set(["--base", "--base-map", "--out", "--date"]);
const positional = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(args[i - 1]));
const quiet = args.includes("--quiet");
const refuse = (msg) => {
  console.error(`Refused: ${msg}`);
  process.exit(2);
};
if (positional.length !== 1) refuse("usage: node scripts/webflow-reconcile.mjs <new-dump-dir> [--base <dir>] [--base-map <dir>] [--out <report.md>] [--json] [--date YYYY-MM-DD]");

const date = opt("--date") ?? new Date().toISOString().slice(0, 10);
const outFile = path.resolve(ROOT, opt("--out") ?? `docs/webflow/reconcile/${date}.md`);
const baseDir = path.resolve(opt("--base") ?? DEFAULT_DATA);
const baseMapDir = path.resolve(opt("--base-map") ?? path.join(baseDir, "map"));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "flint-reconcile-run-"));
const cleanups = [() => fs.rmSync(scratch, { recursive: true, force: true })];
const finish = (code) => {
  for (const c of cleanups) c();
  process.exit(code);
};
process.on("SIGINT", () => finish(130));

// 1. The new dump: normalise (after the check) unless it already is a snapshot.
if (!fs.existsSync(baseDir)) refuse(`no base snapshot at ${baseDir} (build one: node scripts/webflow-snapshot.mjs <dump> --rebuild; that resets the base)`);
const base = loadSnapshot(baseDir);
const commit = base.manifest.repoCommit;
let newDir = path.resolve(positional[0]);
if (!fs.existsSync(path.join(newDir, "manifest.json"))) {
  const snapshotScript = path.join(path.dirname(new URL(import.meta.url).pathname), "webflow-snapshot.mjs");
  try {
    execFileSync("node", [snapshotScript, newDir, "--check"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    console.error(`${e.stdout ?? ""}${e.stderr ?? ""}`);
    refuse(`the dump ${newDir} failed webflow-snapshot.mjs --check`);
  }
  const out = path.join(scratch, "new");
  execFileSync("node", [snapshotScript, newDir, "--out", out, "--commit", commit], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  newDir = out;
}
const nw = loadSnapshot(newDir);
if (nw.manifest.siteId !== base.manifest.siteId) refuse(`the new dump is for site ${nw.manifest.siteId}, the base for ${base.manifest.siteId}`);
if (!commit || !commitReachable(commit)) refuse(`the base commit ${commit} is not reachable in this repo: the repo side cannot be computed. Rebuild the base (webflow-snapshot.mjs --rebuild) after a reconcile.`);

// 2. Webflow side.
const changes = diffSnapshots(base, nw);

// 3. Repo side: what changed in src/ since the commit the base matched (committed or not).
const srcFiles = changedSince(commit, ["src"]);
const srcChanged = srcFiles.length > 0;
const head = git(["rev-parse", "HEAD"])?.trim() ?? "";
const srcDirty = (git(["status", "--porcelain", "--", "src"]) ?? "").trim().length > 0;
let baseMaps = fs.existsSync(baseMapDir) ? loadMaps(baseMapDir) : null;
let mapNote = "";
if (baseMaps) {
  const stale = Object.values({ ...baseMaps.pages, ...baseMaps.components }).some((m) => m.header.snapshotRepoCommit !== commit);
  if (stale || !Object.keys(baseMaps.pages).length) {
    baseMaps = null;
    mapNote = "the stored map does not belong to this base (other commit or empty): rebuilt";
  }
}
let nowMaps = null;
let newMaps = null;
if (srcChanged || !baseMaps) {
  const renderer = await startRenderer();
  try {
    nowMaps = await buildMaps(base, renderer);
    if (srcChanged) newMaps = await buildMaps(nw, renderer);
  } finally {
    await renderer.close();
  }
  if (!baseMaps) baseMaps = srcChanged ? { pages: {}, components: {} } : nowMaps;
  mapNote ||= srcChanged ? `built from the working tree against the base snapshot (${srcFiles.length} src file(s) changed)${Object.keys(baseMaps.pages).length ? ", base values from the stored map" : ", no stored base map: base values taken from Webflow's base"}` : "built now (no stored map)";
} else mapNote = `stored map \`${path.relative(ROOT, baseMapDir) || baseMapDir}\` (src unchanged since the base, so locations are current)`;
const locMaps = nowMaps ?? baseMaps;

// CSS and tokens at both states.
const files = styleFiles(ROOT);
const varNames = {};
const addVars = (vars) => {
  for (const [name, v] of Object.entries(vars)) varNames[v.id] = name;
};
addVars(base.variables);
addVars(nw.variables);
const idsNow = JSON.parse(readNow("docs/webflow/webflow-ids.json") ?? "{}");
for (const [name, id] of Object.entries(idsNow.variables ?? {})) varNames[id] ??= name;
const stylesChanged = changedSince(commit, ["src/styles", "scripts/webflow-style-actions.mjs", "docs/webflow/webflow-ids.json"]).length > 0;
const r1 = repoStyles(ROOT, varNames);
let r0 = r1;
if (stylesChanged) {
  const dir = exportCommit(commit, ["scripts/webflow-style-actions.mjs", "docs/webflow/webflow-ids.json", "src/styles"]);
  cleanups.push(() => fs.rmSync(dir, { recursive: true, force: true }));
  const idsThen = JSON.parse(fs.readFileSync(path.join(dir, "docs/webflow/webflow-ids.json"), "utf8"));
  for (const [name, id] of Object.entries(idsThen.variables ?? {})) varNames[id] ??= name;
  r0 = repoStyles(dir, varNames);
}
const tokens = { r0: parseTokens(showFile(commit, "src/styles/tokens.css")), r1: parseTokens(readNow("src/styles/tokens.css")) };
if (!stylesChanged) tokens.r0 = tokens.r1;

const accepted = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "docs/webflow/snapshot/accepted.json"), "utf8")).style.map((s) => s.line));
const wfNewStyles = snapshotStyles(nw.styles);
const webflowStyleKeys = new Set();
const webflowChangeKeys = new Set();
const webflowVarNames = new Set();
for (const c of changes) {
  if (c.area === "style") {
    if (c.field === "added" || c.field === "removed") webflowStyleKeys.add(`${c.where}\u0000*`);
    else {
      webflowStyleKeys.add(flatKey(c.where, c.bp, c.pseudo, c.field));
      if (c.field === "overflow") for (const p of ["overflow-x", "overflow-y"]) webflowStyleKeys.add(flatKey(c.where, c.bp, c.pseudo, p));
    }
  }
  if (c.area === "element") webflowChangeKeys.add(`${c.where}|${c.id}|${c.field}`);
  if (c.area === "variable") {
    webflowVarNames.add(c.where.replace(/\./g, "-"));
    if (c.field === "name") webflowVarNames.add(String(c.base).replace(/\./g, "-"));
  }
}
// A whole-style add / remove covers every property key of the selector.
const wholeSelectors = new Set([...webflowStyleKeys].filter((k) => k.endsWith("\u0000*")).map((k) => k.slice(0, -2)));
if (wholeSelectors.size) for (const k of [...r0.keys(), ...r1.keys()]) if (wholeSelectors.has(k.split("\u0000")[0])) webflowStyleKeys.add(k);

const ctx = {
  base, nw, commit, srcChanged, baseMaps, nowMaps, newMaps, locMaps, css: { r0, r1 }, files, tokens, accepted, wfNewStyles,
  webflowStyleKeys, webflowChangeKeys, webflowVarNames, git, changedPaths: (p) => changedSince(commit, [p]),
};

// 4. Rows.
const rows = new Rows(ctx);
const of = (a) => changes.filter((c) => c.area === a);
rows.elements(of("element"));
rows.styles(of("style"));
rows.variables(of("variable"));
rows.components(of("component"));
rows.pageRows(of("page"));
rows.interactions(of("interaction"));
rows.assets(of("asset"));
rows.siteRows([...of("site"), ...of("cms")]);
rows.elementsRepoAhead();
if (stylesChanged) {
  rows.stylesRepoAhead();
  rows.tokensRepoAhead();
}
const list = rows.finish();

// Signals: noise by themselves, kept as a footer.
const pageName = Object.fromEntries(Object.values(nw.pages).concat(Object.values(base.pages)).map((p) => [p.pageId, p.file]));
for (const c of changes.filter((x) => x.area === "signal" || x.area === "manifest")) {
  const f = c.field.replace(/^(pageLastUpdated|pageScriptsLastUpdated)\.(\w+)$/, (_, k, id) => `${k}.${pageName[id] ?? id}`);
  rows.footer.signals.push(`${c.area === "manifest" ? "dump gap" : "signal"} ${f}: ${JSON.stringify(c.base)} → ${JSON.stringify(c.new)}`);
}

const counts = { PULL: 0, CONFLICT: 0, CONVERGED: 0, "REPO AHEAD": 0 };
for (const r of list) counts[r.direction]++;
const result = {
  schema: 1,
  meta: {
    date,
    base: { dump: base.manifest.dump, takenAt: base.manifest.takenAt, repoCommit: commit },
    new: { dump: nw.manifest.dump, takenAt: nw.manifest.takenAt },
    repo: { head, srcDirty, srcChangedFiles: srcFiles.length, srcFiles: srcFiles.slice(0, 200), stylesChanged, mapNote },
  },
  counts,
  rows: list,
  footer: rows.footer,
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, renderMarkdown(result));
if (args.includes("--json")) fs.writeFileSync(outFile.replace(/\.md$/, "") + ".json", `${JSON.stringify(result, null, 1)}\n`);
if (!quiet) {
  console.log(`Report ${path.relative(ROOT, outFile) || outFile}: ${list.length} row(s) ${JSON.stringify(counts)}; src ${srcChanged ? `changed (${srcFiles.length} files)` : "unchanged"}`);
}
finish(0);
