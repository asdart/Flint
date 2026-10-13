// The three-way compare: turns the Webflow-side changes (reconcile/diff.mjs) plus what the repo did since
// the base (reconcile/repo-state.mjs, the maps) into report rows: PULL, CONFLICT, CONVERGED, REPO AHEAD, each
// with the proposed repo edit (file:line, old -> new, auto or assisted). See docs/webflow/plans/reconcile.md
// ("The changes report") and docs/webflow/snapshot/README.md ("Reconcile report").
import path from "node:path";
import { classes } from "./align.mjs";
import { norm } from "./html.mjs";
import { allSourceFiles, componentFile, findPattern, findString } from "./locate.mjs";
import { canonToken, flatKey, familyFile, locateCss, normalizeValue, parseTokens, repoValue, sha256, showFile as showFileRaw, readNow as readNowRaw, tokenName, WEBFLOW_DEFAULTS } from "./repo-state.mjs";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const GONE = Symbol("gone");
const cls = (list) => [...new Set(classes(list ?? []))].sort();
const clsJoin = (list) => cls(list).join(" ");

/** direction from "Webflow changed", "repo changed" and "both ended at the same value". */
export const direction = (wf, repo, converged) => (wf && repo ? (converged ? "CONVERGED" : "CONFLICT") : wf ? "PULL" : "REPO AHEAD");

const entryAt = (maps, where, id) => {
  const i = where.indexOf(":");
  return maps?.[where.slice(0, i) === "page" ? "pages" : "components"]?.[where.slice(i + 1)]?.elements?.[id];
};

/** Short description of an element for the report. */
function describe(ctx) {
  if (!ctx) return "";
  if (ctx.x !== undefined) return JSON.stringify(ctx.x.length > 50 ? `${ctx.x.slice(0, 50)}…` : ctx.x);
  const head = ctx.comp ? `${ctx.comp} instance` : ctx.tag ?? ctx.t;
  return `${head}${ctx.c?.length ? ` .${ctx.c.join(".")}` : ""}`;
}

const AREA_ORDER = ["Elements", "Styles", "Variables", "Components", "Pages", "Custom code", "Interactions", "Assets", "Site and CMS"];

const memo = (fn) => {
  const m = new Map();
  return (...a) => {
    const k = a.join("\u0000");
    if (!m.has(k)) m.set(k, fn(...a));
    return m.get(k);
  };
};
const readNow = memo(readNowRaw);
const showFile = memo(showFileRaw);

export class Rows {
  constructor(ctx) {
    this.ctx = ctx;
    this.rows = [];
    this.footer = { noise: [], accepted: 0, signals: [], goneFromRender: 0, versionOnly: [], unlocated: [] };
    this.order = 0;
  }

  add(row) {
    this.rows.push({ order: this.order++, notes: [], ...row });
  }

  // ---- Elements --------------------------------------------------------------------------------
  elements(changes) {
    const by = new Map();
    for (const c of changes) by.set(c.where, [...(by.get(c.where) ?? []), c]);
    for (const [where, cs] of by) {
      const sets = { added: new Map(), removed: new Map() };
      for (const c of cs) if (c.field === "added" || c.field === "removed") sets[c.field].set(c.id, c);
      const subtree = new Map();
      const topOf = (c) => {
        let cur = c;
        while (sets[c.field].has(cur.parent)) cur = sets[c.field].get(cur.parent);
        return cur;
      };
      for (const c of cs) if ((c.field === "added" || c.field === "removed") && sets[c.field].has(c.parent)) subtree.set(topOf(c).id, (subtree.get(topOf(c).id) ?? 1) + 1);
      for (const c of cs) {
        if ((c.field === "added" || c.field === "removed") && sets[c.field].has(c.parent)) continue;
        const key = `${c.area}|${where}|${c.id}|${c.field}`;
        const base = { key, area: "Elements", sub: c.field, where, element: describe(c.ctx), id: c.id, change: c };
        if (c.field === "text") this.add({ ...base, ...this.textRow(c) });
        else if (c.field === "classes") this.add({ ...base, ...this.classRow(c) });
        else if (c.field.startsWith("prop.")) this.add({ ...base, ...this.propRow(c) });
        else if (c.field === "added" || c.field === "removed" || c.field === "moved") this.add({ ...base, ...this.structureRow(c, subtree.get(c.id) ?? 1) });
        else this.add({ ...base, ...this.otherRow(c) });
      }
    }
  }

  /** Common wrapper: edit location for an element change when the repo side cannot be compared. */
  loc(c) {
    return entryAt(this.ctx.locMaps, c.where, c.id) ?? entryAt(this.ctx.baseMaps, c.where, c.id);
  }

  componentNote(c) {
    return c.where.startsWith("component:") ? ["edits the component definition: applies to every instance"] : [];
  }

  textRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const loc = ne ?? be;
    const notes = [...this.componentNote(c)];
    if (c.idChanged) notes.push("Webflow re-created this text run (new element id)");
    if (!loc) return { webflow: c.new, base: c.base, direction: "PULL", mode: "assisted", edit: null, notes: [...notes, "no repo location in the map (element not mapped): find the text by hand"] };
    const repoBase = be ? be.repoText ?? be.text : c.base;
    const repoNow = nowMaps ? (ne ? ne.repoText ?? ne.text : GONE) : repoBase;
    const repoChanged = repoNow === GONE || norm(repoNow) !== norm(repoBase);
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const converged = (repoNow !== GONE && norm(repoNow) === norm(c.new)) || (!!nme && nme.k === "text" && nme.repoText === undefined);
    const dir = direction(true, repoChanged, converged);
    const edit = { op: "replace-text", file: loc.file, line: loc.line, locate: loc.locate, old: c.base, new: c.new };
    if (loc.of) Object.assign(edit, { occ: loc.occ, of: loc.of, alts: loc.alts });
    if (be?.repoText !== undefined) notes.push(`the repo builds this text from parts (repo renders ${JSON.stringify(be.repoText)})`);
    if (loc.of) notes.push(`${loc.of} places hold this string; the map picked occurrence ${loc.occ}${loc.alts?.length ? ` (others: ${loc.alts.join(", ")})` : ""}`);
    if (loc.locate === "manual") notes.push("text not found as a literal: edit by hand in the element's file");
    if (loc.locate === "partial") notes.push("only the start or end of the text was found on that line");
    const verified = loc.file && loc.line && !["manual"].includes(loc.locate) && findString(loc.file, c.base).lines.includes(loc.line);
    const auto = dir === "PULL" && (loc.locate === "literal" || loc.locate === "data") && !loc.of && be?.repoText === undefined && !loc.part && verified;
    return { webflow: c.new, base: c.base, repo: dir === "CONFLICT" ? (repoNow === GONE ? "(element not found in the repo render)" : repoNow) : undefined, direction: dir, mode: auto ? "auto" : "assisted", edit, notes };
  }

  classRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const loc = ne ?? be;
    const notes = [...this.componentNote(c)];
    const wfBase = cls(c.base);
    const wfNew = cls(c.new);
    const repoBase = be ? (be.rc ?? wfBase) : wfBase;
    const repoNow = nowMaps ? (ne ? ne.rc ?? wfBase : GONE) : repoBase;
    const repoChanged = repoNow === GONE || repoNow.join(" ") !== repoBase.join(" ");
    // Aligning the working tree with the NEW tree is a second witness that the repo already has Webflow's classes.
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const converged = (repoNow !== GONE && repoNow.join(" ") === wfNew.join(" ")) || (!!nme && nme.k === "el" && !nme.rc);
    const dir = loc ? direction(true, repoChanged, converged) : "PULL";
    const removed = wfBase.filter((x) => !wfNew.includes(x));
    const added = wfNew.filter((x) => !wfBase.includes(x));
    const res = { base: c.base.join(" "), webflow: c.new.join(" "), repo: dir === "CONFLICT" ? (repoNow === GONE ? "(element not found in the repo render)" : repoNow.join(" ")) : undefined, direction: dir, notes };
    if (!loc) return { ...res, mode: "assisted", edit: null, notes: [...notes, "no repo location in the map (element not mapped)"] };
    const edit = { op: "change-classes", file: loc.file, line: loc.line, remove: removed, add: added, tag: loc.k };
    let line = null;
    if (removed.length === 1 && added.length === 1 && loc.file) {
      line = findPattern(loc.file, new RegExp(`(^|[^a-z0-9-])${esc(removed[0])}($|[^a-z0-9-])`), loc.line, 40);
      if (line) edit.line = line;
    }
    if (!line) notes.push(`class token not found near ${loc.file}:${loc.line}: ${loc.file?.includes("/lib/") ? "the element is rendered by a shared helper, edit its caller" : "classes may come from a helper or a utility list"}`);
    if (be?.rc) notes.push("the repo's class list differs from Webflow's for this element already");
    return { ...res, mode: dir === "PULL" && line && !be?.rc && removed.length === 1 && added.length === 1 ? "auto" : "assisted", edit };
  }

  propRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const name = c.field.slice(5);
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const loc = ne ?? be;
    const notes = [...this.componentNote(c)];
    const val = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v);
    const res = { base: val(c.base) ?? null, webflow: val(c.new) ?? null, direction: "PULL", notes, mode: "assisted", edit: null };
    const bp = be?.props?.[name];
    const np = ne?.props?.[name];
    const p = np ?? bp;
    if (!loc || !p) return { ...res, notes: [...notes, "no repo location for this instance prop in the map (new override, or prop not mapped)"] };
    const repoBase = bp ? bp.repoValue ?? bp.value : c.base;
    const repoNow = nowMaps ? (np ? np.repoValue ?? np.value : GONE) : repoBase;
    const repoChanged = repoNow === GONE || !same(repoNow, repoBase);
    const converged = repoNow !== GONE && same(repoNow, c.new);
    const dir = direction(true, repoChanged, converged);
    const edit = { op: "set-prop", comp: loc.comp, prop: name, repoProp: p.prop, file: p.file, line: p.line, locate: p.locate, old: c.base ?? null, new: c.new ?? null };
    if (p.locate === "default") notes.push(`the repo does not pass this prop: the edit is the component default in ${p.file}:${p.line} and changes every instance that relies on it`);
    if (p.locate === "manual" || !p.file) notes.push("prop not found in the repo (CMS-bound, derived or computed): edit by hand");
    if (p.repoValue !== undefined) notes.push(`the repo passes ${JSON.stringify(p.repoValue)} (Webflow stores it differently)`);
    const plain = ["string", "number", "boolean"].includes(typeof c.new) || c.new === null;
    return { ...res, repo: dir === "CONFLICT" ? (repoNow === GONE ? "(instance not found in the repo render)" : val(repoNow)) : undefined, direction: dir, edit, mode: dir === "PULL" && ["attr", "literal", "data"].includes(p.locate) && plain && p.repoValue === undefined ? "auto" : "assisted" };
  }

  structureRow(c, count) {
    const { baseMaps, nowMaps, nw } = this.ctx;
    const notes = [...this.componentNote(c)];
    if (count > 1) notes.push(`${count} elements (the element and its descendants)`);
    if (c.field === "added") {
      // Aligning the working-tree render with the NEW tree shows whether the repo already has the element.
      const nme = entryAt(this.ctx.newMaps, c.where, c.id);
      if (nme && nme.k !== "body") {
        const same1 = nme.k === "el" ? !nme.rc : nme.k === "inst" ? true : nme.repoText === undefined;
        return { base: null, webflow: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), repo: same1 ? undefined : nme.rc ? nme.rc.join(" ") : "(differs)", direction: same1 ? "CONVERGED" : "CONFLICT", mode: "assisted", edit: { op: "add-element", file: nme.file, line: nme.line, parent: c.parent, index: c.index, element: c.new }, notes: [...notes, "the repo already has a matching element here"] };
      }
      // The nearest mapped ancestor tells where to insert it.
      const i = c.where.indexOf(":");
      const tree = (c.where.startsWith("page:") ? nw.pages : nw.components)[c.where.slice(i + 1)];
      let cur = c.parent;
      let at = null;
      while (cur && !at) {
        at = entryAt(this.ctx.locMaps, c.where, cur) ?? entryAt(baseMaps, c.where, cur);
        cur = at ? cur : tree?.byId.get(cur)?.p;
      }
      const edit = { op: "add-element", file: at?.file ?? null, line: at?.line ?? null, parent: c.parent, index: c.index, element: c.new };
      return { base: null, webflow: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), direction: "PULL", mode: "assisted", edit, notes: [...notes, at ? "insert inside the nearest mapped ancestor" : "no mapped ancestor: place by hand", "repo side not compared for new elements"] };
    }
    const be = entryAt(baseMaps, c.where, c.id);
    const goneInRepo = nowMaps && be && !entryAt(nowMaps, c.where, c.id);
    const loc = entryAt(this.ctx.locMaps, c.where, c.id) ?? be;
    const edit = { op: c.field === "removed" ? "remove-element" : "move-element", file: loc?.file ?? null, line: loc?.line ?? null, base: c.base, new: c.new, after: c.after };
    if (!loc) notes.push("element not mapped: locate by hand");
    if (c.field === "removed") {
      const dir = direction(true, !!goneInRepo, !!goneInRepo);
      return { base: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), webflow: null, direction: dir, mode: "assisted", edit, notes };
    }
    if (nowMaps) notes.push("repo side not compared for moves");
    return { base: JSON.stringify(c.base), webflow: JSON.stringify(c.new), direction: "PULL", mode: "assisted", edit, notes };
  }

  otherRow(c) {
    const loc = this.loc(c);
    const notes = [...this.componentNote(c)];
    if (this.ctx.nowMaps) notes.push("repo side not compared for this field");
    const v = (x) => (x && typeof x === "object" ? JSON.stringify(x) : x ?? null);
    const edit = loc ? { op: `set-${c.field}`, file: loc.file ?? null, line: loc.line ?? null, old: c.base ?? null, new: c.new ?? null } : null;
    if (!loc) notes.push("element not mapped: locate by hand");
    let mode = "assisted";
    if (edit && loc.file && typeof c.base === "string" && c.base && typeof c.new === "string" && c.field.startsWith("attr.")) {
      const line = findPattern(loc.file, new RegExp(`\\b${esc(c.field.slice(5))}\\s*=\\s*[{"']*${esc(c.base)}`), loc.line, 30);
      if (line) {
        edit.line = line;
        mode = "auto";
      }
    }
    return { base: v(c.base), webflow: v(c.new), direction: "PULL", mode, edit, notes };
  }

  /** Repo-ahead elements: a mapped element whose repo text, classes or prop value changed while Webflow's did not. */
  elementsRepoAhead() {
    const { baseMaps, nowMaps, nw, webflowChangeKeys } = this.ctx;
    if (!nowMaps) return;
    for (const kind of ["pages", "components"]) {
      for (const [slug, { elements }] of Object.entries(baseMaps[kind] ?? {})) {
        const where = `${kind === "pages" ? "page" : "component"}:${slug}`;
        const tree = (kind === "pages" ? nw.pages : nw.components)[slug];
        for (const [id, be] of Object.entries(elements)) {
          const ne = nowMaps[kind]?.[slug]?.elements?.[id];
          if (!ne) {
            this.footer.goneFromRender++;
            continue;
          }
          const node = tree?.byId.get(id);
          if (!node) continue;
          const mk = (field, sub, baseV, nowV, wfV, edit, mode = "assisted") =>
            this.add({ key: `repo|${where}|${id}|${field}`, area: "Elements", sub, where, id, element: describe({ t: node.t, tag: node.s?.tag, c: node.c, x: node.x, comp: node.i?.name }), base: wfV, webflow: wfV, repo: nowV, repoBase: baseV, direction: "REPO AHEAD", mode, edit, notes: [] });
          if (be.k === "text") {
            const b = be.repoText ?? be.text;
            const n = ne.repoText ?? ne.text;
            if (norm(b) !== norm(n) && norm(n) !== norm(node.x ?? "") && !webflowChangeKeys.has(`${where}|${id}|text`)) mk("text", "text", b, n, node.x, { op: "replace-text", file: ne.file, line: ne.line });
          } else if (be.k === "el" && !/^(Form|Dynamo|Pagination|Dropdown|HtmlEmbed|Slot|RichText)/.test(node.t)) {
            const bc = be.rc ?? cls(node.c);
            const nc = ne.rc ?? cls(node.c);
            if (bc.join(" ") !== nc.join(" ") && nc.join(" ") !== clsJoin(node.c) && !webflowChangeKeys.has(`${where}|${id}|classes`)) mk("classes", "classes", bc.join(" "), nc.join(" "), clsJoin(node.c), { op: "change-classes", file: ne.file, line: ne.line });
          } else if (be.k === "inst") {
            for (const [name, bp] of Object.entries(be.props ?? {})) {
              const np = ne.props?.[name];
              if (!np) continue;
              const b = bp.repoValue ?? bp.value;
              const n = np.repoValue ?? np.value;
              if (!same(b, n) && !same(n, node.i?.props?.[name]) && !webflowChangeKeys.has(`${where}|${id}|prop.${name}`)) mk(`prop.${name}`, `prop.${name}`, b, n, node.i?.props?.[name], { op: "set-prop", file: np.file, line: np.line });
            }
          }
        }
      }
    }
  }

  // ---- Styles ----------------------------------------------------------------------------------
  cssValue(v) {
    return v === null || v === undefined ? v : String(v).replace(/var\(([^)]+)\)/g, "var(--$1)");
  }

  /** Hint when a raw Webflow value equals exactly one token (rule 2: tokens for system values). */
  snapHint(value) {
    if (value === null || value === undefined || /var\(/.test(String(value))) return null;
    const canon = String(value).replace(/\s+/g, "").toLowerCase();
    const hits = [...this.ctx.tokens.r1].filter(([, t]) => String(t.value).replace(/\s+/g, "").toLowerCase() === canon);
    return hits.length === 1 ? `value equals token --${hits[0][0]}: snap to var(--${hits[0][0]})?` : null;
  }

  styleLine(sel, bp, pseudo, prop, repo, wf) {
    return `${sel} @${bp}:${pseudo} ${prop}: ${repo === undefined ? "(not in repo)" : repo} → ${wf === undefined ? "(missing)" : wf}`;
  }

  styles(changes) {
    const { css, accepted, files } = this.ctx;
    for (const c of changes) {
      const sel = c.where;
      const key = `style|${sel}|${c.field}|${c.bp ?? ""}|${c.pseudo ?? ""}`;
      const notes = [];
      if (c.field === "added" || c.field === "removed") {
        const style = c.field === "added" ? c.new : c.base;
        const props = [];
        for (const [pseudo, p] of Object.entries(style.base ?? {})) for (const [k, v] of Object.entries(p)) props.push(["main", pseudo, k, normalizeValue(v)]);
        for (const [bp, ps] of Object.entries(style.bp ?? {})) for (const [pseudo, p] of Object.entries(ps)) for (const [k, v] of Object.entries(p)) props.push([bp, pseudo, k, normalizeValue(v)]);
        const has1 = props.filter(([bp, ps, k]) => repoValue(css.r1, sel, bp, ps, k) !== undefined).length;
        const eq1 = props.filter(([bp, ps, k, v]) => repoValue(css.r1, sel, bp, ps, k) === v).length;
        const has0 = [...css.r0.keys()].some((k) => k.startsWith(`${sel}\u0000`));
        const now = [...css.r1.keys()].some((k) => k.startsWith(`${sel}\u0000`));
        const fam = familyFile(sel, files);
        const hereAt = locateCss(files, sel, "main", "noPseudo", "display") ?? locateCss(files, sel, "main", "noPseudo", props[0]?.[2]);
        if (c.field === "added") {
          const dir = !now ? "PULL" : eq1 === props.length ? "CONVERGED" : "CONFLICT";
          const repoChanged = now && !has0;
          this.add({ key, area: "Styles", sub: "added", where: sel, element: `new style (${props.length} properties)`, base: null, webflow: props.map(([bp, ps, k, v]) => `${k}: ${v}${bp !== "main" || ps !== "noPseudo" ? ` [${bp}/${ps}]` : ""}`).slice(0, 6).join("; ") + (props.length > 6 ? "; …" : ""), repo: dir === "CONFLICT" ? `${has1}/${props.length} properties set, ${eq1} equal` : undefined, direction: direction(true, repoChanged || (now && has0), eq1 === props.length && now), mode: "assisted", edit: { op: "add-rule", file: hereAt?.rule?.file ?? fam.file, line: hereAt?.rule?.line ?? null, selector: sel, properties: props.map(([bp, pseudo, prop, value]) => ({ bp, pseudo, prop, value: this.cssValue(value) })) }, notes: hereAt ? ["the repo has this rule"] : fam.file ? [] : ["no component CSS file for this class family: see classes.md"], change: c });
        } else {
          const unchanged = [...css.r0].filter(([k]) => k.startsWith(`${sel}\u0000`)).every(([k, v]) => css.r1.get(k) === v);
          const dir = !now ? "CONVERGED" : unchanged ? "PULL" : "CONFLICT";
          this.add({ key, area: "Styles", sub: "removed", where: sel, element: `style removed (${props.length} properties)`, base: `${props.length} properties`, webflow: null, direction: dir, mode: "assisted", edit: { op: "remove-rule", file: fam.file, selector: sel }, notes: [], change: c });
        }
        continue;
      }
      if (c.field === "type") continue;
      const bp = c.bp;
      const pseudo = c.pseudo;
      const prop = c.field;
      const wf = c.new === null ? undefined : normalizeValue(c.new);
      const wfBase = c.base === null ? undefined : normalizeValue(c.base);
      if (WEBFLOW_DEFAULTS[prop] && (wf === WEBFLOW_DEFAULTS[prop] || wfBase === WEBFLOW_DEFAULTS[prop]) && (wf === undefined || wfBase === undefined)) {
        this.footer.noise.push(`${sel} @${bp}:${pseudo} ${prop} (Webflow grid default)`);
        continue;
      }
      const r0 = repoValue(css.r0, sel, bp, pseudo, prop);
      const r1 = repoValue(css.r1, sel, bp, pseudo, prop);
      const repoChanged = r0 !== r1;
      const converged = r1 === wf;
      if (r1 !== wf && accepted.has(this.styleLine(sel, bp, pseudo, prop, r1, wf))) {
        this.footer.accepted++;
        continue;
      }
      const dir = direction(true, repoChanged, converged);
      const found = locateCss(files, sel, bp, pseudo, prop);
      let edit;
      let mode = "assisted";
      const newCss = this.cssValue(c.new);
      if (found?.line) {
        edit = { op: c.new === null ? "remove-declaration" : "set-declaration", file: found.file, line: found.line, decl: found.decl, old: found.value, new: newCss };
        if (found.shorthand) notes.push(`the repo sets this through the shorthand \`${found.decl}\``);
        if (/utilities\.css$/.test(found.file)) notes.push("generated: change the token or scripts/gen-utilities.mjs, then regenerate");
        else if (!found.shorthand) mode = "auto";
      } else if (found?.rule) {
        edit = { op: "add-declaration", file: found.rule.file, line: found.rule.line, decl: prop, new: newCss };
        mode = c.new !== null && !/utilities\.css$/.test(found.rule.file) ? "auto" : "assisted";
      } else {
        const fam = familyFile(sel, files);
        edit = { op: "add-rule", file: fam.file, line: null, selector: sel, bp, pseudo, decl: prop, new: newCss };
        notes.push("no rule for this selector/state in src/styles");
      }
      const hint = this.snapHint(c.new);
      if (hint) notes.push(hint);
      this.add({ key, area: "Styles", sub: prop, where: sel, element: `${prop}${bp !== "main" || pseudo !== "noPseudo" ? ` [${bp}/${pseudo}]` : ""}`, base: c.base, webflow: c.new, repo: dir === "CONFLICT" ? r1 ?? "(not set)" : undefined, direction: dir, mode, edit, notes, change: c });
    }
  }

  /** Repo-ahead styles: a property whose repo value changed since the base while Webflow's did not. */
  stylesRepoAhead() {
    const { css, accepted, webflowStyleKeys, wfNewStyles } = this.ctx;
    const keys = new Set([...css.r0.keys(), ...css.r1.keys()]);
    const bySel = new Map();
    for (const k of [...keys].sort()) {
      const [sel, bp, pseudo, prop] = k.split("\u0000");
      const r0 = css.r0.get(k);
      const r1 = css.r1.get(k);
      if (r0 === r1) continue;
      if (webflowStyleKeys.has(k) || webflowStyleKeys.has(`${sel}\u0000*`)) continue;
      const wf = wfNewStyles.get(k) ?? (prop === "overflow-x" || prop === "overflow-y" ? undefined : undefined);
      if (r1 === wf) continue;
      if (accepted.has(this.styleLine(sel, bp, pseudo, prop, r1, wf))) {
        this.footer.accepted++;
        continue;
      }
      bySel.set(sel, [...(bySel.get(sel) ?? []), { bp, pseudo, prop, r0, r1, wf }]);
    }
    for (const [sel, list] of bySel) {
      const noneBefore = [...css.r0.keys()].every((k) => !k.startsWith(`${sel}\u0000`));
      const noneNow = [...css.r1.keys()].every((k) => !k.startsWith(`${sel}\u0000`));
      if (noneBefore || noneNow) {
        this.add({ key: `repo|style|${sel}|${noneBefore ? "added" : "removed"}`, area: "Styles", sub: noneBefore ? "added" : "removed", where: sel, element: `${noneBefore ? "new" : "removed"} style (${list.length} properties)`, base: null, webflow: null, repo: noneBefore ? `${list.length} properties` : "removed", direction: "REPO AHEAD", mode: "assisted", edit: null, notes: ["push at the next sync"] });
        continue;
      }
      for (const p of list) this.add({ key: `repo|style|${sel}|${p.bp}|${p.pseudo}|${p.prop}`, area: "Styles", sub: p.prop, where: sel, element: `${p.prop}${p.bp !== "main" || p.pseudo !== "noPseudo" ? ` [${p.bp}/${p.pseudo}]` : ""}`, base: p.wf ?? null, webflow: p.wf ?? null, repo: p.r1 ?? "(removed)", repoBase: p.r0 ?? null, direction: "REPO AHEAD", mode: "assisted", edit: null, notes: [] });
    }
  }

  // ---- Variables -------------------------------------------------------------------------------
  variables(changes) {
    const { tokens, base, nw } = this.ctx;
    const tokensMd = readNow("docs/webflow/tokens.md")?.split("\n") ?? [];
    for (const c of changes) {
      const name = c.where;
      const type = (c.field === "removed" ? c.base?.type : c.new?.type ?? c.base?.type) ?? nw.variables[name]?.type ?? base.variables[name]?.type;
      const tn = tokenName(name);
      const t0 = tokens.r0.get(tn);
      const t1 = tokens.r1.get(tn);
      const canon = (t) => (t ? canonToken(type, t.value) : null);
      const wfVal = (v) => canonToken(type, v);
      const css = (v) => (v && typeof v === "object" && "value" in v ? `${v.value}${v.unit ?? ""}` : v);
      const key = `variable|${name}|${c.field}`;
      const mdLine = tokensMd.findIndex((l) => l.includes(`\`${name}\``) || l.includes(`\`${tn}\``)) + 1;
      const notes = ["run `node scripts/gen-utilities.mjs` if a spacing or color token changes (utilities.css is generated)"];
      const edit = { op: "", file: "src/styles/tokens.css", line: t1?.line ?? null, tokensMd: mdLine ? `docs/webflow/tokens.md:${mdLine}` : null, token: `--${tn}` };
      let dir;
      let mode = "assisted";
      let b = c.base;
      let w = c.new;
      let repo;
      if (c.field === "added") {
        const eq = t1 && canon(t1) === wfVal(c.new.value);
        dir = !t1 ? "PULL" : eq ? "CONVERGED" : "CONFLICT";
        Object.assign(edit, { op: "add-token", new: css(c.new.value), type: c.new.type });
        w = `${c.new.type} ${JSON.stringify(c.new.value)}`;
        if (dir === "CONFLICT") repo = t1.value;
        notes.push("add the token in its section of tokens.css and a row in tokens.md");
        if (!/-/.test(tn) || tn !== name) notes.push(`Webflow name ${JSON.stringify(name)} is spelled --${tn} in the repo`);
      } else if (c.field === "removed") {
        dir = !t1 ? "CONVERGED" : canon(t1) === canon(t0) ? "PULL" : "CONFLICT";
        Object.assign(edit, { op: "remove-token", old: t1?.value ?? null });
        b = `${c.base.type} ${JSON.stringify(c.base.value)}`;
        if (t1) notes.push("check that nothing in src/ still uses it");
      } else if (c.field === "value") {
        dir = direction(true, canon(t0) !== canon(t1), canon(t1) === wfVal(c.new));
        Object.assign(edit, { op: "set-token", old: t1?.value ?? null, new: css(c.new) });
        if (dir === "CONFLICT") repo = t1?.value ?? "(not in tokens.css)";
        mode = t1 && ["Color", "Size"].includes(type) && !/var\(/.test(t1.value) ? "auto" : "assisted";
        b = JSON.stringify(c.base);
        w = JSON.stringify(c.new);
        if (!t1) notes.push("token not in tokens.css");
      } else if (c.field === "name") {
        const oldT = tokens.r1.get(tokenName(c.base));
        const newT = tokens.r1.get(tn);
        dir = newT && !oldT ? "CONVERGED" : "PULL";
        Object.assign(edit, { op: "rename-token", old: `--${tokenName(c.base)}`, new: `--${tn}`, line: (oldT ?? newT)?.line ?? null });
        notes.push("rename every `var(--old)` in src/ too");
      } else {
        dir = "PULL";
        Object.assign(edit, { op: `set-${c.field}`, old: c.base, new: c.new });
      }
      this.add({ key, area: "Variables", sub: c.field, where: name, element: c.field === "value" ? type : c.field, base: b, webflow: w, repo, direction: dir, mode, edit, notes, change: c });
    }
  }

  tokensRepoAhead() {
    const { tokens, nw, webflowVarNames } = this.ctx;
    const wfByToken = new Map(Object.entries(nw.variables).map(([n, v]) => [tokenName(n), { name: n, ...v }]));
    for (const tn of [...new Set([...tokens.r0.keys(), ...tokens.r1.keys()])].sort()) {
      const t0 = tokens.r0.get(tn);
      const t1 = tokens.r1.get(tn);
      const wf = wfByToken.get(tn);
      const canon = (t) => (t ? canonToken(wf?.type, t.value) : null);
      if (canon(t0) === canon(t1)) continue;
      if (webflowVarNames.has(tn)) continue;
      if (wf && canon(t1) === canonToken(wf.type, wf.value)) continue;
      this.add({ key: `repo|variable|${tn}`, area: "Variables", sub: "value", where: wf?.name ?? tn, element: wf ? wf.type : "token", base: wf ? JSON.stringify(wf.value) : null, webflow: wf ? JSON.stringify(wf.value) : null, repo: t1?.value ?? "(removed)", repoBase: t0?.value ?? null, direction: "REPO AHEAD", mode: "assisted", edit: null, notes: [wf ? "" : "no such variable on Webflow: push at the next sync"].filter(Boolean) });
    }
  }

  // ---- Components ------------------------------------------------------------------------------
  compFile(name) {
    return componentFile(String(name).replace(/[^A-Za-z0-9]/g, ""));
  }

  registryLine(group, name) {
    const lines = readNow("docs/webflow/components.md")?.split("\n") ?? [];
    const i = lines.findIndex((l) => l.includes(`${group} / ${name}`));
    return i >= 0 ? `docs/webflow/components.md:${i + 1}` : null;
  }

  components(changes) {
    const { commit, base, nw } = this.ctx;
    for (const c of changes) {
      const slug = c.where.slice("component:".length);
      const comp = nw.components[slug] ?? base.components[slug];
      const name = (nw.components[slug] ?? base.components[slug])?.name;
      const baseName = base.components[slug]?.name ?? name;
      const file = this.compFile(name);
      const oldFile = this.compFile(baseName);
      const reg = this.registryLine(comp?.group ?? "UI", name);
      const key = `component|${c.where}|${c.field}`;
      const notes = [];
      const textNow = file ? readNow(file) ?? "" : "";
      const textThen = oldFile ? showFile(commit, oldFile) ?? "" : "";
      const has = (text, ident) => !!ident && new RegExp(`\\b${esc(ident)}\\b`).test(text);
      const camel = (s) => (/^[A-Z0-9]+$/.test(s) ? String(s).toLowerCase() : String(s).replace(/\s+(.)/g, (_, ch) => ch.toUpperCase()).replace(/^./, (ch) => ch.toLowerCase()));
      let dir;
      let b = c.base;
      let w = c.new;
      let repo;
      let element = c.field;
      let edit = { op: `set-${c.field}`, file, registry: reg, old: c.base, new: c.new };
      if (c.field === "added") {
        dir = file ? "CONVERGED" : "PULL";
        w = `${c.new.group} / ${c.new.name} (${c.new.props?.length ?? 0} props, ${c.new.variants?.length ?? 0} variants, ${c.elements} elements)`;
        edit = { op: "add-component", file: file ?? `src/components/${(c.new.group ?? "ui").toLowerCase()}/${name.replace(/\s+/g, "")}.tsx`, registry: reg, new: c.new };
        element = "new component";
      } else if (c.field === "removed") {
        dir = file ? "PULL" : "CONVERGED";
        b = `${c.base.group} / ${c.base.name}`;
        edit = { op: "remove-component", file: oldFile, registry: reg };
        element = "component removed";
      } else if (c.field === "name") {
        dir = file && !oldFile ? "CONVERGED" : file && oldFile && file !== oldFile ? "CONFLICT" : "PULL";
        edit = { op: "rename-component", file: oldFile, registry: reg, old: c.base, new: c.new };
        notes.push("rename the file, its export, its imports and the classes that carry the name");
      } else if (/^props\[[^\]]+\]$/.test(c.field)) {
        const prop = c.new ?? c.base;
        const id = camel(prop.name);
        element = c.new ? "prop added" : "prop removed";
        const nowHas = has(textNow, id);
        dir = c.new ? (nowHas ? "CONVERGED" : "PULL") : nowHas ? "PULL" : "CONVERGED";
        b = c.base ? `${c.base.name} (${c.base.type})` : null;
        w = c.new ? `${c.new.name} (${c.new.type})` : null;
        edit = { op: c.new ? "add-prop" : "remove-prop", file, registry: reg, prop: prop.name, repoProp: id };
        if (!file) notes.push("no component file found by name");
      } else if (/^props\[[^\]]+\]\.name$/.test(c.field)) {
        element = "prop renamed";
        const nowNew = has(textNow, camel(c.new));
        const nowOld = has(textNow, camel(c.base));
        dir = nowNew && !nowOld ? "CONVERGED" : nowOld ? "PULL" : "CONFLICT";
        edit = { op: "rename-prop", file, registry: reg, old: c.base, new: c.new, repoOld: camel(c.base), repoNew: camel(c.new) };
        notes.push("rename the prop at every call site too");
      } else {
        // Other prop keys, variants, description, variant styles: not compared field by field.
        const touched = file && textNow !== textThen;
        if (c.field === "description") {
          const snippet = String(c.new ?? "").slice(0, 50);
          const reg0 = (readNow("docs/webflow/components.md") ?? "").includes(snippet);
          dir = reg0 && snippet ? "CONVERGED" : touched ? "CONFLICT" : "PULL";
        } else dir = touched ? "CONFLICT" : "PULL";
        if (dir === "CONFLICT") notes.push("the component file changed in the repo since the base; this field was not compared: check by hand");
      }
      if (dir === "CONFLICT") repo ??= "(see notes)";
      this.add({ key, area: "Components", sub: c.field.replace(/\[[^\]]*\]/g, "[]"), where: c.where, element: element === c.field ? c.field : element, base: b, webflow: w, repo, direction: dir, mode: "assisted", edit, notes, change: c });
    }
  }

  // ---- Generic areas (pages, code, interactions, assets, site, cms) ---------------------------------
  /** Presence-based repo side for a scalar Webflow value: is the base / new string in the target files? */
  presence(targets, baseVal, newVal) {
    const { commit } = this.ctx;
    const text = (get) => targets.map((f) => get(f) ?? "").join("\n");
    const now = text(readNow);
    const then = text((f) => showFile(commit, f));
    const has = (t, v) => typeof v === "string" && v.length > 2 && t.includes(v);
    const known = has(then, baseVal) || has(now, baseVal);
    const repoChanged = has(then, baseVal) && !has(now, baseVal);
    const converged = typeof newVal === "string" ? has(now, newVal) && (!has(then, newVal) || repoChanged) : newVal === null && !has(now, baseVal);
    const newAlready = has(now, newVal) && !has(then, newVal);
    return { known, repoChanged: repoChanged || newAlready, converged: converged || newAlready, searchable: typeof baseVal === "string" || typeof newVal === "string" };
  }

  lineOf(files, str) {
    if (typeof str !== "string" || str.length < 3) return null;
    for (const f of files) {
      const lines = readNow(f)?.split("\n") ?? [];
      const i = lines.findIndex((l) => l.includes(str));
      if (i >= 0) return `${f}:${i + 1}`;
    }
    return null;
  }

  pageRows(changes) {
    const { base, nw } = this.ctx;
    const targets = ["docs/webflow/components.md", "docs/webflow/seo.md"];
    const codeFields = new Set(["head", "footer", "scripts"]);
    const groups = new Map();
    for (const c of changes) {
      const top = c.field.split(/[.[]/)[0];
      const k = `${c.where}|${["seo", "openGraph"].includes(top) ? c.field : top}`;
      groups.set(k, [...(groups.get(k) ?? []), c]);
    }
    for (const [gk, cs] of groups) {
      const c0 = cs[0];
      const top = c0.field.split(/[.[]/)[0];
      const slug = c0.where.slice("page:".length);
      const bp = base.pages[slug];
      const np = nw.pages[slug];
      if (codeFields.has(top)) {
        this.codeRow(c0.where, top, bp?.[top], np?.[top], c0.id);
        continue;
      }
      const key = `page|${gk}`;
      if (c0.field === "added" || c0.field === "removed") {
        const title = (c0.new ?? c0.base).title;
        const pageFile = allSourceFiles().find((f) => /^src\/pages\//.test(f) && path.basename(f).toLowerCase() === `${String(title).replace(/[^A-Za-z0-9]/g, "").toLowerCase()}page.tsx`);
        const dir = c0.field === "added" ? (pageFile ? "CONVERGED" : "PULL") : pageFile ? "PULL" : "CONVERGED";
        this.add({ key, area: "Pages", sub: c0.field, where: c0.where, element: `page ${JSON.stringify(title)}`, base: c0.base ? JSON.stringify(c0.base) : null, webflow: c0.new ? JSON.stringify(c0.new) : null, direction: dir, mode: "assisted", edit: { op: `${c0.field}-page`, file: pageFile ?? "src/pages/", registry: this.lineOf(["docs/webflow/components.md"], title) }, notes: [`${c0.elements ?? "?"} elements`], change: c0 });
        continue;
      }
      const valueOf = (p, field) => field.split(/\.|\[|\]/).filter(Boolean).reduce((o, k) => o?.[k], p);
      const b = valueOf(bp, c0.field);
      const n = valueOf(np, c0.field);
      const scalar = typeof b === "string" || typeof n === "string" || b === null || n === null || b === undefined || n === undefined;
      let dir = "PULL";
      let repo;
      const notes = [];
      let line = this.lineOf(targets, typeof b === "string" ? b : n);
      if (top === "jsonLd" || top === "jsonLdRaw") {
        const touched = ["src/content", "docs/webflow/custom-code", "scripts/build-x-schema-site.mjs", "scripts/build-x-schema-faq.mjs"].some((p) => (this.ctx.changedPaths(p).length ?? 0) > 0);
        dir = touched ? "CONFLICT" : "PULL";
        repo = touched ? "(see notes)" : undefined;
        notes.push("schema is generated from src/content and the x-schema build scripts: change the source, then regenerate", ...(touched ? ["a schema source changed in the repo since the base; not compared field by field"] : []));
        line = null;
      } else if (scalar && typeof b === "string") {
        const p = this.presence(targets, b, n);
        dir = direction(true, p.repoChanged, p.converged);
        if (!p.known) notes.push("the base value was not found in components.md / seo.md: locate by hand");
      } else notes.push("repo side not compared (not a text value)");
      if (dir === "CONFLICT") repo ??= "(repo value changed)";
      const show = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v ?? null);
      this.add({ key, area: "Pages", sub: c0.field, where: c0.where, element: c0.field, base: show(b), webflow: show(n), repo, direction: dir, mode: "assisted", edit: { op: "set-page-setting", field: c0.field, file: line?.split(":")[0] ?? "docs/webflow/components.md", line: line ? +line.split(":")[1] : null, old: show(b), new: show(n) }, notes, change: c0 });
    }
  }

  /** Custom code block (page head / footer / scripts, site code): which repo file generates it. */
  codeRow(where, field, b, n, id) {
    const { commit } = this.ctx;
    const text = (v) => (typeof v === "string" ? v : null);
    const hashOf = (v) => (v && typeof v === "object" && v.sha256 ? v.sha256 : text(v) ? sha256(text(v)) : null);
    const list = (get) => {
      const out = [];
      const names = (this.ctx.git(["ls-tree", "-r", "--name-only", commit, "--", "docs/webflow/custom-code"]) ?? "").split("\n").filter(Boolean);
      for (const f of names) out.push([f, get(f)]);
      return out;
    };
    const then = list((f) => showFile(commit, f));
    const baseHash = hashOf(b);
    const newHash = hashOf(n);
    const match = then.find(([, t]) => t != null && (sha256(t) === baseHash || sha256(t.trim()) === baseHash || (text(b) && t.includes(text(b).trim()))));
    const notes = ["custom code is generated from its source: change the source, run the build script, then push"];
    let repo;
    let dir = "PULL";
    let edit = { op: "set-custom-code", field, file: null, builder: null, old: baseHash, new: newHash };
    const builder = (text(b) ?? text(n) ?? "").match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] ?? (match ? (match[1] ?? "").match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] : null);
    const source = (text(b) ?? text(n) ?? "").match(/from (src\/[^\s:]+)/)?.[1] ?? null;
    if (match) {
      const nowText = readNow(match[0]);
      const changed = nowText !== match[1];
      const eq = nowText != null && (sha256(nowText) === newHash || sha256(nowText.trim()) === newHash || (text(n) && nowText.includes(text(n).trim())));
      dir = direction(true, changed, eq);
      edit = { ...edit, file: match[0], builder: builder ?? (match[1].match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] ?? null), source };
      if (dir === "CONFLICT") repo = "(the repo copy of this block changed too)";
    } else {
      this.footer.unlocated.push(`${where} ${field}`);
      edit = { ...edit, builder, source };
      notes.push("no file in docs/webflow/custom-code matches the base code: find its source by hand");
    }
    const show = (v) => (v == null ? null : typeof v === "string" ? (v.length > 80 ? `${v.slice(0, 80)}… (${v.length} chars)` : v) : `${v.length} chars, sha256 ${v.sha256.slice(0, 8)}`);
    this.add({ key: `code|${where}|${field}`, area: "Custom code", sub: field, where, element: field, base: show(b), webflow: show(n), repo, direction: dir, mode: "assisted", edit, notes, change: { area: "code", where, id, field } });
  }

  siteRows(changes) {
    for (const c of changes) {
      if (c.area === "site" && /^(code|siteScripts|registeredScripts)/.test(c.field)) {
        this.codeRow("site", c.field.split(/[.[]/)[0], c.base, c.new, null);
        continue;
      }
      if (c.area === "cms" && c.field === "fields" && c.base === null) {
        this.footer.signals.push("CMS field schemas: the base dump had none (manifest gap), the new dump has them; not a Webflow edit");
        continue;
      }
      const show = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v ?? null);
      const targets = c.area === "cms" ? ["docs/webflow/cms.md"] : ["docs/webflow/components.md", "docs/webflow/seo.md", "docs/webflow/interactions.md"];
      let dir = "PULL";
      const notes = [];
      if (typeof c.base === "string") {
        const p = this.presence(targets, c.base, c.new);
        dir = direction(true, p.repoChanged, p.converged);
        if (!p.known) notes.push(`base value not found in ${targets.join(", ")}`);
      } else notes.push("repo side not compared");
      this.add({ key: `${c.area}|${c.field}`, area: "Site and CMS", sub: c.area, where: c.area, element: c.field, base: show(c.base), webflow: show(c.new), direction: dir, mode: "assisted", edit: { op: `set-${c.area}`, file: targets[0], line: null, field: c.field }, notes, change: c });
    }
  }

  interactions(changes) {
    const { commit } = this.ctx;
    const by = new Map();
    for (const c of changes) by.set(c.where, [...(by.get(c.where) ?? []), c]);
    const reg = (src) => src?.split("\n") ?? [];
    for (const [name, cs] of by) {
      const whole = cs.find((c) => c.field === "added" || c.field === "removed");
      const fields = cs.map((c) => c.field).filter((f) => f !== "added" && f !== "removed");
      if (!whole && fields.every((f) => f === "version")) {
        this.footer.versionOnly.push(name);
        continue;
      }
      const row = (src) => reg(src).find((l) => l.includes(`\`${name}\``) || l.includes(name)) ?? null;
      const then = row(showFile(commit, "docs/webflow/interactions.md"));
      const nowText = readNow("docs/webflow/interactions.md");
      const now = row(nowText);
      const lineNo = nowText ? nowText.split("\n").findIndex((l) => l === now) + 1 : 0;
      let dir;
      if (whole?.field === "added") dir = now ? "CONVERGED" : "PULL";
      else if (whole?.field === "removed") dir = now ? "PULL" : "CONVERGED";
      else dir = then !== now ? "CONFLICT" : "PULL";
      const real = fields.filter((f) => f !== "version");
      this.add({ key: `interaction|${name}`, area: "Interactions", sub: whole?.field ?? real.join(","), where: name, element: whole ? `interaction ${whole.field}` : real.join(", "), base: whole?.base ? "(present)" : whole ? null : `version ${cs.find((c) => c.field === "version")?.base ?? "?"}`, webflow: whole?.new ? "(present)" : whole ? null : `version ${cs.find((c) => c.field === "version")?.new ?? "?"}`, repo: dir === "CONFLICT" ? "(registry row changed)" : undefined, direction: dir, mode: "assisted", edit: { op: whole ? `${whole.field}-interaction` : "set-interaction", file: "docs/webflow/interactions.md", line: lineNo || null, also: "src/ix/", fields: real, interactionId: cs[0].id }, notes: ["registry row and the preview runtime (src/ix) need the same change; the repo side compares the registry row only"], change: cs[0] });
    }
  }

  assets(changes) {
    const { commit } = this.ctx;
    const idsThen = showFile(commit, "docs/webflow/webflow-ids.json") ?? "";
    const idsNow = readNow("docs/webflow/webflow-ids.json") ?? "";
    for (const c of changes) {
      const key = `asset|${c.id}|${c.field}`;
      const notes = [];
      let dir = "PULL";
      let b = c.base;
      let w = c.new;
      if (c.field === "added") {
        dir = idsNow.includes(c.id) && !idsThen.includes(c.id) ? "CONVERGED" : "PULL";
        w = `${c.new.contentType ?? ""} ${c.new.displayName}`.trim();
        notes.push("download the file to public/assets/ on approval and add its id to webflow-ids.json");
      } else if (c.field === "removed") {
        dir = idsNow.includes(c.id) ? "PULL" : "CONVERGED";
        b = c.base.displayName;
      } else if (c.field === "altText") {
        const p = this.presence(["docs/webflow/alt-review.md"].concat(allSourceFiles().filter((f) => f.startsWith("src/"))), c.base, c.new);
        dir = p.known || p.converged ? direction(true, p.repoChanged, p.converged) : "PULL";
        if (!p.known) notes.push("old alt text not found in src/: locate the image by name");
      }
      this.add({ key, area: "Assets", sub: c.field, where: c.where, element: c.field, base: typeof b === "object" ? JSON.stringify(b) : b, webflow: typeof w === "object" ? JSON.stringify(w) : w, direction: dir, mode: "assisted", edit: { op: `asset-${c.field}`, file: "docs/webflow/webflow-ids.json", assetId: c.id, name: c.where }, notes, change: c });
    }
  }

  // ---- Assembly --------------------------------------------------------------------------------
  /** Sorts the rows and numbers them (stable for the same inputs). */
  finish() {
    const rank = (r) => AREA_ORDER.indexOf(r.area);
    const dirRank = { PULL: 0, CONFLICT: 0, CONVERGED: 1, "REPO AHEAD": 2 };
    this.rows.sort((a, b) => dirRank[a.direction] - dirRank[b.direction] || rank(a) - rank(b) || (a.where < b.where ? -1 : a.where > b.where ? 1 : 0) || a.order - b.order);
    this.rows.forEach((r, i) => {
      r.n = i + 1;
      if (r.direction === "CONVERGED" || r.direction === "REPO AHEAD") r.mode = "—";
      delete r.order;
      if (r.change) r.ref = Object.fromEntries(["area", "where", "id", "field", "bp", "pseudo"].filter((k) => r.change[k] !== undefined && r.change[k] !== null).map((k) => [k, r.change[k]]));
      delete r.change;
    });
    return this.rows;
  }
}

export { AREA_ORDER, flatKey, parseTokens };
