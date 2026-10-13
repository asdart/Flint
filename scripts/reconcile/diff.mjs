// Base-vs-new comparison of two snapshots, by identity: element id (trees), selector (styles),
// variable id, interaction name, page id, component id, asset id, collection id. Returns a flat list
// of changes { area, where, id, field, base, new, … }. No repo knowledge here: reconcile stage 2 adds
// repo locations (via map/) and the three-way logic.
import { loadSnapshot } from "./snapshot-io.mjs";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const nul = (v) => (v === undefined ? null : v);

/** Longest increasing subsequence (indexes into `seq`), to find the siblings that really moved. */
function lis(seq) {
  const tails = [];
  const prev = new Array(seq.length).fill(-1);
  const idx = [];
  seq.forEach((v, i) => {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (seq[tails[mid]] < v) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tails[lo - 1];
    tails[lo] = i;
    idx[lo] = i;
  });
  const keep = new Set();
  let k = tails.at(-1);
  while (k !== undefined && k >= 0) {
    keep.add(k);
    k = prev[k];
  }
  return keep;
}

function ctxOf(e) {
  const c = { t: e.t || "(br)" };
  if (e.s?.tag) c.tag = e.s.tag;
  if (e.c?.length) c.c = e.c;
  if (e.x !== undefined) c.x = e.x.length > 80 ? `${e.x.slice(0, 80)}…` : e.x;
  if (e.i?.name) c.comp = e.i.name;
  return c;
}

/** Compares two element lists of one page or component. */
function diffElements(where, baseEls, newEls, out) {
  const B = new Map(baseEls.map((e, i) => [e.id, { ...e, _i: i }]));
  const N = new Map(newEls.map((e, i) => [e.id, { ...e, _i: i }]));
  const push = (id, field, base, nw, extra = {}) => out.push({ area: "element", where, id, field, base: nul(base), new: nul(nw), ...extra });
  const added = [];
  const removed = [];
  for (const [id, e] of N) if (!B.has(id)) added.push(e);
  for (const [id, e] of B) if (!N.has(id)) removed.push(e);

  // A text run that Webflow split or re-created: same parent, same count of removed and added Strings.
  const byParent = (list) => {
    const m = new Map();
    for (const e of list.filter((x) => x.t === "String")) m.set(e.p, [...(m.get(e.p) ?? []), e]);
    return m;
  };
  const rp = byParent(removed);
  const ap = byParent(added);
  const paired = new Set();
  for (const [p, rs] of rp) {
    const as = ap.get(p);
    if (!as || as.length !== rs.length) continue;
    rs.forEach((r, i) => {
      push(r.id, "text", r.x, as[i].x, { idChanged: true, newId: as[i].id, parent: p, ctx: ctxOf(r) });
      paired.add(r.id);
      paired.add(as[i].id);
    });
  }
  for (const e of removed) if (!paired.has(e.id)) push(e.id, "removed", { ...e, _i: undefined }, null, { parent: e.p, index: e._i, ctx: ctxOf(e) });
  for (const e of added) if (!paired.has(e.id)) push(e.id, "added", null, { ...e, _i: undefined }, { parent: e.p, index: e._i, ctx: ctxOf(e) });

  // Content changes on elements present on both sides.
  for (const [id, n] of N) {
    const b = B.get(id);
    if (!b) continue;
    const ctx = ctxOf(n);
    if (b.t !== n.t) push(id, "type", b.t, n.t, { ctx });
    if (n.t === "String" && b.x !== n.x) push(id, "text", b.x, n.x, { parent: n.p, ctx });
    if (!same(b.c ?? [], n.c ?? [])) push(id, "classes", b.c ?? [], n.c ?? [], { ctx });
    for (const k of new Set([...Object.keys(b.s ?? {}), ...Object.keys(n.s ?? {})])) if (!same(b.s?.[k], n.s?.[k])) push(id, `settings.${k}`, b.s?.[k], n.s?.[k], { ctx });
    for (const k of new Set([...Object.keys(b.a ?? {}), ...Object.keys(n.a ?? {})])) if (!same(b.a?.[k], n.a?.[k])) push(id, `attr.${k}`, b.a?.[k], n.a?.[k], { ctx });
    if (b.i || n.i) {
      if (b.i?.comp !== n.i?.comp) push(id, "component", b.i?.name ?? b.i?.comp, n.i?.name ?? n.i?.comp, { ctx });
      for (const k of new Set([...Object.keys(b.i?.props ?? {}), ...Object.keys(n.i?.props ?? {})])) if (!same(b.i?.props?.[k], n.i?.props?.[k])) push(id, `prop.${k}`, b.i?.props?.[k], n.i?.props?.[k], { ctx });
      if (!same(b.i?.slots ?? [], n.i?.slots ?? [])) push(id, "slots", b.i?.slots ?? [], n.i?.slots ?? [], { ctx });
    }
  }

  // Moves: a changed parent, or a sibling that is out of order among the siblings both sides share.
  const kidsOf = (map) => {
    const m = new Map();
    for (const e of [...map.values()].sort((a, b) => a._i - b._i)) if (e.p !== null) m.set(e.p, [...(m.get(e.p) ?? []), e.id]);
    return m;
  };
  const bk = kidsOf(B);
  const nk = kidsOf(N);
  for (const [id, n] of N) {
    const b = B.get(id);
    if (b && b.p !== n.p && b.p !== null && n.p !== null) push(id, "moved", { parent: b.p, index: bk.get(b.p).indexOf(id) }, { parent: n.p, index: nk.get(n.p).indexOf(id) }, { ctx: ctxOf(n), parentChanged: true });
  }
  for (const [p, nlist] of nk) {
    const blist = bk.get(p);
    if (!blist) continue;
    const common = nlist.filter((id) => B.get(id)?.p === p);
    const baseOrder = blist.filter((id) => N.get(id)?.p === p);
    if (same(common, baseOrder)) continue;
    const seq = common.map((id) => baseOrder.indexOf(id));
    const keep = lis(seq);
    common.forEach((id, i) => {
      if (keep.has(i)) return;
      push(id, "moved", { parent: p, index: blist.indexOf(id) }, { parent: p, index: nlist.indexOf(id), after: nlist[nlist.indexOf(id) - 1] ?? null }, { ctx: ctxOf(N.get(id)) });
    });
  }
}

