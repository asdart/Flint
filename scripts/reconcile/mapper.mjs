// Turns an alignment into map entries: Webflow element id -> repo location (file, line, order path,
// text, which occurrence). See docs/webflow/snapshot/README.md → map/.
import { Aligner, classes, normName, wfKids } from "./align.mjs";
import { allSourceFiles, componentFile, findPattern, findString, pick } from "./locate.mjs";
import { norm } from "./html.mjs";

/** Gives every repo node its order path (child indexes from the root, comps and text runs included). */
export function assignPaths(nodes, prefix = []) {
  nodes.forEach((n, i) => {
    n.path = [...prefix, i];
    if (n.kids) assignPaths(n.kids, n.path);
  });
  return nodes;
}

const propHas = (props, text) =>
  Object.values(props ?? {}).some((v) => (typeof v === "string" ? norm(v) === text || norm(v).includes(text) : Array.isArray(v) && v.some((x) => typeof x === "string" && norm(x) === text)));

const ALIASES = { link: ["link", "href", "to"], image: ["image", "src"], variant: ["variant"], showbutton: ["showbutton"] };

export class Mapper extends Aligner {
  /** Where a rendered string is written: the prop's call site, the element's file, then data files. */
  locateText(text, r) {
    const chain = r.chain ?? [];
    const own = { file: r.src?.file, anchor: r.src?.line };
    const calls = chain.map((c) => ({ file: c.src?.file, anchor: c.src?.line })).filter((c) => c.file);
    const j = chain.findIndex((c) => propHas(c.props, text));
    const order = j >= 0 ? [...calls.slice(j), own] : [own, ...calls];
    const seen = new Set();
    for (const { file, anchor } of order) {
      if (!file || seen.has(file)) continue;
      seen.add(file);
      const found = findString(file, text);
      if (found.lines.length) return pick(file, found, anchor);
    }
    // Last resort: any single source file that has the string (CMS seed JSON, a data module).
    const hits = [];
    for (const f of allSourceFiles()) {
      if (seen.has(f)) continue;
      const found = findString(f, text);
      if (found.lines.length && !found.partial) hits.push([f, found]);
    }
    if (hits.length === 1) return { ...pick(hits[0][0], hits[0][1], null), locate: "data" };
    if (hits.length > 1) return { file: hits[0][0], line: hits[0][1].lines[0], locate: "data", of: hits.length, alts: hits.slice(1, 6).map(([f, h]) => `${f}:${h.lines[0]}`) };
    return { locate: "manual", file: own.file ?? null, line: own.anchor ?? null };
  }

  /** `rc` (the repo's classes) is written only when they differ from the Webflow element's, as a sorted list. */
  elEntry(r, w) {
    const e = { k: "el", file: r.src?.file ?? null, line: r.src?.line ?? null, col: r.src?.col ?? null, path: r.path };
    const rc = [...new Set(classes(r.cls))].sort();
    const wc = [...new Set(classes(w.c))].sort();
    if (rc.join(" ") !== wc.join(" ")) e.rc = rc;
    return e;
  }

  textEntries(r, w) {
    const loc = this.locateText(r.text, r);
    w.ids.forEach((id, i) => {
      const e = { k: "text", ...loc, path: r.path, text: w.xs[i] };
      if (w.ids.length > 1) e.part = [i + 1, w.ids.length];
      if (r.text !== w.text) e.repoText = r.text;
      this.map[id] = e;
      if (r.text === w.text) this.exact++;
    });
  }

  /** Instance props -> the prop at the call site (file, line) or its default in the component file. */
  instEntry(r, w) {
    const e = { k: "inst", comp: w.i.name, file: r.src?.file ?? null, line: r.src?.line ?? null, col: r.src?.col ?? null, path: r.path, props: {} };
    const compFile = componentFile(r.name);
    if (compFile) e.compFile = compFile;
    const repoKeys = Object.keys(r.props);
    for (const [name, value] of Object.entries(w.i.props ?? {})) {
      const key = normName(name);
      const want = ALIASES[key] ?? [key];
      const repoProp = repoKeys.find((k) => want.includes(normName(k))) ?? null;
      const p = { prop: repoProp };
      if (typeof value === "string" || typeof value === "boolean" || typeof value === "number") p.value = value;
      else if (value && typeof value === "object") p.value = value.sourceType ? { sourceType: value.sourceType } : value;
      // The repo's own value when it is a plain value that differs from Webflow's (a page link is a URL here, {pageId} there).
      const rv = repoProp ? r.props[repoProp] : undefined;
      if (["string", "number", "boolean"].includes(typeof rv) && rv !== p.value) p.repoValue = rv;
      let loc = null;
      if (r.src && repoProp) {
        const line = findPattern(r.src.file, new RegExp(`\\b${repoProp}\\s*=`), r.src.line, 40);
        if (line) loc = { file: r.src.file, line, locate: "attr" };
      }
      if (!loc && typeof value === "string" && value.length > 1) {
        const chain = [{ props: r.props, src: r.src }, ...(r.chain ?? [])];
        const t = this.locateText(norm(value), { src: r.src, chain });
        if (t.locate !== "manual") loc = { file: t.file, line: t.line, locate: t.locate };
      }
      if (!loc && compFile) {
        const names = [name.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase()), repoProp].filter(Boolean);
        for (const n of names) {
          const line = findPattern(compFile, new RegExp(`\\b${n}\\s*=\\s*[^>=]`), 1, 400);
          if (line) {
            loc = { file: compFile, line, locate: "default" };
            break;
          }
        }
      }
      Object.assign(p, loc ?? { locate: "manual" });
      e.props[name] = p;
    }
    return e;
  }

  alignNode(r, w) {
    if (w.t === "ComponentInstance") {
      this.map[w.id] = this.instEntry(r, w);
      return;
    }
    const entry = this.elEntry(r, w);
    this.map[w.id] = entry;
    const Rk = this.rkids(r);
    const Wk = wfKids(w);
    const pairs = this.alignLists(Rk, Wk);
    this.apply(pairs);
    const matched = new Set(pairs.map(([x]) => x));
    const loose = Rk.filter((x) => x.k === "text" && !matched.has(x));
    if (loose.length && !Wk.some((x) => x.isText)) {
      // The Webflow element shows no text: it is bound to a component prop (or a CMS field).
      const bound = this.locateText(loose[0].text, loose[0]);
      entry.textBound = { text: loose[0].text, ...bound };
    } else for (const x of Rk) if (!matched.has(x) && x.k !== "text") this.repoOnly.push({ file: x.src?.file, line: x.src?.line, tag: x.tag ?? x.name });
  }

  apply(pairs) {
    for (const [r, w] of pairs) {
      if (w.isText) this.textEntries(r, w);
      else this.alignNode(r, w);
    }
  }

  /** Aligns a page (repo root nodes against the Body) or a component definition (the wrapper's render against its root). */
  run(wfRoot, repoNodes, { body }) {
    if (body) {
      this.map[wfRoot.id] = { k: "body" };
      this.apply(this.alignLists(this.rkids({ kids: repoNodes }), wfKids(wfRoot)));
    } else {
      const Rk = this.rkids({ kids: repoNodes });
      this.apply(this.alignLists(Rk, [wfRoot]));
    }
    return this.map;
  }
}
