// Tests for the reconcile tools (scripts/webflow-map.mjs, scripts/webflow-tree-diff-ids.mjs,
// scripts/webflow-reconcile.mjs).
// Run: node --test scripts/test-reconcile.mjs
// Reads .cache/webflow-dump/ (gitignored) and docs/webflow/snapshot/data/; a test skips with a message
// when its input is absent. Writes only to a temp folder (scratch git worktrees included, removed at the end);
// never into docs/webflow/reconcile/.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { decode } from "./reconcile/html.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { diffDirs, diffSnapshots } from "./reconcile/diff.mjs";
import { DEFAULT_DATA, loadSnapshot } from "./reconcile/snapshot-io.mjs";

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
  // Webflow edits the user then decided not to keep (restored on Webflow later): the repo never took them, so still PULL.
  const facility = dir((r) => r.ref?.id === "856210ce-e333-114f-bf85-ec97d3823b1b" && r.ref.field === "classes");
  assert.deepEqual([facility.direction, facility.mode, facility.edit.file], ["PULL", "auto", "src/sections/FacilityValueProp.tsx"]);
  assert.equal(dir((r) => r.where === ".fk-input-field" && r.ref?.field === "transition").direction, "PULL");
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

test("reconcile refuses an incomplete dump", () => {
  const bad = path.join(tmp, "bad-dump");
  fs.mkdirSync(bad);
  fs.writeFileSync(path.join(bad, "site-before.json"), "{}");
  assert.throws(() => execFileSync("node", ["scripts/webflow-reconcile.mjs", bad, "--out", path.join(tmp, "bad.md")], { cwd: ROOT, stdio: "pipe" }), (e) => e.status === 2);
  assert.ok(!fs.existsSync(path.join(tmp, "bad.md")));
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