const brief = nul;

/** Leaf-level diff of two JSON values; arrays are compared whole unless `keyed` says how to match them. */
function deepDiff(base, nw, emit, prefix = "", keyed = {}) {
  if (same(base, nw)) return;
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (isObj(base) && isObj(nw)) {
    for (const k of [...new Set([...Object.keys(base), ...Object.keys(nw)])].sort()) deepDiff(base[k], nw[k], emit, prefix ? `${prefix}.${k}` : k, keyed);
    return;
  }
  const keyFn = keyed[prefix.replace(/\[[^\]]*\]/g, "[]")];
  if (keyFn && Array.isArray(base) && Array.isArray(nw)) {
    const bm = new Map(base.map((x) => [keyFn(x), x]));
    const nm = new Map(nw.map((x) => [keyFn(x), x]));
    for (const k of [...new Set([...bm.keys(), ...nm.keys()])]) deepDiff(bm.get(k), nm.get(k), emit, `${prefix}[${k}]`, keyed);
    return;
  }
  emit(prefix, nul(base), nul(nw));
}

function diffStyles(baseStyles, newStyles, out) {
  const B = new Map(baseStyles.map((s) => [s.sel, s]));
  const N = new Map(newStyles.map((s) => [s.sel, s]));
  const push = (sel, field, base, nw, extra = {}) => out.push({ area: "style", where: sel, id: null, field, base: nul(base), new: nul(nw), ...extra });
  const flat = (s) => {
    const m = new Map();
    if (!s) return m;
    for (const [pseudo, props] of Object.entries(s.base ?? {})) for (const [p, v] of Object.entries(props)) m.set(`main\u0000${pseudo}\u0000${p}`, v);
    for (const [bp, ps] of Object.entries(s.bp ?? {})) for (const [pseudo, props] of Object.entries(ps)) for (const [p, v] of Object.entries(props)) m.set(`${bp}\u0000${pseudo}\u0000${p}`, v);
    return m;
  };
  for (const sel of [...new Set([...B.keys(), ...N.keys()])].sort()) {
    const b = B.get(sel);
    const n = N.get(sel);
    if (!b) {
      push(sel, "added", null, n);
      continue;
    }
    if (!n) {
      push(sel, "removed", b, null);
      continue;
    }
    if (b.type !== n.type) push(sel, "type", b.type, n.type);
    const fb = flat(b);
    const fn = flat(n);
    for (const key of [...new Set([...fb.keys(), ...fn.keys()])].sort()) {
      if (fb.get(key) === fn.get(key)) continue;
      const [bp, pseudo, prop] = key.split("\u0000");
      push(sel, prop, fb.get(key), fn.get(key), { bp, pseudo });
    }
  }
}

