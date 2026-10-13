// Tests for the reconcile tools (scripts/webflow-map.mjs, scripts/webflow-tree-diff-ids.mjs,
// scripts/webflow-reconcile.mjs).
// Run: node --test scripts/test-reconcile.mjs
// Reads .cache/webflow-dump/ (gitignored) and docs/webflow/snapshot/data/; a test skips with a message
// when its input is absent. Writes only to a temp folder (scratch git worktrees included, removed at the end);
// never into docs/webflow/reconcile/.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { decode } from "./reconcile/html.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { diffDirs, diffSnapshots } from "./reconcile/diff.mjs";
import { DEFAULT_DATA, loadSnapshot } from "./reconcile/snapshot-io.mjs";
import { addDeclaration, addRules, addToken, cssFromWebflow, removeDeclaration, replaceClass, replaceInLine, setDeclaration, setToken, setTokenDoc } from "./reconcile/edit-ops.mjs";
import { parseRows } from "./reconcile/rowspec.mjs";

const BEFORE = path.join(ROOT, ".cache/webflow-dump/20261011T194658Z");
const AFTER = path.join(ROOT, ".cache/webflow-dump/20261011T223401Z");
const have = (p, what) => (fs.existsSync(p) ? false : `missing ${what} (${path.relative(ROOT, p)}); rebuild it with webflow-snapshot.mjs`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "flint-reconcile-"));
const node = (...a) => execFileSync("node", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// ---- (a) the known Designer edits of phase 2 step (d) -----------------------------------------
test("diff finds every known change of phase 2 step (d)", { skip: have(BEFORE, "dump 20261011T194658Z") || have(AFTER, "dump 20261011T223401Z") }, () => {
  const b = path.join(tmp, "before");
  const a = path.join(tmp, "after");
  node("scripts/webflow-snapshot.mjs", BEFORE, "--out", b, "--commit", "68829d4");
  node("scripts/webflow-snapshot.mjs", AFTER, "--out", a, "--commit", "68829d4");
  const { changes } = diffDirs(b, a);
  const find = (f) => changes.filter(f);
  const one = (label, list) => {
    assert.equal(list.length, 1, `${label}: expected 1 change, got ${list.length}`);
    return list[0];
  };
  const used = new Set();
  const take = (label, f) => {
    const c = one(label, find(f));
    used.add(c);
    return c;
  };

  let c = take("Home text", (x) => x.area === "element" && x.id === "8a16145e-ee69-d410-8c15-f94add50aa78" && x.field === "text");
  assert.deepEqual([c.base, c.new, c.where], ["Why Flint is free?", "Why is Flint free?", "page:home"]);

  c = take("Facility partners class", (x) => x.id === "856210ce-e333-114f-bf85-ec97d3823b1b" && x.field === "classes");
  assert.ok(c.base.includes("fk-bg-white") && !c.base.includes("fk-bg-brand"));
  assert.ok(c.new.includes("fk-bg-brand") && !c.new.includes("fk-bg-white"));
  assert.equal(c.where, "page:facility-partners");

  c = take("variable space-4.5", (x) => x.area === "variable" && x.where === "space-4.5");
  assert.deepEqual([c.field, c.new.value], ["added", { unit: "px", value: 18 }]);

  for (const prop of ["padding-top", "padding-bottom"]) {
    c = take(`.fk-input-field ${prop}`, (x) => x.area === "style" && x.where === ".fk-input-field" && x.field === prop);
    assert.deepEqual([c.base, c.new, c.bp, c.pseudo], ["0px", "var(space-2)", "main", "noPseudo"]);
  }
  c = take(".fk-input-field transition removed", (x) => x.area === "style" && x.where === ".fk-input-field" && x.field === "transition");
  assert.ok(c.base && c.new === null);
  take("new class .fk-input-container", (x) => x.area === "style" && x.where === ".fk-input-container" && x.field === "added");
  take("new class .fk-input-field-label", (x) => x.area === "style" && x.where === ".fk-input-field-label" && x.field === "added");

  // Input Field rebuilt: props renamed, ID added, root container, label and field div, button moved out.
  const inputId = "e7a87f07-0d64-7333-a929-de8fbcc186fc";
  take("Input Field prop Label -> Placeholder", (x) => x.area === "component" && x.id === inputId && x.field.endsWith(".name") && x.base === "Label" && x.new === "Placeholder");
  take("Input Field prop Button Label -> Label", (x) => x.area === "component" && x.id === inputId && x.field.endsWith(".name") && x.base === "Button Label" && x.new === "Label");
  take("Input Field new prop ID", (x) => x.area === "component" && x.id === inputId && x.field.startsWith("props[") && x.base === null && x.new?.name === "ID");
  c = take("Input Field root classes", (x) => x.where === "component:input-field" && x.id === inputId && x.field === "classes");
  assert.deepEqual(c.new, ["fk-input-container"]);
  assert.ok(find((x) => x.where === "component:input-field" && x.field === "added").length >= 2, "new label and field div");
  assert.ok(find((x) => x.where === "component:input-field" && x.field === "removed").length >= 1, "button removed");
  assert.ok(find((x) => x.where === "component:input-field" && x.field === "moved").length >= 1, "input moved into the field div");
  for (const x of find((x) => x.where === "component:input-field" || x.id === inputId)) used.add(x);

  // New Newsletter Form component; Newsletter and the Posts template swap their form for an instance of it.
  c = take("Newsletter Form component added", (x) => x.area === "component" && x.where === "component:newsletter-form" && x.field === "added");
  assert.equal(c.new.name, "Newsletter Form");
  const inst = find((x) => (x.where === "component:newsletter" || x.where === "page:template-posts") && x.field === "added" && x.new?.t === "ComponentInstance" && x.new?.i?.name === "Newsletter Form");
  assert.deepEqual(inst.map((x) => x.where).sort(), ["component:newsletter", "page:template-posts"]);
  for (const x of find((x) => x.where === "component:newsletter" || x.where === "page:template-posts")) used.add(x);

  c = take("Style guide Input Field ID", (x) => x.where === "page:style-guide" && x.field === "prop.ID");
  assert.deepEqual([c.base, c.new], [null, "email-field"]);

  // Everything else must be explainable. Print it so the report can list it.
  const extras = changes.filter((x) => !used.has(x));
  const allowed = (x) =>
    x.area === "signal" ||
    (x.area === "manifest" && x.where === "gaps") ||
    (x.area === "cms" && x.field === "fields") || // the second dump carries the CMS field schemas
    (x.area === "component" && x.id === inputId && x.field === "description");
  const unexplained = extras.filter((x) => !allowed(x));
  console.log(`known changes found: ${used.size}; explainable extras: ${extras.length - unexplained.length} (${[...new Set(extras.map((x) => `${x.area}:${x.field}`))].join(", ")})`);
  assert.deepEqual(unexplained.map((x) => `${x.area} ${x.where} ${x.field}`), []);
});

// ---- (b) a snapshot against itself --------------------------------------------------------------
test("a snapshot against itself has zero changes", { skip: have(DEFAULT_DATA, "baseline snapshot data/") }, () => {
  assert.deepEqual(diffDirs(DEFAULT_DATA, DEFAULT_DATA).changes, []);
});

// ---- synthetic edits on the baseline: text, add, remove, move, text re-created ---------------------
test("diff reports text, added, removed, moved and re-created text runs", { skip: have(DEFAULT_DATA, "baseline snapshot data/") }, () => {
  const base = loadSnapshot(DEFAULT_DATA);
  const edited = loadSnapshot(DEFAULT_DATA);
  const els = edited.pages.about.elements;
  const strings = els.filter((e) => e.t === "String" && e.x.trim());
  const [s1, s2] = strings;
  s1.x = `${s1.x} (edited)`;
  const removed = els.splice(els.findIndex((e) => e.id === strings[5].p), 1)[0]; // an element with its own children left behind
  const parent = els.find((e) => e.t === "Block" && e.c?.includes("fk-container"));
  els.push({ id: "new-block-1", p: parent.id, t: "Block", c: ["fk-flex"], s: { tag: "div" } });
  // text re-created: s2 gets a new id under the same parent
  s2.id = "recreated-string-1";
  // move: the last two children of one parent swap
  const sibs = els.filter((e) => e.p === parent.id && e.id !== "new-block-1");
  if (sibs.length >= 2) {
    const i = els.indexOf(sibs[0]);
    const j = els.indexOf(sibs[1]);
    [els[i], els[j]] = [els[j], els[i]];
  }
  const changes = diffSnapshots(base, { ...edited, pages: { ...edited.pages, about: { ...edited.pages.about, elements: els } } });
  const f = (field) => changes.filter((c) => c.field === field);
  assert.ok(f("text").some((c) => c.id === s1.id && c.new.endsWith("(edited)")), "text edit");
  assert.ok(f("removed").some((c) => c.id === removed.id), "removed element");
  assert.ok(f("added").some((c) => c.id === "new-block-1"), "added element");
  assert.ok(f("text").some((c) => c.idChanged && c.newId === "recreated-string-1"), "re-created text run is one text change with idChanged");
  assert.ok(sibs.length < 2 || f("moved").length >= 1, "a swap is a move");
});

// ---- (c) the id map on the baseline -------------------------------------------------------------
test("map: coverage, determinism and spot-check", { skip: have(DEFAULT_DATA, "baseline snapshot data/"), timeout: 180000 }, () => {
  const m1 = path.join(tmp, "map1");
  const m2 = path.join(tmp, "map2");
  const out = node("scripts/webflow-map.mjs", "--out", m1);
  console.log(out.split("\n").filter((l) => /^(page|component|TOTAL)/.test(l)).join("\n"));
  node("scripts/webflow-map.mjs", "--out", m2, "--quiet");
  for (const d of ["pages", "components"])
    for (const f of fs.readdirSync(path.join(m1, d))) assert.equal(fs.readFileSync(path.join(m1, d, f), "utf8"), fs.readFileSync(path.join(m2, d, f), "utf8"), `map is not deterministic: ${d}/${f}`);

  const snap = loadSnapshot(DEFAULT_DATA);
  const texts = [];
  let total = 0;
  let mapped = 0;
  for (const d of ["pages", "components"])
    for (const f of fs.readdirSync(path.join(m1, d))) {
      const j = JSON.parse(fs.readFileSync(path.join(m1, d, f), "utf8"));
      total += j.total;
      mapped += j.mapped;
      for (const [id, e] of Object.entries(j.elements)) if (e.k === "text" && e.locate === "literal" && !e.repoText) texts.push({ map: `${d}/${f}`, id, ...e });
      // every mapped id exists in the snapshot tree
      const tree = (d === "pages" ? snap.pages : snap.components)[f.slice(0, -5)];
      for (const id of Object.keys(j.elements)) assert.ok(tree.byId.has(id), `${f}: mapped id ${id} is not in the snapshot`);
    }
  assert.ok(mapped / total > 0.95, `coverage ${(100 * mapped / total).toFixed(1)}% is below 95%`);

  // Deterministic "random" sample: 10 evenly spaced text entries.
  const step = Math.floor(texts.length / 10);
  const sample = Array.from({ length: 10 }, (_, i) => texts[i * step + 3]);
  console.log("spot-check (map id -> file:line):");
  for (const t of sample) {
    const lines = fs.readFileSync(path.join(ROOT, t.file), "utf8").split("\n");
    const window = decode(lines.slice(t.line - 1, t.line + 4).join(" ")).replace(/\{" "\}/g, " ").replace(/\s+/g, " ");
    const words = t.text.replace(/\s+/g, " ").slice(0, 18).trim();
    console.log(`  ${t.id.slice(0, 8)} ${t.file}:${t.line}  ${JSON.stringify(t.text.slice(0, 50))}  ${window.includes(words) ? "ok" : "MISMATCH"}`);
    assert.ok(window.includes(words), `${t.file}:${t.line} does not contain ${JSON.stringify(words)}`);
  }
});

// ---- reconcile (webflow-reconcile.mjs): three-way rows --------------------------------------------
const worktrees = [];
/** A scratch checkout of `rev` that the tools can treat as the repo (FLINT_ROOT), with node_modules linked. */
function scratchRepo(name, rev, { trace = false } = {}) {
  const wt = path.join(tmp, name);
  execFileSync("git", ["worktree", "add", "--detach", wt, rev], { cwd: ROOT, stdio: "ignore" });
  worktrees.push(wt);
  fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(wt, "node_modules"));
  if (trace) fs.cpSync(path.join(ROOT, "scripts/reconcile/jsx-trace"), path.join(wt, "scripts/reconcile/jsx-trace"), { recursive: true });
  return wt;
}
const reconcile = (dump, out, extra = [], env = {}) => {
  execFileSync("node", ["scripts/webflow-reconcile.mjs", dump, "--out", out, "--json", "--date", "2026-01-01", "--quiet", ...extra], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
  return JSON.parse(fs.readFileSync(out.replace(/\.md$/, ".json"), "utf8"));
};
const rowsOf = (rep, f) => rep.rows.filter(f);
const breakdown = (rep) => Object.fromEntries(Object.entries(rep.counts));
const reconcileDirExisted = fs.existsSync(path.join(ROOT, "docs/webflow/reconcile"));
const DUMP_NOW = path.join(ROOT, ".cache/webflow-dump/20261013T023829Z");
const gitOk = (args) => {
  try {
    execFileSync("git", args, { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

test("reconcile (a): historical three-way, dumps of 2026-10-11 against the repo now", { skip: have(BEFORE, "dump 20261011T194658Z") || have(AFTER, "dump 20261011T223401Z") || (gitOk(["cat-file", "-e", "68829d449d8de184568783e27f9e8e10a942d3aa^{commit}"]) ? false : "commit 68829d4 not reachable"), timeout: 300000 }, () => {
  // The map of that base needs the repo as it was then: a scratch checkout of 68829d4.
  const old = scratchRepo("wt-68829d4", "68829d449d8de184568783e27f9e8e10a942d3aa", { trace: true });
  const base = path.join(tmp, "hist-base");
  node("scripts/webflow-snapshot.mjs", BEFORE, "--out", base, "--commit", "68829d449d8de184568783e27f9e8e10a942d3aa");
  execFileSync("node", ["scripts/webflow-map.mjs", "--data", base, "--out", path.join(tmp, "hist-map"), "--quiet"], { cwd: ROOT, env: { ...process.env, FLINT_ROOT: old }, stdio: "ignore" });
  const rep = reconcile(AFTER, path.join(tmp, "hist.md"), ["--base", base, "--base-map", path.join(tmp, "hist-map")]);
  console.log(`historical three-way: ${JSON.stringify(breakdown(rep))}; src files changed since 68829d4: ${rep.meta.repo.srcChangedFiles}`);
  const dir = (f) => {
    const r = rowsOf(rep, f);
    assert.equal(r.length, 1, `expected one row, got ${r.length}`);
    return r[0];
  };
  // Pulled into the repo since (commit b631643): converged.
  assert.equal(dir((r) => r.ref?.id === "8a16145e-ee69-d410-8c15-f94add50aa78" && r.ref.field === "text").direction, "CONVERGED");
  assert.equal(dir((r) => r.ref?.area === "variable" && r.where === "space-4.5").direction, "CONVERGED");
  for (const prop of ["padding-top", "padding-bottom"]) assert.equal(dir((r) => r.where === ".fk-input-field" && r.ref?.field === prop).direction, "CONVERGED");
  assert.equal(dir((r) => r.where === ".fk-input-container" && r.ref?.field === "added").direction, "CONVERGED");
  assert.equal(dir((r) => r.where === ".fk-input-field-label" && r.ref?.field === "added").direction, "CONVERGED");
  assert.equal(dir((r) => r.where === "component:newsletter-form" && r.ref?.field === "added").direction, "CONVERGED");
  // The Input Field rebuild and the Newsletter Form extraction are one restructure row per parent, already in the repo.
  const re = rowsOf(rep, (r) => r.sub === "restructure");
  assert.deepEqual(re.map((r) => [r.where, r.direction, r.members.length]).sort(), [["component:input-field", "CONVERGED", 4], ["component:newsletter", "CONVERGED", 2], ["page:template-posts", "CONVERGED", 2]]);
  assert.equal(rowsOf(rep, (r) => r.area === "Elements" && ["removed", "added", "moved"].includes(r.ref?.field)).length, 0, "no stray add / remove / move rows: they sit in the restructure rows");
  // Input Field: the id is bound to the ID prop (not a change), the description and the prop default follow the repo.
  assert.ok(rep.footer.bound.some((b) => b.includes("attr.id")), "attr.id is a bound domId, not a change");
  assert.equal(dir((r) => r.where === "component:input-field" && r.ref?.field === "description").direction, "CONVERGED");
  assert.equal(dir((r) => r.where === "component:input-field" && r.ref?.field?.endsWith(".default")).direction, "CONVERGED");
  // Style guide: the heavily restructured page pairs unrelated strings; those pairs are dropped, not reported as repo-ahead text.
  assert.equal(rowsOf(rep, (r) => r.where === "page:style-guide" && r.sub === "text").length, 0);
  assert.ok(rep.footer.misaligned.length >= 2, "the two misaligned Style guide pairs are listed in the footer");
  // Webflow edits the user then decided not to keep (restored on Webflow later): the repo never took them, so still PULL.
  const facility = dir((r) => r.ref?.id === "856210ce-e333-114f-bf85-ec97d3823b1b" && r.ref.field === "classes");
  assert.deepEqual([facility.direction, facility.mode, facility.edit.file], ["PULL", "auto", "src/sections/FacilityValueProp.tsx"]);
  assert.equal(dir((r) => r.where === ".fk-input-field" && r.ref?.field === "transition").direction, "PULL");
  // What is left to pull, and why: the autocomplete the rebuilt template dropped, the transition and the Facility class
  // (restored on Webflow later), the Style guide ID override (an instance the repo renders as plain markup, D-67) and the prop
  // rename Label -> Placeholder (the repo has both props; superseded later).
  const todo = rowsOf(rep, (r) => r.direction === "PULL" || r.direction === "CONFLICT").map((r) => `${r.where} ${r.ref?.field ?? r.sub}`).sort();
  assert.deepEqual(todo, [
    ".fk-input-field transition",
    "component:input-field attr.autocomplete",
    `component:input-field ${rowsOf(rep, (r) => r.sub === "props[].name" && r.direction === "PULL")[0].ref.field}`,
    "page:facility-partners classes",
    "page:style-guide prop.ID",
  ].sort());
  // Repo ahead beyond styles: a removed prop, a new component file, page sections, the preview runtime.
  assert.ok(rowsOf(rep, (r) => r.direction === "REPO AHEAD" && r.area === "Components" && r.where === "component:select-field").length === 1);
  assert.ok(rowsOf(rep, (r) => r.direction === "REPO AHEAD" && r.area === "Pages" && r.where === "page:style-guide").length >= 3);
  // Nothing is written outside tmp.
  assert.equal(fs.existsSync(path.join(ROOT, "docs/webflow/reconcile")), reconcileDirExisted);
  for (const d of ["PULL", "CONFLICT", "CONVERGED", "REPO AHEAD"]) console.log(`  ${d}: ${rowsOf(rep, (r) => r.direction === d).map((r) => `#${r.n} ${r.where} ${r.sub}`).join("; ")}`);
});

test("reconcile (b): the current baseline against its own dump has nothing to pull", { skip: have(DEFAULT_DATA, "baseline snapshot data/") || have(DUMP_NOW, "dump 20261013T023829Z") || (loadSnapshotManifest().dump.endsWith("20261013T023829Z") ? false : "baseline is another dump") }, () => {
  const rep = reconcile(DUMP_NOW, path.join(tmp, "now.md"));
  const srcChanged = rep.meta.repo.srcChangedFiles;
  console.log(`baseline vs its dump: ${JSON.stringify(breakdown(rep))}; src files changed since the base commit: ${srcChanged}`);
  assert.equal(rep.counts.PULL + rep.counts.CONFLICT, 0, "nothing to pull from Webflow");
  assert.equal(rep.counts.CONVERGED, 0);
  if (srcChanged === 0) assert.equal(rep.counts["REPO AHEAD"], 0, "src/ is unchanged since the base commit, so the repo cannot be ahead");
});

function loadSnapshotManifest() {
  return JSON.parse(fs.readFileSync(path.join(DEFAULT_DATA, "manifest.json"), "utf8"));
}

test("reconcile (c): synthetic edits on both sides give PULL, CONFLICT, CONVERGED and REPO AHEAD with file:line", { skip: have(DEFAULT_DATA, "baseline snapshot data/") || have(path.join(DEFAULT_DATA, "map"), "baseline map") || (gitOk(["rev-parse", "HEAD"]) ? false : "no git"), timeout: 300000 }, () => {
  const maps = (kind, slug) => JSON.parse(fs.readFileSync(path.join(DEFAULT_DATA, "map", kind, `${slug}.json`), "utf8")).elements;
  const wt = scratchRepo("wt-synthetic", "HEAD");
  const nw = path.join(tmp, "synthetic-new");
  fs.cpSync(DEFAULT_DATA, nw, { recursive: true, filter: (src) => !src.includes(`${path.sep}map`) });

  // Webflow side: edit raw values of the copy.
  const editElement = (file, id, fn) => {
    const f = path.join(nw, "pages", `${file}.json`);
    const lines = fs.readFileSync(f, "utf8").split("\n");
    const i = lines.findIndex((l) => l.startsWith("{\"id\":\"" + id + "\""));
    assert.ok(i >= 0, `${id} not in ${file}`);
    const comma = lines[i].endsWith(",");
    const obj = JSON.parse(comma ? lines[i].slice(0, -1) : lines[i]);
    fn(obj);
    lines[i] = JSON.stringify(obj) + (comma ? "," : "");
    fs.writeFileSync(f, lines.join("\n"));
  };
  const repoEdit = (rel, from, to) => {
    const f = path.join(wt, rel);
    const text = fs.readFileSync(f, "utf8");
    assert.ok(text.includes(from), `${rel} lacks ${JSON.stringify(from)}`);
    fs.writeFileSync(f, text.replace(from, to));
  };
  const lineOf = (rel, needle) => fs.readFileSync(path.join(wt, rel), "utf8").split("\n").findIndex((l) => l.includes(needle)) + 1;

  // 1. CONFLICT: the Pricing title edited on both sides, to different text.
  const PRICING = "8a16145e-ee69-d410-8c15-f94add50aa78";
  editElement("home", PRICING, (o) => (o.x = "Why does Flint charge nothing?"));
  repoEdit("src/sections/Pricing.tsx", "Why is Flint free?", "Why is Flint free of charge?");
  // 2. CONVERGED: another single-line literal text, edited to the same value on both sides.
  const about = maps("pages", "about");
  const [convId, conv] = Object.entries(about).find(([, e]) => e.k === "text" && e.locate === "literal" && !e.of && !e.repoText && !e.part && e.text.length > 20 && fs.readFileSync(path.join(ROOT, e.file), "utf8").split("\n")[e.line - 1].includes(e.text));
  editElement("about", convId, (o) => (o.x = `${conv.text} Really.`));
  repoEdit(conv.file, conv.text, `${conv.text} Really.`);
  // 3. PULL (auto): a class swapped on Facility partners.
  editElement("facility-partners", "856210ce-e333-114f-bf85-ec97d3823b1b", (o) => (o.c = o.c.map((c) => (c === "fk-bg-white" ? "fk-bg-brand" : c))));
  // 4. PULL (auto): a style value.
  const styles = fs.readFileSync(path.join(nw, "styles.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  styles.find((x) => x.sel === ".fk-input-field-label").base.noPseudo["font-size"] = "14px";
  fs.writeFileSync(path.join(nw, "styles.jsonl"), `${styles.map((x) => JSON.stringify(x)).join("\n")}\n`);
  // 5. Variables: PULL (color-brand), CONVERGED (radius-lg to 18px on both sides), REPO AHEAD (radius-xl only in the repo).
  const vars = JSON.parse(fs.readFileSync(path.join(nw, "variables.json"), "utf8"));
  vars["color-brand"].value = "#123456";
  vars["radius-lg"].value.value = 18;
  fs.writeFileSync(path.join(nw, "variables.json"), JSON.stringify(vars));
  repoEdit("src/styles/tokens.css", "--radius-lg: 16px;", "--radius-lg: 18px;");
  repoEdit("src/styles/tokens.css", "--radius-xl: 24px;", "--radius-xl: 25px;");
  // 6. PULL (auto): an instance prop written at its call site.
  const pages = ["about", "candidates", "facility-partners", "home"];
  let inst = null;
  for (const slug of pages) {
    const m = maps("pages", slug);
    const hit = Object.entries(m).find(([, e]) => e.k === "inst" && e.comp === "Button" && e.props.Label?.locate === "attr" && typeof e.props.Label.value === "string" && e.props.Label.repoValue === undefined);
    if (hit) {
      inst = { slug, id: hit[0], entry: hit[1] };
      break;
    }
  }
  assert.ok(inst, "a Button with a Label prop at its call site");
  editElement(inst.slug, inst.id, (o) => (o.i.props.Label = `${o.i.props.Label} (edited)`));

  const rep = reconcile(nw, path.join(tmp, "synthetic.md"), [], { FLINT_ROOT: wt });
  console.log(`synthetic: ${JSON.stringify(breakdown(rep))}`);
  const one = (label, f) => {
    const r = rowsOf(rep, f);
    assert.equal(r.length, 1, `${label}: expected one row, got ${r.length}`);
    return r[0];
  };

  let r = one("conflict text", (x) => x.ref?.id === PRICING);
  assert.deepEqual([r.direction, r.edit.file, r.edit.line], ["CONFLICT", "src/sections/Pricing.tsx", lineOf("src/sections/Pricing.tsx", "Why is Flint free of charge?")]);
  assert.equal(r.base, "Why is Flint free?");
  assert.equal(r.webflow, "Why does Flint charge nothing?");
  assert.equal(r.repo, "Why is Flint free of charge?");
  r = one("converged text", (x) => x.ref?.id === convId);
  assert.deepEqual([r.direction, r.edit.file], ["CONVERGED", conv.file]);
  r = one("class", (x) => x.ref?.id === "856210ce-e333-114f-bf85-ec97d3823b1b");
  assert.deepEqual([r.direction, r.mode, r.edit.file, r.edit.line, r.edit.remove, r.edit.add], ["PULL", "auto", "src/sections/FacilityValueProp.tsx", lineOf("src/sections/FacilityValueProp.tsx", "fk-steps-back is-n1 fk-absolute fk-bg-white"), ["fk-bg-white"], ["fk-bg-brand"]]);
  r = one("style", (x) => x.where === ".fk-input-field-label" && x.ref?.field === "font-size");
  assert.deepEqual([r.direction, r.mode, r.edit.file, r.edit.old, r.edit.new], ["PULL", "auto", "src/styles/components/input-field.css", "12px", "14px"]);
  assert.ok(fs.readFileSync(path.join(wt, r.edit.file), "utf8").split("\n")[r.edit.line - 1].includes("font-size"));
  r = one("variable pull", (x) => x.ref?.area === "variable" && x.where === "color-brand");
  assert.deepEqual([r.direction, r.mode, r.edit.file, r.edit.line, r.edit.new], ["PULL", "auto", "src/styles/tokens.css", lineOf("src/styles/tokens.css", "--color-brand:"), "#123456"]);
  assert.ok(r.edit.tokensMd?.startsWith("docs/webflow/tokens.md:"));
  r = one("variable converged", (x) => x.ref?.area === "variable" && x.where === "radius-lg");
  assert.equal(r.direction, "CONVERGED");
  r = one("variable repo ahead", (x) => x.direction === "REPO AHEAD" && x.area === "Variables");
  assert.deepEqual([r.where, r.repo, r.repoBase], ["radius-xl", "25px", "24px"]);
  r = one("instance prop", (x) => x.ref?.id === inst.id);
  assert.deepEqual([r.direction, r.mode, r.edit.file, r.edit.line], ["PULL", "auto", inst.entry.props.Label.file, inst.entry.props.Label.line]);
  // Stable row numbers: the same inputs give the same report.
  const again = reconcile(nw, path.join(tmp, "synthetic2.md"), [], { FLINT_ROOT: wt });
  assert.deepEqual(again.rows.map((x) => [x.n, x.key]), rep.rows.map((x) => [x.n, x.key]));
  assert.equal(fs.readFileSync(path.join(tmp, "synthetic.md"), "utf8"), fs.readFileSync(path.join(tmp, "synthetic2.md"), "utf8"));
  assert.equal(fs.existsSync(path.join(ROOT, "docs/webflow/reconcile")), reconcileDirExisted);
  // A short example of the table, for the docs.
  console.log(fs.readFileSync(path.join(tmp, "synthetic.md"), "utf8").split("\n").filter((l) => /^\| (#|---|\d)/.test(l)).slice(0, 12).join("\n"));
});

// ---- stage 3 part A: moves, restructure, attributes, repo ahead, pre-existing differences ---------------
const FOUNDER_HEAD = "2561fb41-ca4d-3b62-02e1-71683c25f63b";
const FOUNDER_ROLE = "2561fb41-ca4d-3b62-02e1-71683c25f63d";
const FOUNDER2_HEAD = "2561fb41-ca4d-3b62-02e1-71683c25f649";
const FOUNDER2_ROLE = "2561fb41-ca4d-3b62-02e1-71683c25f64b";
const FOUNDER3_HEAD = "2561fb41-ca4d-3b62-02e1-71683c25f657";
const FOUNDER3_ROLE = "2561fb41-ca4d-3b62-02e1-71683c25f659";
const RESIDENCY_IMAGE = "b1909dde-ff7b-833c-9e4e-25695f095b7a";
const MAILTO = "f47df314-d509-ae79-ed3b-084c023a293c";
const baselineCopy = (name) => {
  const dir = path.join(tmp, name);
  fs.cpSync(DEFAULT_DATA, dir, { recursive: true, filter: (src) => !src.includes(`${path.sep}map`) });
  return dir;
};
/** Edits the element lines of one page / component file of a snapshot copy: fn(lines, { at, get, set }). */
const editPage = (dir, slug, fn, kind = "pages") => {
  const f = path.join(dir, kind, `${slug}.json`);
  const lines = fs.readFileSync(f, "utf8").split("\n");
  const at = (id) => {
    const i = lines.findIndex((l) => l.startsWith(`{"id":"${id}"`));
    assert.ok(i >= 0, `${id} not in ${slug}`);
    return i;
  };
  const get = (id) => JSON.parse(lines[at(id)].replace(/,$/, ""));
  const set = (id, o) => {
    const i = at(id);
    lines[i] = JSON.stringify(o) + (lines[i].endsWith(",") ? "," : "");
  };
  fn(lines, { at, get, set });
  fs.writeFileSync(f, lines.join("\n"));
};
const swap = (lines, ia, ib) => ([lines[ia], lines[ib]] = [lines[ib], lines[ia]]);
const NEEDS_MAP = { skip: have(DEFAULT_DATA, "baseline snapshot data/") || have(path.join(DEFAULT_DATA, "map"), "baseline map"), timeout: 300000 };

test("reconcile moves: a Webflow-only reorder is a PULL with the element and its neighbour; a move to another parent too", NEEDS_MAP, () => {
  const nw = baselineCopy("moves-new");
  // Founder 1: the role paragraph now comes before the name heading.
  editPage(nw, "about", (lines, { at }) => swap(lines, at(FOUNDER_HEAD), at(FOUNDER_ROLE)));
  let rep = reconcile(nw, path.join(tmp, "moves1.md"));
  const moved = rowsOf(rep, (r) => r.ref?.field === "moved");
  assert.equal(moved.length, 1, "one reorder, one row (the shifted sibling is not a second row)");
  assert.equal(moved[0].direction, "PULL");
  assert.equal(moved[0].mode, "assisted");
  assert.equal(moved[0].edit.op, "move-element");
  assert.equal(moved[0].edit.file, "src/sections/AboutTeam.tsx");
  assert.ok(moved[0].edit.line > 0 && moved[0].edit.target.line > 0 && moved[0].edit.target.file === "src/sections/AboutTeam.tsx", "the element and its new neighbour have a JSX location");
  assert.match(moved[0].notes.join(" "), /reordered inside/);

  // The same element moves into founder 2's block.
  const nw2 = baselineCopy("moves-new2");
  editPage(nw2, "about", (lines, { at, get, set }) => {
    const target = get(FOUNDER2_HEAD).p;
    set(FOUNDER_ROLE, { ...get(FOUNDER_ROLE), p: target });
    void at;
  });
  rep = reconcile(nw2, path.join(tmp, "moves2.md"));
  const mv = rowsOf(rep, (r) => r.ref?.field === "moved");
  assert.equal(mv.length, 1);
  assert.equal(mv[0].direction, "PULL");
  assert.match(mv[0].notes.join(" "), /moves from .* to /);
  assert.ok(mv[0].edit.target.file, "the neighbour or new parent has a location");
});

test("reconcile moves: the repo already has the new order -> CONVERGED", { ...NEEDS_MAP, skip: NEEDS_MAP.skip || (gitOk(["rev-parse", "HEAD"]) ? false : "no git") }, () => {
  const wt = scratchRepo("wt-moves", "HEAD");
  const nw = baselineCopy("moves-conv");
  // Webflow: every founder shows the role before the name. Repo: the two JSX lines swapped (they serve all three founders).
  editPage(nw, "about", (lines, { at }) => {
    for (const [h, r] of [[FOUNDER_HEAD, FOUNDER_ROLE], [FOUNDER2_HEAD, FOUNDER2_ROLE], [FOUNDER3_HEAD, FOUNDER3_ROLE]]) swap(lines, at(h), at(r));
  });
  const f = path.join(wt, "src/sections/AboutTeam.tsx");
  const src = fs.readFileSync(f, "utf8").split("\n");
  const i = src.findIndex((l) => l.includes("{founder.name}</h3>"));
  assert.ok(src[i + 1].includes("{founder.role}</p>"));
  swap(src, i, i + 1);
  fs.writeFileSync(f, src.join("\n"));
  const rep = reconcile(nw, path.join(tmp, "moves-conv.md"), [], { FLINT_ROOT: wt });
  const moved = rowsOf(rep, (r) => r.ref?.field === "moved");
  assert.equal(moved.length, 3);
  assert.deepEqual([...new Set(moved.map((r) => r.direction))], ["CONVERGED"]);
});

test("reconcile restructure: adds, removes and a move into a new wrapper under one parent are one row", NEEDS_MAP, () => {
  const nw = baselineCopy("restructure-new");
  let parent;
  editPage(nw, "about", (lines, { at, get, set }) => {
    parent = get(FOUNDER_HEAD).p;
    // Remove the role paragraph (with its text), add a wrapper holding the heading, add a loose block.
    const roleText = lines.findIndex((l) => l.startsWith("{\"id\":\"") && l.includes(`"p":"${FOUNDER_ROLE}"`));
    const idx = [at(FOUNDER_ROLE), roleText].sort((a, b) => b - a);
    set(FOUNDER_HEAD, { ...get(FOUNDER_HEAD), p: "synthetic-wrapper" });
    for (const k of idx) lines.splice(k, 1);
    const afterParent = at(parent) + 1;
    lines.splice(afterParent, 0, `{"id":"synthetic-wrapper","p":"${parent}","t":"Block","c":["fk-flex"],"s":{"tag":"div"}},`, `{"id":"synthetic-loose","p":"${parent}","t":"Block","c":["fk-flex"],"s":{"tag":"div"}},`);
  });
  const rep = reconcile(nw, path.join(tmp, "restructure.md"));
  const re = rowsOf(rep, (r) => r.sub === "restructure");
  assert.equal(re.length, 1, "one restructure row for the parent");
  assert.equal(re[0].id, parent);
  assert.deepEqual(re[0].members.map((m) => m.change).sort(), ["added", "added", "removed"]);
  assert.equal(re[0].direction, "PULL");
  assert.equal(rowsOf(rep, (r) => r.ref?.field === "moved" || r.ref?.field === "added" || r.ref?.field === "removed").length, 0, "the move into the new wrapper is part of the add, not a row");
  assert.ok(re[0].members.some((m) => m.notes?.some((n) => /also moves/.test(n))), "the absorbed move is on the add");
});

test("reconcile attributes: a link target and an image alt are compared by value; the repo can already have the alt", { ...NEEDS_MAP, skip: NEEDS_MAP.skip || (gitOk(["rev-parse", "HEAD"]) ? false : "no git") }, () => {
  const nw = baselineCopy("attrs-new");
  const NEW_ALT = "Residents and a nurse in the lounge (edited)";
  editPage(nw, "about", (lines, { get, set }) => set(RESIDENCY_IMAGE, { ...get(RESIDENCY_IMAGE), s: { ...get(RESIDENCY_IMAGE).s, altText: NEW_ALT } }));
  editPage(nw, "privacy-policy", (lines, { get, set }) => {
    const o = get(MAILTO);
    set(MAILTO, { ...o, s: { ...o.s, link: { href: "mailto:help@withflint.com", linkType: "email" } }, a: { ...o.a, href: "mailto:help@withflint.com" } });
  });
  let rep = reconcile(nw, path.join(tmp, "attrs1.md"));
  const one = (label, f) => {
    const r = rowsOf(rep, f);
    assert.equal(r.length, 1, `${label}: expected one row, got ${r.length}`);
    return r[0];
  };
  let alt = one("alt", (r) => r.ref?.id === RESIDENCY_IMAGE);
  assert.deepEqual([alt.ref.field, alt.direction, alt.mode, alt.edit.file], ["settings.altText", "PULL", "auto", "src/sections/AboutResidency.tsx"]);
  assert.equal(alt.webflow, NEW_ALT);
  assert.ok(fs.readFileSync(path.join(ROOT, alt.edit.file), "utf8").split("\n")[alt.edit.line - 1].includes("alt="), "the line is the alt attribute");
  const link = one("link", (r) => r.ref?.id === MAILTO);
  assert.deepEqual([link.ref.field, link.direction, link.base, link.webflow], ["settings.link", "PULL", "mailto:support@withflint.com", "mailto:help@withflint.com"]);
  assert.equal(link.edit.file, "src/sections/LegalBody.tsx");
  assert.equal(rowsOf(rep, (r) => r.ref?.field === "attr.href").length, 0, "the resolved href is part of the link row");

  // The repo already has the new alt text: CONVERGED (a scratch checkout, src changed).
  const wt = scratchRepo("wt-attrs", "HEAD");
  const f = path.join(wt, "src/sections/AboutResidency.tsx");
  const oldAlt = fs.readFileSync(path.join(ROOT, "src/sections/AboutResidency.tsx"), "utf8").match(/alt="([^"]*nurse and residents[^"]*)"/)[1];
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(`alt="${oldAlt}"`, `alt="${NEW_ALT}"`));
  rep = reconcile(nw, path.join(tmp, "attrs2.md"), [], { FLINT_ROOT: wt });
  alt = one("alt converged", (r) => r.ref?.id === RESIDENCY_IMAGE);
  assert.equal(alt.direction, "CONVERGED");
  assert.equal(one("link still to pull", (r) => r.ref?.id === MAILTO).direction, "PULL");
});

test("reconcile repo ahead: a component prop and variant, a page section, an interaction row and a custom-code source", { ...NEEDS_MAP, skip: NEEDS_MAP.skip || (gitOk(["rev-parse", "HEAD"]) ? false : "no git") }, () => {
  const wt = scratchRepo("wt-ahead", "HEAD");
  const edit = (rel, fn) => {
    const f = path.join(wt, rel);
    fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8")));
  };
  edit("src/components/ui/Button.tsx", (t) => t.replace('  variant?: "primary" | "secondary";', '  variant?: "primary" | "secondary" | "ghost";\n  tone?: "plain" | "bold";'));
  edit("src/pages/AboutPage.tsx", (t) => t.replace("        <LogoGrid />\n", "        <LogoGrid />\n        <LogoGrid />\n"));
  edit("docs/webflow/interactions.md", (t) => t.replace(/^(\| `ix-reveal` \|.*) \|$/m, "$1 (edited in the repo) |"));
  edit("docs/webflow/custom-code/x-modal.html", (t) => `${t}\n<!-- edited in the repo -->\n`);
  const rep = reconcile(baselineCopy("ahead-new"), path.join(tmp, "ahead.md"), [], { FLINT_ROOT: wt });
  const ahead = rowsOf(rep, (r) => r.direction === "REPO AHEAD");
  const has = (area, where, sub, pattern) => ahead.some((r) => r.area === area && r.where === where && r.sub === sub && (!pattern || pattern.test(r.element)));
  assert.ok(has("Components", "component:button", "prop added", /tone/), "prop added: tone");
  assert.ok(has("Components", "component:button", "variant added", /variant=ghost/), "variant added: ghost");
  assert.ok(has("Pages", "page:about", "section added", /LogoGrid/), "page section added");
  assert.ok(has("Interactions", "ix-reveal", "changed"), "interaction registry row changed");
  assert.ok(has("Custom code", "docs/webflow/custom-code/x-modal.html", "source"), "custom code source changed");
  // Nothing of this is a Webflow change.
  assert.equal(rep.counts.PULL + rep.counts.CONFLICT, 0);
  assert.equal(rep.counts.CONVERGED, 0);
});

test("reconcile pre-existing differences: listed once in the footer, never as rows", { skip: have(DEFAULT_DATA, "baseline snapshot data/") || have(DUMP_NOW, "dump 20261013T023829Z") || (loadSnapshotManifest().dump.endsWith("20261013T023829Z") ? false : "baseline is another dump"), timeout: 300000 }, () => {
  const map = path.join(tmp, "baseline-map");
  node("scripts/webflow-map.mjs", "--out", map, "--quiet");
  const rep = reconcile(DUMP_NOW, path.join(tmp, "pre.md"), ["--base-map", map]);
  assert.equal(rep.rows.length, 0, "baseline against its own dump: no rows");
  const auto = rep.footer.preexisting.filter((p) => p.where === "component:input-field" && p.field === "attr.autocomplete");
  assert.equal(auto.length, 1, "the autocomplete attribute is listed once");
  assert.deepEqual([auto[0].repo, auto[0].webflow], ["email", null]);
  assert.equal(rep.footer.preexisting.filter((p) => p.where === "component:input-field" && p.field === "attr.id").length, 0, "the bound id is not a difference");
  assert.equal(new Set(rep.footer.preexisting.map((p) => `${p.where}|${p.id}|${p.field}`)).size, rep.footer.preexisting.length, "no difference is listed twice");
  assert.match(fs.readFileSync(path.join(tmp, "pre.md"), "utf8"), /## Pre-existing differences \(\d+\)/);
});

test("reconcile accepted.json: element patterns and unaligned pages leave only real drift; --summary is inserted under the title", { skip: have(DEFAULT_DATA, "baseline snapshot data/") || have(DUMP_NOW, "dump 20261013T023829Z") || (loadSnapshotManifest().dump.endsWith("20261013T023829Z") ? false : "baseline is another dump"), timeout: 300000 }, () => {
  const map = path.join(tmp, "baseline-map2");
  node("scripts/webflow-map.mjs", "--out", map, "--quiet");
  const summary = path.join(tmp, "summary.md");
  fs.writeFileSync(summary, "Hand-written $1 summary.\n");
  const out = path.join(tmp, "acc.md");
  const rep = reconcile(DUMP_NOW, out, ["--base-map", map, "--summary", summary]);
  const pre = rep.footer.preexisting;
  assert.equal(pre.filter((p) => p.where === "component:stat" || p.where === "page:style-guide").length, 0, "variant combos and the unaligned page are not listed");
  assert.ok(rep.footer.accepted >= 12, "the element patterns matched");
  assert.ok(rep.footer.unalignedPre >= 1, "the unaligned page is counted, not listed");
  assert.ok(pre.some((p) => p.field === "attr.data-tm-slide"), "real drift (stale carousel attributes) stays listed");
  const md = fs.readFileSync(out, "utf8");
  assert.match(md, /^# Reconcile report [^\n]*\n\n## Summary\n\nHand-written \$1 summary\.\n/);
  assert.match(md, /Pre-existing differences not listed because the page is marked `unaligned`/);
});

test("reconcile refuses an incomplete dump", () => {
  const bad = path.join(tmp, "bad-dump");
  fs.mkdirSync(bad);
  fs.writeFileSync(path.join(bad, "site-before.json"), "{}");
  assert.throws(() => execFileSync("node", ["scripts/webflow-reconcile.mjs", bad, "--out", path.join(tmp, "bad.md")], { cwd: ROOT, stdio: "pipe" }), (e) => e.status === 2);
  assert.ok(!fs.existsSync(path.join(tmp, "bad.md")));
});

// ---- phase 4: apply the approved rows, refresh the base ---------------------------------------------------
const APPLY = path.join(ROOT, "scripts/webflow-reconcile-apply.mjs");
/** Runs a script of the real repo against a scratch checkout; never throws, returns { status, stdout, stderr }. */
const run = (script, args, env = {}) => {
  const r = spawnSync("node", [script, ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
};
const gitIn = (wt, ...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8" });
const dirty = (wt) => gitIn(wt, "status", "--porcelain").split("\n").filter(Boolean).map((l) => l.slice(3)).sort();
/** A full copy of the baseline (map included): a refresh edits the map too. */
const fullBaseCopy = (name) => {
  const dir = path.join(tmp, name);
  fs.cpSync(DEFAULT_DATA, dir, { recursive: true });
  return dir;
};
const filesOf = (dir) => {
  const out = new Map();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else out.set(path.relative(dir, f), fs.readFileSync(f, "utf8"));
    }
  })(dir);
  return out;
};
const changedFiles = (before, after) => [...new Set([...before.keys(), ...after.keys()])].filter((k) => before.get(k) !== after.get(k)).sort();
const NEEDS_GIT = (gitOk(["rev-parse", "HEAD"]) ? false : "no git");
const NEEDS_BASE = { ...NEEDS_MAP, skip: NEEDS_MAP.skip || NEEDS_GIT };

test("edit ops: text in JSX text, attributes and JS strings; CSS and tokens; every guard refuses what it cannot do", () => {
  // JSX text, an attribute (with the attribute restriction) and a JS string, each escaped for its context.
  let r = replaceInLine('        <h2 className="fk-heading-xl">Why is Flint free?</h2>', "Why is Flint free?", "Why is Flint free? Really.");
  assert.equal(r.value, '        <h2 className="fk-heading-xl">Why is Flint free? Really.</h2>');
  assert.equal(replaceInLine("<h2>a</h2>", "a", "{x}").ok, false, "braces can't go into JSX text");
  r = replaceInLine('<Button label="Apply now" aria-label="Apply now" />', "Apply now", 'Say "go"', { attr: "label" });
  assert.equal(r.value, '<Button label="Say &quot;go&quot;" aria-label="Apply now" />');
  assert.equal(replaceInLine('<Button label="Apply now" aria-label="Apply now" />', "Apply now", "x").ok, false, "two hits without the attribute restriction");
  r = replaceInLine('  "Don\'t wait",', "Don't wait", "Don't wait, apply");
  assert.equal(r.value, '  "Don\'t wait, apply",');
  r = replaceInLine("  'Don\\'t wait',", "Don't wait", "It's easy");
  assert.equal(r.value, "  'It\\'s easy',");
  assert.equal(replaceInLine('  "a",', "b", "c").ok, false);
  // classes
  assert.equal(replaceClass('<div className="fk-steps-back is-n1 fk-bg-white">', 1, "fk-bg-white", "fk-bg-brand").value, '<div className="fk-steps-back is-n1 fk-bg-brand">');
  r = replaceClass('x\n<div className="fk-steps-back fk-bg-white fk-bg-white-80">', 2, "fk-bg-white", "fk-bg-brand");
  assert.equal(r.value, 'x\n<div className="fk-steps-back fk-bg-brand fk-bg-white-80">', "a longer class that starts with the same text is left alone");
  assert.equal(replaceClass('<div className="a fk-x fk-x">', 1, "fk-x", "fk-y").ok, false, "twice on the line");
  // CSS
  const css = ".a {\n  color: red;\n  gap: var(--space-2);\n  transition:\n    a 1s,\n    b 2s;\n}\n\n@media screen and (max-width: 991px) {\n  .a {\n    color: blue;\n  }\n}\n";
  assert.equal(setDeclaration(css, { line: 3, decl: "gap", old: "var(--space-2)", neu: "var(--space-3)" }).value.split("\n")[2], "  gap: var(--space-3);");
  assert.equal(setDeclaration(css, { line: 3, decl: "gap", old: "var(--space-9)", neu: "x" }).ok, false, "the value changed under us");
  assert.equal(setDeclaration(css, { line: 2, decl: "gap", old: "red", neu: "x" }).ok, false, "not the declaration any more");
  assert.equal(removeDeclaration(css, { line: 4, decl: "transition", old: "a 1s, b 2s" }).ok, false, "a multi-line declaration is left to the agent");
  r = removeDeclaration(css, { line: 2, decl: "color", old: "red" });
  assert.ok(!r.value.includes("color: red"));
  r = addDeclaration(css, { line: 1, selector: ".a", decl: "margin-top", neu: "var(--space-1)" });
  assert.equal(r.value.split("\n")[6], "  margin-top: var(--space-1);");
  assert.equal(addDeclaration(".a, .b {\n  x: y;\n}\n", { line: 1, selector: ".a", decl: "z", neu: "1" }).ok, false, "a rule shared with another selector");
  assert.equal(addDeclaration(css, { line: 1, selector: ".a", decl: "gap", neu: "1px" }).ok, false, "already set");
  assert.equal(cssFromWebflow("var(space-4.5) var(--x) 3px"), "var(--space-4-5) var(--x) 3px");
  const added = addRules("a {\n}\n", { selector: ".fk-new", properties: [{ bp: "medium", pseudo: "noPseudo", prop: "color", value: "red" }, { bp: "main", pseudo: "noPseudo", prop: "display", value: "flex" }, { bp: "main", pseudo: "hover", prop: "color", value: "blue" }, { bp: "tiny", pseudo: "noPseudo", prop: "gap", value: "1px" }, { bp: "main", pseudo: "noPseudo", prop: "grid-template-rows", value: "auto" }], skip: (p) => p.prop === "grid-template-rows" });
  assert.equal(added.value, "a {\n}\n\n.fk-new {\n  display: flex;\n}\n\n.fk-new:hover {\n  color: blue;\n}\n\n@media screen and (max-width: 991px) {\n  .fk-new {\n    color: red;\n  }\n}\n\n@media screen and (max-width: 479px) {\n  .fk-new {\n    gap: 1px;\n  }\n}\n");
  // tokens
  const tokens = ":root {\n  --space-8: 32px;\n  --space-10: 40px;\n  --color-ink: #0f0e17;\n}\n";
  assert.equal(addToken(tokens, { name: "space-9", neu: "36px" }).value, ":root {\n  --space-8: 32px;\n  --space-9: 36px;\n  --space-10: 40px;\n  --color-ink: #0f0e17;\n}\n");
  assert.equal(addToken(tokens, { name: "space-8", neu: "1px" }).ok, false);
  assert.equal(setToken(tokens, { name: "color-ink", old: "#0F0E17", neu: "#000000" }).value.includes("--color-ink: #000000;"), true);
  assert.equal(setToken(tokens, { name: "color-ink", old: "#111111", neu: "#000000" }).ok, false);
  const md = "| Token | Value | Usage |\n| --- | --- | --- |\n| `color-ink` | `#0f0e17` | Text |\n| `space-3-5` | 14px | | `space-20` | 80px |\n";
  assert.ok(setTokenDoc(md, { name: "color-ink", old: "#0f0e17", neu: "#000000" }).value.includes("| `color-ink` | `#000000` | Text |"));
  assert.ok(setTokenDoc(md, { name: "space-20", old: "80px", neu: "84px" }).value.includes("| `space-20` | 84px |"));
  assert.equal(setTokenDoc(md, { name: "space-20", old: "81px", neu: "84px" }).ok, false);
  // row selections
  const rows = [1, 2, 3, 4].map((n) => ({ n, direction: n === 4 ? "REPO AHEAD" : "PULL", mode: n === 2 ? "assisted" : "auto" }));
  assert.deepEqual(parseRows("1-3", rows), [1, 2, 3]);
  assert.deepEqual(parseRows("auto", rows), [1, 3]);
  assert.deepEqual(parseRows("all", rows), [1, 2, 3]);
  assert.throws(() => parseRows("9", rows), /no row 9/);
});

test("apply: auto rows are edited exactly, a second reconcile converges, the refresh absorbs only what was applied", NEEDS_BASE, () => {
  const wt = scratchRepo("wt-apply", "HEAD");
  const base = fullBaseCopy("apply-base");
  const baseBefore = filesOf(base);
  const nw = baselineCopy("apply-new");

  // Webflow side. Approved and mechanical: a text, a class, a style value, a new class, a removed one-line declaration, a
  // variable value, a new variable, an instance prop. Not approved: an About text. Not mechanical: the multi-line transition.
  const PRICING = "8a16145e-ee69-d410-8c15-f94add50aa78";
  editPage(nw, "home", (lines, { get, set }) => set(PRICING, { ...get(PRICING), x: "Why does Flint charge nothing?" }));
  editPage(nw, "facility-partners", (lines, { get, set }) => {
    const o = get("856210ce-e333-114f-bf85-ec97d3823b1b");
    set(o.id, { ...o, c: o.c.map((c) => (c === "fk-bg-white" ? "fk-bg-brand" : c)) });
  });
  const styles = fs.readFileSync(path.join(nw, "styles.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  styles.find((x) => x.sel === ".fk-input-field-label").base.noPseudo["font-size"] = "15px";
  delete styles.find((x) => x.sel === ".fk-input-container").base.noPseudo["flex-wrap"];
  delete styles.find((x) => x.sel === ".fk-input-field").base.noPseudo.transition;
  styles.push({ sel: ".fk-input-field-hint", type: "global", base: { noPseudo: { color: "var(color-subtle)", "font-size": "12px" } }, bp: { medium: { noPseudo: { "font-size": "11px" } } } });
  styles.sort((a, b) => (a.sel < b.sel ? -1 : 1));
  fs.writeFileSync(path.join(nw, "styles.jsonl"), `${styles.map((x) => JSON.stringify(x)).join("\n")}\n`);
  const vars = JSON.parse(fs.readFileSync(path.join(nw, "variables.json"), "utf8"));
  vars["color-brand"].value = "#123456";
  vars["space-9"] = { id: "variable-00000000-test-space-9", type: "Size", value: { unit: "px", value: 36 } };
  fs.writeFileSync(path.join(nw, "variables.json"), `{\n${Object.keys(vars).sort().map((k) => `${JSON.stringify(k)}:${JSON.stringify(vars[k])}`).join(",\n")}\n}\n`);
  let inst = null;
  for (const slug of ["candidates", "facility-partners", "home"]) {
    const m = JSON.parse(fs.readFileSync(path.join(base, "map/pages", `${slug}.json`), "utf8")).elements;
    // The report marks every `attr` prop auto, also `label={buttonLabel}`; pick one that is a literal on its line.
    const hit = Object.entries(m).find(([, e]) => e.k === "inst" && e.comp === "Button" && e.props.Label?.locate === "attr" && typeof e.props.Label.value === "string" && e.props.Label.repoValue === undefined && fs.readFileSync(path.join(ROOT, e.props.Label.file), "utf8").split("\n")[e.props.Label.line - 1]?.includes(`label="${e.props.Label.value}"`));
    if (hit) {
      inst = { slug, id: hit[0], entry: hit[1] };
      break;
    }
  }
  assert.ok(inst, "a Button with a literal Label at its call site");
  editPage(nw, inst.slug, (lines, { get, set }) => {
    const o = get(inst.id);
    set(inst.id, { ...o, i: { ...o.i, props: { ...o.i.props, Label: `${o.i.props.Label} (edited)` } } });
  });
  const ABOUT_TEXT = JSON.parse(fs.readFileSync(path.join(base, "map/pages/about.json"), "utf8"));
  const [aboutId, aboutEntry] = Object.entries(ABOUT_TEXT.elements).find(([, e]) => e.k === "text" && e.locate === "literal" && !e.of && !e.part && !e.repoText && e.text.length > 20);
  editPage(nw, "about", (lines, { get, set }) => set(aboutId, { ...get(aboutId), x: `${aboutEntry.text} (not approved)` }));

  const rep = reconcile(nw, path.join(tmp, "apply1.md"), ["--base", base], { FLINT_ROOT: wt });
  const reportJson = path.join(tmp, "apply1.json");
  const by = (f) => rep.rows.filter(f);
  const one = (label, f) => {
    const r = by(f);
    assert.equal(r.length, 1, `${label}: expected one row, got ${r.length}`);
    return r[0];
  };
  const rText = one("text", (r) => r.ref?.id === PRICING);
  const rClass = one("class", (r) => r.ref?.id === "856210ce-e333-114f-bf85-ec97d3823b1b");
  const rFont = one("font-size", (r) => r.where === ".fk-input-field-label" && r.ref?.field === "font-size");
  const rWrap = one("flex-wrap", (r) => r.where === ".fk-input-container" && r.ref?.field === "flex-wrap");
  const rTrans = one("transition", (r) => r.where === ".fk-input-field" && r.ref?.field === "transition");
  const rRule = one("new rule", (r) => r.where === ".fk-input-field-hint" && r.ref?.field === "added");
  const rTokV = one("token value", (r) => r.ref?.area === "variable" && r.where === "color-brand");
  const rTokNew = one("new token", (r) => r.ref?.area === "variable" && r.where === "space-9");
  const rProp = one("prop", (r) => r.ref?.id === inst.id);
  const rAbout = one("about text", (r) => r.ref?.id === aboutId);
  for (const r of [rText, rClass, rFont, rWrap, rRule, rTokV, rTokNew, rProp]) assert.deepEqual([r.direction, r.mode], ["PULL", "auto"], `${r.key} is PULL / auto`);
  assert.deepEqual([rTrans.direction, rTrans.edit.op], ["PULL", "remove-declaration"]);

  // Dry run: the diff is printed, nothing is written.
  const approved = [rText, rClass, rFont, rWrap, rTrans, rRule, rTokV, rTokNew, rProp].map((r) => r.n);
  const rowsArg = approved.join(",");
  let res = run(APPLY, [reportJson, "--rows", rowsArg, "--base", base, "--dry-run"], { FLINT_ROOT: wt });
  assert.equal(res.status, 3, res.stderr + res.stdout);
  assert.deepEqual(dirty(wt), [], "a dry run writes nothing");
  assert.match(res.stdout, /^--- a\/src\/sections\/Pricing\.tsx$/m);
  assert.match(res.stdout, /^\+.*Why does Flint charge nothing\?/m);
  assert.match(res.stdout, /TASKS FOR THE AGENT/);
  assert.equal(fs.existsSync(path.join(tmp, "apply1.applied.json")), false, "a dry run records nothing");

  // The real run, with the refresh.
  res = run(APPLY, [reportJson, "--rows", rowsArg, "--base", base, "--refresh"], { FLINT_ROOT: wt });
  if (process.env.DEBUG_APPLY) console.log(res.stdout);
  assert.equal(res.status, 3, "the transition row and the follow-ups need the agent");
  // 1. the files changed are exactly the expected ones
  const files = dirty(wt);
  assert.deepEqual(files, ["docs/webflow/classes.md", "docs/webflow/tokens.md", "docs/webflow/webflow-ids.json", inst.entry.props.Label.file, "src/sections/FacilityValueProp.tsx", "src/sections/Pricing.tsx", "src/styles/components/input-field.css", "src/styles/tokens.css", "src/styles/utilities.css"].sort(), "exactly the files of the applied rows (and the generated ones)");
  const diff = gitIn(wt, "diff", "-U0");
  assert.match(diff, /^\+.*Why does Flint charge nothing\?/m);
  assert.match(diff, /^-.*Why is Flint free\?/m);
  assert.match(diff, /^-.*fk-steps-back is-n1 fk-absolute fk-bg-white/m);
  assert.match(diff, /^\+.*fk-steps-back is-n1 fk-absolute fk-bg-brand/m);
  assert.match(diff, /^\+  font-size: 15px;/m);
  assert.match(diff, /^-  font-size: 12px;/m);
  assert.match(diff, /^-  flex-wrap: nowrap;/m);
  assert.match(diff, /^\+\.fk-input-field-hint \{/m);
  assert.match(diff, /^\+  color: var\(--color-subtle\);/m);
  assert.match(diff, /^\+@media screen and \(max-width: 991px\) \{/m);
  assert.match(diff, /^\+  --color-brand: #123456;/m);
  assert.match(diff, /^\+  --space-9: 36px;/m);
  assert.match(diff, /^\+\| `color-brand` \| `#123456`/m);
  assert.match(diff, /^\+    "space-9": "variable-00000000-test-space-9"/m);
  assert.match(diff, /^\+\.fk-gap-9/m, "the generator added the utility for the new spacing token");
  assert.ok(!/transition/.test(diff.split("\n").filter((l) => /^[-+]/.test(l)).join("\n")), "the multi-line transition was left to the agent");
  assert.match(res.stdout, /#\d+ \[PULL\] Styles · \.fk-input-field · transition/);
  assert.match(res.stdout, /why not automatic: guard failed/);
  assert.match(res.stdout, /register `\.fk-input-field-hint` in docs\/webflow\/classes\.md/);
  assert.match(res.stdout, /add a `space-9` row/);
  // 2. a second reconcile against the same Webflow state: the applied rows are in sync (CONVERGED or gone)
  const unrefreshedBase = fullBaseCopy("apply-base-unrefreshed");
  fs.cpSync(path.join(tmp, "apply-base"), unrefreshedBase, { recursive: true });
  // (the refresh already ran; to see the converged state, reconcile against a base copy from before it)
  for (const [rel] of baseBefore) fs.writeFileSync(path.join(unrefreshedBase, rel), baseBefore.get(rel));
  const rep2 = reconcile(nw, path.join(tmp, "apply2.md"), ["--base", unrefreshedBase], { FLINT_ROOT: wt });
  for (const r of [rText, rClass, rFont, rWrap, rRule, rTokV, rTokNew, rProp]) {
    const now = rep2.rows.find((x) => x.key === r.key);
    assert.ok(now?.direction === "CONVERGED", `${r.key} should be CONVERGED after the edit, got ${now?.direction}`);
  }
  assert.equal(rep2.rows.find((x) => x.key === rTrans.key).direction, "PULL");
  assert.equal(rep2.rows.find((x) => x.key === rAbout.key).direction, "PULL");
  // 3. the refresh changed only the targeted items of the base
  const baseAfter = filesOf(base);
  const changed = changedFiles(baseBefore, baseAfter);
  assert.ok(!changed.includes("pages/about.json") && !changed.includes("map/pages/about.json"), "the About text was not approved");
  assert.ok(changed.includes("pages/home.json") && changed.includes("pages/facility-partners.json") && changed.includes("styles.jsonl") && changed.includes("variables.json") && changed.includes("manifest.json"));
  assert.ok(changed.every((f) => ["manifest.json", "styles.jsonl", "variables.json"].includes(f) || /^(map\/)?pages\/(home|facility-partners|about|candidates)\.json$/.test(f)), `unexpected base files changed: ${changed.join(", ")}`);
  const beforeStyles = new Map(baseBefore.get("styles.jsonl").split("\n").filter(Boolean).map((l) => [JSON.parse(l).sel, l]));
  const afterStyles = new Map(baseAfter.get("styles.jsonl").split("\n").filter(Boolean).map((l) => [JSON.parse(l).sel, l]));
  assert.deepEqual([...new Set([...beforeStyles.keys(), ...afterStyles.keys()])].filter((k) => beforeStyles.get(k) !== afterStyles.get(k)).sort(), [".fk-input-container", ".fk-input-field-hint", ".fk-input-field-label"], "the transition and everything else in the styles stayed as it was");
  const vb = JSON.parse(baseBefore.get("variables.json"));
  const va = JSON.parse(baseAfter.get("variables.json"));
  assert.deepEqual(Object.keys({ ...vb, ...va }).filter((k) => JSON.stringify(vb[k]) !== JSON.stringify(va[k])).sort(), ["color-brand", "space-9"]);
  const mf = JSON.parse(baseAfter.get("manifest.json"));
  assert.equal(mf.refreshedRows.length, 1);
  assert.equal(mf.refreshedRows[0].keys.length, approved.length - 1, "every approved row but the transition");
  assert.equal(mf.repoCommit, JSON.parse(baseBefore.get("manifest.json")).repoCommit, "repoCommit stays");
  assert.ok(mf.repoBase.css.some(([sel, , , prop, v]) => sel === ".fk-input-field-label" && prop === "font-size" && v === "15px"));
  assert.equal(mf.repoBase.tokens["color-brand"], "#123456");
  assert.equal(mf.files["styles.jsonl"], crypto256(baseAfter.get("styles.jsonl")));
  // The "Applied" record and section.
  const rec = JSON.parse(fs.readFileSync(path.join(tmp, "apply1.applied.json"), "utf8"));
  assert.deepEqual(rec.rows.map((r) => r.n).sort((a, b) => a - b), approved.filter((n) => n !== rTrans.n).sort((a, b) => a - b));
  assert.ok(rec.rows.every((r) => r.refreshed && r.how === "script"));
  assert.match(fs.readFileSync(path.join(tmp, "apply1.md"), "utf8"), /^## Applied\n[\s\S]*\| script \|[\s\S]*Commit: not committed yet[\s\S]*^## Pull or decide/m);
  // 4. a reconcile against the refreshed base: the applied rows are gone, the others stay
  const rep3 = reconcile(nw, path.join(tmp, "apply3.md"), ["--base", base], { FLINT_ROOT: wt });
  console.log(`after the refresh: ${JSON.stringify(breakdown(rep3))}`);
  for (const r of [rText, rClass, rFont, rWrap, rRule, rTokV, rTokNew, rProp]) assert.ok(!rep3.rows.some((x) => x.key === r.key), `${r.key} is gone after the refresh`);
  assert.equal(rep3.rows.find((x) => x.key === rTrans.key)?.direction, "PULL", "the unapplied row is still there");
  assert.equal(rep3.rows.find((x) => x.key === rAbout.key)?.direction, "PULL", "so is the unapproved text");
  assert.equal(rep3.counts.CONFLICT, 0);
  // 5. later Webflow edits of an absorbed item are compared with what was applied: a new value is a plain PULL, not a CONFLICT
  const nw2 = baselineCopy("apply-new2");
  fs.cpSync(nw, nw2, { recursive: true });
  const styles2 = fs.readFileSync(path.join(nw2, "styles.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  styles2.find((x) => x.sel === ".fk-input-field-label").base.noPseudo["font-size"] = "17px";
  fs.writeFileSync(path.join(nw2, "styles.jsonl"), `${styles2.map((x) => JSON.stringify(x)).join("\n")}\n`);
  const vars2 = JSON.parse(fs.readFileSync(path.join(nw2, "variables.json"), "utf8"));
  vars2["color-brand"].value = "#654321";
  fs.writeFileSync(path.join(nw2, "variables.json"), `{\n${Object.keys(vars2).sort().map((k) => `${JSON.stringify(k)}:${JSON.stringify(vars2[k])}`).join(",\n")}\n}\n`);
  editPage(nw2, "home", (lines, { get, set }) => set(PRICING, { ...get(PRICING), x: "Why does Flint cost nothing?" }));
  const rep4 = reconcile(nw2, path.join(tmp, "apply4.md"), ["--base", base], { FLINT_ROOT: wt });
  for (const [label, f] of [["font-size", (r) => r.where === ".fk-input-field-label" && r.ref?.field === "font-size"], ["token", (r) => r.ref?.area === "variable" && r.where === "color-brand"], ["text", (r) => r.ref?.id === PRICING]]) {
    const r = one2(rep4, label, f);
    assert.equal(r.direction, "PULL", `${label}: a later Webflow edit of an absorbed item is a PULL (the repo base is what was applied)`);
  }
  // 6. applying the same rows again changes nothing (the dump they came from is already absorbed)
  res = run(APPLY, [reportJson, "--rows", approved.filter((n) => n !== rTrans.n).join(","), "--base", base], { FLINT_ROOT: wt });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout, /ALREADY IN SYNC/);
  assert.deepEqual(dirty(wt), files, "nothing more was written");
});
const one2 = (rep, label, f) => {
  const r = rep.rows.filter(f);
  assert.equal(r.length, 1, `${label}: expected one row, got ${r.length}`);
  return r[0];
};
const crypto256 = (text) => crypto.createHash("sha256").update(text).digest("hex");

test("apply: a failed guard, a CONFLICT and an assisted row become tasks and nothing is edited", NEEDS_BASE, () => {
  const wt = scratchRepo("wt-apply-guard", "HEAD");
  const base = fullBaseCopy("guard-base");
  const nw = baselineCopy("guard-new");
  const PRICING = "8a16145e-ee69-d410-8c15-f94add50aa78";
  editPage(nw, "home", (lines, { get, set }) => set(PRICING, { ...get(PRICING), x: "Why does Flint charge nothing?" }));
  editPage(nw, "about", (lines, { at }) => swap(lines, at(FOUNDER_HEAD), at(FOUNDER_ROLE)));
  // A CONFLICT: the label font-size differs on both sides.
  const styles = fs.readFileSync(path.join(nw, "styles.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  styles.find((x) => x.sel === ".fk-input-field-label").base.noPseudo["font-size"] = "14px";
  fs.writeFileSync(path.join(nw, "styles.jsonl"), `${styles.map((x) => JSON.stringify(x)).join("\n")}\n`);
  const css = path.join(wt, "src/styles/components/input-field.css");
  fs.writeFileSync(css, fs.readFileSync(css, "utf8").replace("  font-size: 12px;\n  font-weight: 400;", "  font-size: 13px;\n  font-weight: 400;"));
  const rep = reconcile(nw, path.join(tmp, "guard1.md"), ["--base", base], { FLINT_ROOT: wt });
  const reportJson = path.join(tmp, "guard1.json");
  const rText = rep.rows.find((r) => r.ref?.id === PRICING);
  const rMove = rep.rows.find((r) => r.ref?.field === "moved");
  const rFont = rep.rows.find((r) => r.where === ".fk-input-field-label" && r.ref?.field === "font-size");
  assert.deepEqual([rText.direction, rText.mode, rMove.direction, rMove.mode, rFont.direction], ["PULL", "auto", "PULL", "assisted", "CONFLICT"]);
  // Before the apply someone edits the very line: the guard fails.
  const pricing = path.join(wt, "src/sections/Pricing.tsx");
  fs.writeFileSync(pricing, fs.readFileSync(pricing, "utf8").replace("Why is Flint free?", "Why is Flint free of charge?"));
  const before = dirty(wt);
  const tasksFile = path.join(tmp, "guard-tasks.json");
  const res = run(APPLY, [reportJson, "--rows", [rText.n, rMove.n, rFont.n].join(","), "--base", base, "--tasks-json", tasksFile], { FLINT_ROOT: wt });
  assert.equal(res.status, 3, res.stdout + res.stderr);
  assert.deepEqual(dirty(wt), before, "no file was touched by the apply");
  assert.match(res.stdout, new RegExp(`#${rText.n} \\[PULL\\][^\\n]*\\n  why not automatic: guard failed: .*not found|#${rText.n} \\[PULL\\][^\\n]*\\n  why not automatic: guard failed`));
  assert.match(res.stdout, /do:      replace the text at src\/sections\/Pricing\.tsx:\d+: "Why is Flint free\?" → "Why does Flint charge nothing\?"/);
  assert.match(res.stdout, new RegExp(`#${rMove.n} \\[PULL\\][^\\n]*\\n  why not automatic: not mechanical`));
  assert.match(res.stdout, /do:      move the element at src\/sections\/AboutTeam\.tsx:\d+ (after|to be the first child of)/);
  assert.match(res.stdout, new RegExp(`#${rFont.n} \\[CONFLICT\\][^\\n]*\\n  why not automatic: CONFLICT`));
  assert.match(res.stdout, /remember: rule 2/);
  const tasks = JSON.parse(fs.readFileSync(tasksFile, "utf8"));
  assert.deepEqual(tasks.tasks.map((t) => t.n).sort(), [rText.n, rMove.n, rFont.n].sort());
  assert.ok(tasks.tasks.every((t) => t.file && t.do));
  // A stale report is refused: the base moved under it.
  const staleBase = fullBaseCopy("guard-stale-base");
  const mf = JSON.parse(fs.readFileSync(path.join(staleBase, "manifest.json"), "utf8"));
  mf.dump = ".cache/webflow-dump/other";
  fs.writeFileSync(path.join(staleBase, "manifest.json"), JSON.stringify(mf, null, 2));
  const stale = run(APPLY, [reportJson, "--rows", String(rText.n), "--base", staleBase], { FLINT_ROOT: wt });
  assert.equal(stale.status, 2);
  assert.match(stale.stderr, /stale/);
  assert.equal(run(APPLY, [reportJson, "--rows", "99", "--base", base], { FLINT_ROOT: wt }).status, 2);
});

test("refresh: a structural row is refreshed only after the repo has the change; the agent's rows go through webflow-snapshot.mjs --refresh", NEEDS_BASE, () => {
  const wt = scratchRepo("wt-refresh", "HEAD");
  const base = fullBaseCopy("refresh-base");
  const nw = baselineCopy("refresh-new");
  editPage(nw, "about", (lines, { at }) => swap(lines, at(FOUNDER_HEAD), at(FOUNDER_ROLE)));
  const rep = reconcile(nw, path.join(tmp, "refresh1.md"), ["--base", base], { FLINT_ROOT: wt });
  const reportJson = path.join(tmp, "refresh1.json");
  const move = rep.rows.find((r) => r.ref?.field === "moved");
  assert.deepEqual([move.direction, move.mode], ["PULL", "assisted"]);
  const before = filesOf(base);
  // The repo does not have it yet: the verification refuses and the base stays as it was.
  let res = run(path.join(ROOT, "scripts/webflow-snapshot.mjs"), ["--refresh", reportJson, "--rows", String(move.n), "--base", base], { FLINT_ROOT: wt });
  assert.equal(res.status, 3, res.stdout + res.stderr);
  assert.match(res.stdout, new RegExp(`NOT refreshed #${move.n}: a reconcile against the same dump still shows it as PULL`));
  assert.deepEqual(changedFiles(before, filesOf(base)), [], "a refused refresh writes nothing");
  // The agent makes the edit (the JSX lines swapped, as Webflow has them) ...
  const f = path.join(wt, "src/sections/AboutTeam.tsx");
  const src = fs.readFileSync(f, "utf8").split("\n");
  const i = src.findIndex((l) => l.includes("{founder.name}</h3>"));
  swap(src, i, i + 1);
  fs.writeFileSync(f, src.join("\n"));
  // ... and the refresh goes through. The move touches the page and the manifest only; --rows all would also work.
  res = run(path.join(ROOT, "scripts/webflow-snapshot.mjs"), ["--refresh", reportJson, "--rows", String(move.n), "--base", base], { FLINT_ROOT: wt });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout, /Refreshed the base for rows/);
  const changed = changedFiles(before, filesOf(base));
  assert.deepEqual(changed.filter((x) => !x.startsWith("map/")), ["manifest.json", "pages/about.json"]);
  assert.deepEqual(diffDirs(base, nw).changes.filter((c) => c.where === "page:about"), [], "the about page of the base has Webflow's order now (the flat order of this synthetic file may differ, the tree does not)");
  const rec = JSON.parse(fs.readFileSync(path.join(tmp, "refresh1.applied.json"), "utf8"));
  assert.deepEqual(rec.rows.map((r) => [r.n, r.how, r.refreshed]), [[move.n, "agent", true]]);
  // The next reconcile is quiet: no move row left.
  const rep2 = reconcile(nw, path.join(tmp, "refresh2.md"), ["--base", base], { FLINT_ROOT: wt });
  assert.equal(rep2.rows.filter((r) => r.ref?.field === "moved").length, 0);
  assert.equal(rep2.counts.PULL + rep2.counts.CONFLICT, 0);
  // The signals of the page took the new dump's value now that its file equals the new one.
  const mf = JSON.parse(filesOf(base).get("manifest.json"));
  const nmf = JSON.parse(fs.readFileSync(path.join(nw, "manifest.json"), "utf8"));
  const aboutId = JSON.parse(filesOf(base).get("pages/about.json")).pageId;
  assert.equal(mf.signals.pageLastUpdated[aboutId], nmf.signals.pageLastUpdated[aboutId]);
});

test("refresh data layer: adds, removes, a re-created text run, links, settings, assets, components and site settings all land in the base (--no-verify)", NEEDS_BASE, () => {
  const wt = scratchRepo("wt-refresh-data", "HEAD");
  const base = fullBaseCopy("data-base");
  const nw = baselineCopy("data-new");
  // Webflow side: a restructure of one parent, a re-created text run, a link, page settings, an asset alt, a component
  // description and a site setting.
  editPage(nw, "about", (lines, { at, get, set }) => {
    const parent = get(FOUNDER_HEAD).p;
    const roleText = lines.findIndex((l) => l.startsWith("{\"id\":\"") && l.includes(`"p":"${FOUNDER_ROLE}"`));
    const idx = [at(FOUNDER_ROLE), roleText].sort((a, b) => b - a);
    set(FOUNDER_HEAD, { ...get(FOUNDER_HEAD), p: "synthetic-wrapper" });
    for (const k of idx) lines.splice(k, 1);
    const afterParent = at(parent) + 1;
    lines.splice(afterParent, 0, `{"id":"synthetic-wrapper","p":"${parent}","t":"Block","c":["fk-flex"],"s":{"tag":"div"}},`, `{"id":"synthetic-loose","p":"${parent}","t":"Block","c":["fk-flex"],"s":{"tag":"div"}},`);
  });
  const aboutFile = path.join(nw, "pages/about.json");
  fs.writeFileSync(aboutFile, fs.readFileSync(aboutFile, "utf8").replace("About Flint |", "About Flint (edited) |"));
  const strings = loadSnapshot(base).pages.candidates.elements.filter((e) => e.t === "String" && e.x.trim().length > 12);
  editPage(nw, "candidates", (lines, { get, set }) => set(strings[3].id, { ...get(strings[3].id), id: "recreated-string-1" }));
  editPage(nw, "privacy-policy", (lines, { get, set }) => {
    const o = get(MAILTO);
    set(MAILTO, { ...o, s: { ...o.s, link: { href: "mailto:help@withflint.com", linkType: "email" } }, a: { ...o.a, href: "mailto:help@withflint.com" } });
  });
  const assets = JSON.parse(fs.readFileSync(path.join(nw, "assets.json"), "utf8"));
  const withAlt = assets.find((a) => a.altText);
  withAlt.altText = `${withAlt.altText} (edited)`;
  fs.writeFileSync(path.join(nw, "assets.json"), `[\n${assets.map((a) => JSON.stringify(Object.fromEntries(Object.keys(a).sort().map((k) => [k, a[k]])))).join(",\n")}\n]\n`);
  const buttonFile = path.join(nw, "components/button.json");
  fs.writeFileSync(buttonFile, fs.readFileSync(buttonFile, "utf8").replace(/"description":"([^"]*)"/, (_, d) => `"description":"${d} Edited."`));
  const siteFile = path.join(nw, "site.json");
  fs.writeFileSync(siteFile, fs.readFileSync(siteFile, "utf8").replace('"timeZone": "America/Vancouver"', '"timeZone": "America/Toronto"'));

  const rep = reconcile(nw, path.join(tmp, "data1.md"), ["--base", base], { FLINT_ROOT: wt });
  const reportJson = path.join(tmp, "data1.json");
  console.log(`data layer rows: ${rep.rows.map((r) => `#${r.n} ${r.area}/${r.sub} ${r.direction}`).join("; ")}`);
  const before = filesOf(base);
  const res = run(path.join(ROOT, "scripts/webflow-snapshot.mjs"), ["--refresh", reportJson, "--rows", "all", "--base", base, "--no-verify"], { FLINT_ROOT: wt });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  const left = diffDirs(base, nw).changes.filter((c) => c.area !== "signal" && c.area !== "manifest");
  assert.deepEqual(left.map((c) => `${c.area} ${c.where} ${c.field}`), [], "every change of the new snapshot is in the base");
  const changed = changedFiles(before, filesOf(base));
  assert.ok(changed.includes("pages/about.json") && changed.includes("pages/candidates.json") && changed.includes("pages/privacy-policy.json") && changed.includes("assets.json") && changed.includes("components/button.json") && changed.includes("site.json"), `changed: ${changed.join(", ")}`);
  assert.ok(!changed.includes("styles.jsonl") && !changed.includes("variables.json"), "styles and variables had nothing to absorb");
  // The map follows a re-created text run: its entry moved to the new id.
  const mapCandidates = JSON.parse(fs.readFileSync(path.join(base, "map/pages/candidates.json"), "utf8")).elements;
  const hadEntry = strings[3].id in JSON.parse(before.get("map/pages/candidates.json")).elements;
  assert.equal(strings[3].id in mapCandidates, false);
  assert.equal("recreated-string-1" in mapCandidates, hadEntry);
  // Once everything is absorbed the base is the new dump (signals included) and a reconcile has nothing left.
  const mf = JSON.parse(filesOf(base).get("manifest.json"));
  assert.deepEqual(mf.signals, JSON.parse(fs.readFileSync(path.join(nw, "manifest.json"), "utf8")).signals);
  const rep2 = reconcile(nw, path.join(tmp, "data2.md"), ["--base", base], { FLINT_ROOT: wt });
  assert.equal(rep2.counts.PULL + rep2.counts.CONFLICT + rep2.counts.CONVERGED, 0, JSON.stringify(rep2.rows.map((r) => r.key)));
});

// ---- the gate: partial dump (plan and compose) -------------------------------------------------------------------------------
// The base is dump 20261013T023829Z normalised into a scratch folder; the "new" Webflow state is the same dump with synthetic
// changes, so the tests do not depend on what the real base is today.
const NEEDS_DUMP = { skip: have(DUMP_NOW, "dump 20261013T023829Z"), timeout: 300000 };
const gateNode = (args, opts = {}) => {
  const r = spawnSync("node", ["scripts/webflow-gate.mjs", ...args], { cwd: ROOT, encoding: "utf8", ...opts });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const readJ = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJ = (f, v) => fs.writeFileSync(f, JSON.stringify(v));
const wrapOf = (f) => {
  const raw = readJ(f);
  const list = Array.isArray(raw) ? raw : [raw];
  const w = list.flatMap((x) => (x?.type === "text" ? [JSON.parse(x.text)] : [x]));
  return w[0];
};
let gateBaseDir;
function gateBase() {
  if (gateBaseDir) return gateBaseDir;
  gateBaseDir = path.join(tmp, "gate-base");
  node("scripts/webflow-snapshot.mjs", DUMP_NOW, "--out", gateBaseDir, "--commit", "831b811");
  return gateBaseDir;
}
/** A partial dir as the dump agent would save it for a Webflow that is unchanged. */
function gatePartial(name) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ["site-before", "site-after", "pages-before", "pages-after", "interactions", "cms-collections", "styles", "components", "component-trees", "variables"]) {
    fs.copyFileSync(path.join(DUMP_NOW, `${f}.json`), path.join(dir, `${f}.json`));
  }
  const code = readJ(path.join(DUMP_NOW, "site-code.json"));
  writeJ(path.join(dir, "registered-scripts.json"), code.registered);
  return dir;
}
const sameFiles = (a, b, skip = ["manifest.json"]) => {
  const list = (d) => fs.readdirSync(d, { recursive: true }).filter((f) => fs.statSync(path.join(d, f)).isFile() && !skip.includes(f)).sort();
  assert.deepEqual(list(a), list(b));
  for (const f of list(a)) assert.ok(fs.readFileSync(path.join(a, f)).equals(fs.readFileSync(path.join(b, f))), `${f} differs`);
};

test("gate: with no signal moved the plan asks only for styles, components and variables, and the composed dump normalises to the full dump", NEEDS_DUMP, () => {
  const base = gateBase();
  const dir = gatePartial("gate-none");
  const plan = JSON.parse(gateNode(["--plan", dir, "--base", base, "--json"]).out);
  assert.equal(plan.mode, "partial");
  assert.deepEqual(plan.reads.map((r) => r.file), ["styles.json", "components.json", "component-trees.json", "variables.json", "site-after.json", "pages-after.json"]);
  assert.equal(plan.calls, 11);
  const out = path.join(tmp, "gate-none-out");
  const r = gateNode(["--compose", dir, "--out", out, "--base", base]);
  assert.equal(r.code, 0, r.out);
  const a = path.join(tmp, "gate-none-snap");
  const b = path.join(tmp, "gate-none-ref");
  node("scripts/webflow-snapshot.mjs", out, "--out", a, "--commit", "831b811");
  node("scripts/webflow-snapshot.mjs", DUMP_NOW, "--out", b, "--commit", "831b811");
  sameFiles(a, b);
  // The composed dump holds every file a dump has and a provenance note.
  assert.ok(fs.existsSync(path.join(out, "COMPOSED.txt")));
  assert.equal(fs.readdirSync(out).filter((f) => f.startsWith("tree-")).length, 13);
});

test("gate: a moved page, a changed interaction and a publish ask for exactly their reads; compose names what is missing and merges the rest", NEEDS_DUMP, () => {
  const base = gateBase();
  const dir = gatePartial("gate-moved");
  // Webflow after an edit of About (text), a new version of one interaction, and a save of the site.
  const stamp = "2026-10-14T09:00:00.000Z";
  const patchPages = (file) => {
    const w = wrapOf(file);
    const about = w.result.pages.find((p) => p.slug === "about");
    about.lastUpdated = stamp;
    writeJ(file, w);
    return about;
  };
  const about = patchPages(path.join(dir, "pages-before.json"));
  patchPages(path.join(dir, "pages-after.json"));
  for (const f of ["site-before.json", "site-after.json"]) {
    const w = wrapOf(path.join(dir, f));
    w.result.lastUpdated = stamp;
    writeJ(path.join(dir, f), w);
  }
  const ixFile = path.join(dir, "interactions.json");
  const ixw = wrapOf(ixFile);
  const ixItems = (Array.isArray(ixw.result) ? ixw.result[0] : ixw.result).items;
  const ix = ixItems.find((i) => i.name === "ix-reveal");
  ix.version += 1;
  writeJ(ixFile, ixw);

  const planOf = () => JSON.parse(gateNode(["--plan", dir, "--base", base, "--json"]).out);
  const files = (p) => p.reads.map((r) => r.file);
  const plan = planOf();
  assert.equal(plan.mode, "partial");
  for (const f of ["tree-about.json", "page-code.json", "schema.json", "sitemap.json", "interactions-full.json", "site-code.json", "fonts.json", "assets-1.json"]) assert.ok(files(plan).includes(f), `${f} should be planned: ${files(plan)}`);
  assert.ok(!files(plan).some((f) => f.startsWith("tree-") && f !== "tree-about.json"), "only the moved page's tree is re-read");
  assert.deepEqual(plan.reads.find((r) => r.file === "interactions-full.json").entries, [ix.id]);
  assert.deepEqual(plan.moved.pages.map((p) => p.file), ["about"]);

  // Missing reads: compose refuses (exit 2) and lists them.
  const out = path.join(tmp, "gate-moved-out");
  let r = gateNode(["--compose", dir, "--out", out, "--base", base]);
  assert.equal(r.code, 2, r.out);
  for (const f of ["tree-about.json", "schema.json", "site-code.json", "interactions-full.json"]) assert.ok(r.out.includes(f), `${f} should be reported missing:\n${r.out}`);
  assert.ok(!fs.existsSync(out), "nothing is written when reads are missing");

  // Supply them: About's tree with an edited text, its code, the changed interaction, the rest unchanged.
  const treeRaw = fs.readFileSync(path.join(DUMP_NOW, "tree-about.json"), "utf8");
  const aboutSnap = readJ(path.join(base, "pages/about.json"));
  const text = aboutSnap.elements.find((e) => e.t === "String" && /^[A-Za-z ]{12,}$/.test(e.x ?? ""))?.x;
  assert.ok(text && treeRaw.includes(`"${text}"`), "a plain text to edit");
  fs.writeFileSync(path.join(dir, "tree-about.json"), treeRaw.replace(`"${text}"`, `"${text} EDITED"`));
  const codeAll = wrappersFromFile(path.join(DUMP_NOW, "page-code.json"));
  writeJ(path.join(dir, "page-code.json"), codeAll.filter((w) => /^[pf]-about$/.test(w.label)));
  assert.equal(codeAll.filter((w) => /^[pf]-about$/.test(w.label)).length, 2);
  for (const f of ["schema", "sitemap", "site-code", "fonts", "assets-1", "assets-2"]) fs.copyFileSync(path.join(DUMP_NOW, `${f}.json`), path.join(dir, `${f}.json`));
  const full = wrappersFromFile(path.join(DUMP_NOW, "interactions-full.json"));
  const entry = full.find((w) => (Array.isArray(w.result) ? w.result[0].id : w.result.id) === ix.id);
  (Array.isArray(entry.result) ? entry.result[0] : entry.result).version = ix.version;
  writeJ(path.join(dir, "interactions-full.json"), [entry]);

  r = gateNode(["--compose", dir, "--out", out, "--base", base]);
  assert.equal(r.code, 0, r.out);
  const merged = wrappersFromFile(path.join(out, "interactions-full.json"));
  assert.equal(merged.length, 14, "all interactions are in the composed dump");
  assert.equal(wrappersFromFile(path.join(out, "page-code.json")).length, 26, "all pages' code is in the composed dump");
  const snap = path.join(tmp, "gate-moved-snap");
  node("scripts/webflow-snapshot.mjs", out, "--out", snap, "--commit", "831b811");
  const ref = path.join(tmp, "gate-moved-ref");
  node("scripts/webflow-snapshot.mjs", DUMP_NOW, "--out", ref, "--commit", "831b811");
  assert.ok(fs.readFileSync(path.join(snap, "pages/about.json"), "utf8").includes(`${text} EDITED`));
  assert.ok(!fs.readFileSync(path.join(ref, "pages/about.json"), "utf8").includes(`${text} EDITED`));
  assert.equal(readJ(path.join(snap, "interactions/ix-reveal.json")).version, ix.version);
  assert.equal(about.lastUpdated, stamp);
  // Everything else is the base: the other pages byte for byte.
  for (const f of fs.readdirSync(path.join(ref, "pages")).filter((f) => f !== "about.json")) {
    assert.ok(fs.readFileSync(path.join(snap, "pages", f)).equals(fs.readFileSync(path.join(ref, "pages", f))), `pages/${f}`);
  }
  assert.ok(fs.readFileSync(path.join(snap, "styles.jsonl")).equals(fs.readFileSync(path.join(ref, "styles.jsonl"))));
  // The reconcile runs on the composed dump: one text PULL for About, the interaction and the signals; nothing else is invented.
  const rep = reconcile(out, path.join(tmp, "gate-moved.md"), ["--base", base]);
  assert.ok(rep.rows.some((x) => x.area === "Elements" && /EDITED/.test(String(x.webflow ?? ""))), JSON.stringify(rep.rows.map((x) => [x.area, x.key])));
});

function wrappersFromFile(f) {
  const raw = readJ(f);
  const list = Array.isArray(raw) ? raw : [raw];
  return list.flatMap((x) => (x?.type === "text" ? [JSON.parse(x.text)] : [x]));
}

test("gate: a full dump is required when there is no base, its raw dump is gone or changed, or the base was partially refreshed; an edit during the dump is refused", NEEDS_DUMP, () => {
  const base = gateBase();
  const dir = gatePartial("gate-full");
  // no base
  let r = gateNode(["--plan", dir, "--base", path.join(tmp, "no-such-base")]);
  assert.equal(r.code, 3, r.out);
  assert.ok(/FULL DUMP REQUIRED/.test(r.out) && /resets the base/.test(r.out), r.out);
  // empty partial dir: the plan lists the five signal reads
  r = gateNode(["--plan", path.join(tmp, "gate-empty"), "--base", base]);
  assert.equal(r.code, 2);
  assert.equal((r.out.match(/^- /gm) ?? []).length, 5, r.out);
  // raw dump gone / changed / partially refreshed
  const variant = (label, patch) => {
    const d = path.join(tmp, `gate-base-${label}`);
    fs.cpSync(base, d, { recursive: true });
    const mf = readJ(path.join(d, "manifest.json"));
    patch(mf);
    writeJ(path.join(d, "manifest.json"), mf);
    return d;
  };
  r = gateNode(["--plan", dir, "--base", variant("gone", (m) => { m.dump = ".cache/webflow-dump/19990101T000000Z"; })]);
  assert.equal(r.code, 3);
  assert.ok(/raw dump folder is gone/.test(r.out), r.out);
  r = gateNode(["--plan", dir, "--base", variant("hash", (m) => { m.rawDump["styles.json"] = "0".repeat(64); })]);
  assert.equal(r.code, 3);
  assert.ok(/no longer matches/.test(r.out), r.out);
  r = gateNode(["--plan", dir, "--base", variant("refreshed", (m) => { m.refreshedRows = [{ report: "x", rows: "1", keys: [], newDump: "other", at: "2026-10-13" }]; })]);
  assert.equal(r.code, 3);
  assert.ok(/partially refreshed/.test(r.out), r.out);
  // compose with a full-dump verdict exits 3 and writes nothing
  r = gateNode(["--compose", dir, "--out", path.join(tmp, "gate-full-out"), "--base", path.join(tmp, "no-such-base")]);
  assert.equal(r.code, 3);
  assert.ok(!fs.existsSync(path.join(tmp, "gate-full-out")));
  // someone edits during the dump: site-after differs from site-before
  const w = wrapOf(path.join(dir, "site-after.json"));
  w.result.lastUpdated = "2026-10-14T10:00:00.000Z";
  writeJ(path.join(dir, "site-after.json"), w);
  const sb = wrapOf(path.join(dir, "site-before.json"));
  sb.result.lastUpdated = "2026-10-14T09:59:00.000Z";
  writeJ(path.join(dir, "site-before.json"), sb);
  for (const f of ["site-code", "fonts", "assets-1", "assets-2"]) fs.copyFileSync(path.join(DUMP_NOW, `${f}.json`), path.join(dir, `${f}.json`));
  r = gateNode(["--compose", dir, "--out", path.join(tmp, "gate-edit-out"), "--base", base]);
  assert.equal(r.code, 1, r.out);
  assert.ok(/moved during the gate dump/.test(r.out), r.out);
  assert.ok(!fs.existsSync(path.join(tmp, "gate-edit-out")));
});

test.after(() => {
  for (const wt of worktrees) {
    try {
      execFileSync("git", ["worktree", "remove", "--force", wt], { cwd: ROOT, stdio: "ignore" });
    } catch {
      // already gone
    }
  }
  try {
    execFileSync("git", ["worktree", "prune"], { cwd: ROOT, stdio: "ignore" });
  } catch {
    // not a git checkout
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});
