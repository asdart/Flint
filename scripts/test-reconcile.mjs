// Tests for the reconcile tools (scripts/webflow-map.mjs, scripts/webflow-tree-diff-ids.mjs).
// Run: node --test scripts/test-reconcile.mjs
// Reads .cache/webflow-dump/ (gitignored) and docs/webflow/snapshot/data/; a test skips with a message
// when its input is absent. Writes only to a temp folder.
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

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