/** Compares page (or component) headers, by identity id. */
function diffPages(base, nw, out) {
  const B = new Map(Object.entries(base).map(([file, p]) => [p.pageId, { ...p, file }]));
  const N = new Map(Object.entries(nw).map(([file, p]) => [p.pageId, { ...p, file }]));
  for (const id of new Set([...B.keys(), ...N.keys()])) {
    const b = B.get(id);
    const n = N.get(id);
    const where = `page:${(n ?? b).file}`;
    if (!b) {
      out.push({ area: "page", where, id, field: "added", base: null, new: { title: n.title, slug: n.slug, file: n.file }, elements: n.elements.length });
      continue;
    }
    if (!n) {
      out.push({ area: "page", where, id, field: "removed", base: { title: b.title, slug: b.slug, file: b.file }, new: null, elements: b.elements.length });
      continue;
    }
    if (b.file !== n.file) out.push({ area: "page", where, id, field: "file", base: b.file, new: n.file });
    const emit = (field, bv, nv) => out.push({ area: "page", where, id, field, base: brief(bv), new: brief(nv) });
    for (const k of ["title", "slug", "publishedPath", "draft", "archived", "seo", "openGraph", "collectionId", "includeInSitemap", "jsonLd", "jsonLdRaw", "scripts", "head", "footer", "headUnreadable"]) deepDiff(b[k], n[k], (f, bv, nv) => emit(f || k, bv, nv), k);
    diffElements(where, b.elements, n.elements, out);
  }
}

function diffComponents(base, nw, out) {
  const B = new Map(Object.entries(base).map(([file, c]) => [c.id, { ...c, file }]));
  const N = new Map(Object.entries(nw).map(([file, c]) => [c.id, { ...c, file }]));
  for (const id of new Set([...B.keys(), ...N.keys()])) {
    const b = B.get(id);
    const n = N.get(id);
    const where = `component:${(n ?? b).file}`;
    if (!b) {
      out.push({ area: "component", where, id, field: "added", base: null, new: { name: n.name, group: n.group, props: n.props, variants: n.variants }, elements: n.elements.length });
      continue;
    }
    if (!n) {
      out.push({ area: "component", where, id, field: "removed", base: { name: b.name, group: b.group }, new: null, elements: b.elements.length });
      continue;
    }
    const emit = (field, bv, nv) => out.push({ area: "component", where, id, field, base: brief(bv), new: brief(nv) });
    for (const k of ["name", "group", "description"]) deepDiff(b[k], n[k], (f, bv, nv) => emit(f || k, bv, nv), k);
    deepDiff(b.props, n.props, (f, bv, nv) => emit(f, bv, nv), "props", { props: (p) => p.id });
    deepDiff(b.variants, n.variants, (f, bv, nv) => emit(f, bv, nv), "variants", { variants: (v) => v.id });
    deepDiff(b.variantStyles, n.variantStyles, (f, bv, nv) => emit(f, bv, nv), "variantStyles");
    diffElements(where, b.elements, n.elements, out);
  }
}

function diffVariables(base, nw, out) {
  const B = new Map(Object.entries(base).map(([name, v]) => [v.id, { name, ...v }]));
  const N = new Map(Object.entries(nw).map(([name, v]) => [v.id, { name, ...v }]));
  for (const id of new Set([...B.keys(), ...N.keys()])) {
    const b = B.get(id);
    const n = N.get(id);
    const where = (n ?? b).name;
    if (!b) out.push({ area: "variable", where, id, field: "added", base: null, new: { type: n.type, value: n.value } });
    else if (!n) out.push({ area: "variable", where, id, field: "removed", base: { type: b.type, value: b.value }, new: null });
    else {
      if (b.name !== n.name) out.push({ area: "variable", where, id, field: "name", base: b.name, new: n.name });
      if (b.type !== n.type) out.push({ area: "variable", where, id, field: "type", base: b.type, new: n.type });
      if (!same(b.value, n.value)) out.push({ area: "variable", where, id, field: "value", base: b.value, new: n.value });
    }
  }
}

function diffInteractions(base, nw, out) {
  for (const name of [...new Set([...Object.keys(base), ...Object.keys(nw)])].sort()) {
    const b = base[name];
    const n = nw[name];
    if (!b) out.push({ area: "interaction", where: name, id: n.id, field: "added", base: null, new: n });
    else if (!n) out.push({ area: "interaction", where: name, id: b.id, field: "removed", base: b, new: null });
    else for (const k of new Set([...Object.keys(b), ...Object.keys(n)])) if (!same(b[k], n[k])) out.push({ area: "interaction", where: name, id: n.id, field: k, base: nul(b[k]), new: nul(n[k]) });
  }
}

function diffAssets(base, nw, out) {
  const B = new Map(base.map((a) => [a.id, a]));
  const N = new Map(nw.map((a) => [a.id, a]));
  for (const id of [...new Set([...B.keys(), ...N.keys()])].sort()) {
    const b = B.get(id);
    const n = N.get(id);
    const where = (n ?? b).displayName;
    if (!b) out.push({ area: "asset", where, id, field: "added", base: null, new: n });
    else if (!n) out.push({ area: "asset", where, id, field: "removed", base: b, new: null });
    else for (const k of new Set([...Object.keys(b), ...Object.keys(n)])) if (!same(b[k], n[k])) out.push({ area: "asset", where, id, field: k, base: nul(b[k]), new: nul(n[k]) });
  }
}

/** Every change between two loaded snapshots. */
export function diffSnapshots(base, nw) {
  const out = [];
  diffPages(base.pages, nw.pages, out);
  diffComponents(base.components, nw.components, out);
  diffStyles(base.styles, nw.styles, out);
  diffVariables(base.variables, nw.variables, out);
  diffInteractions(base.interactions, nw.interactions, out);
  diffAssets(base.assets, nw.assets, out);
  const area = (a, where) => (f, bv, nv) => out.push({ area: a, where, id: null, field: f, base: brief(bv), new: brief(nv) });
  deepDiff(base.site, nw.site, area("site", "site"), "", { registeredScripts: (s) => s.id, fonts: (f) => f.fileName, variableCollections: (c) => c.id });
  deepDiff(base.cms, nw.cms, area("cms", "cms"), "", { collections: (c) => c.id, fields: (c) => c.id, "fields[].fields": (f) => f.id });
  deepDiff(base.manifest.signals, nw.manifest.signals, area("signal", "manifest"), "");
  deepDiff(base.manifest.gaps, nw.manifest.gaps, area("manifest", "gaps"), "");
  return out;
}

export function diffDirs(baseDir, newDir) {
  const b = loadSnapshot(baseDir);
  const n = loadSnapshot(newDir);
  return { base: b, new: n, changes: diffSnapshots(b, n) };
}
