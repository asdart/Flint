// Aligns a Webflow element tree (snapshot) with the repo's traced render, by order, tag, classes and
// text, and writes one map entry per Webflow element id. Only meant to run when the repo equals
// Webflow (right after a sync): it builds the id → repo location map once; the id diff does the rest.
import { norm } from "./html.mjs";

export const normName = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// Default HTML tag per Webflow element type (settings.tag overrides).
const TYPE_TAG = {
  Body: "body", Block: "div", Section: "section", Paragraph: "p", Span: "span", Link: "a", Image: "img", List: "ul", ListItem: "li",
  Blockquote: "blockquote", Strong: "strong", RichText: "div", HtmlEmbed: "div", "": "br", FormWrapper: "div", FormForm: "form",
  FormSuccessMessage: "div", FormErrorMessage: "div", FormBlockLabel: "label", FormTextInput: "input", FormSelect: "select",
  FormButton: "input", DynamoWrapper: "div", DynamoList: "div", DynamoItem: "div", DynamoEmpty: "div", Slot: "div",
  BackgroundVideoWrapper: "div", DropdownWrapper: "div", DropdownToggle: "div", DropdownList: "nav",
};
// Types whose repo tag may differ (Webflow builds them from its own element, with its own tag).
const LOOSE = new Set([
  "HtmlEmbed", "FormSelect", "FormButton", "BackgroundVideoWrapper", "DropdownWrapper", "DropdownToggle", "DropdownList",
  "Pagination", "PaginationPrevious", "PaginationNext", "PaginationCount", "PaginationPreviousIcon", "PaginationNextIcon", "RichText", "Slot", "FormWrapper", "FormSuccessMessage", "FormErrorMessage",
]);

export const wfTag = (w) => w.s?.tag ?? TYPE_TAG[w.t] ?? "div";
export const classes = (list) => (list ?? []).filter((c) => !c.startsWith("w-"));

/** Webflow children as alignment nodes: adjacent String nodes become one text group, blank ones are dropped. */
export function wfKids(w) {
  const out = [];
  let blank = [];
  for (const k of w.kids) {
    if (k.t === "String") {
      const last = out.at(-1);
      if (last && last.isText) {
        last.raw += k.x;
        last.ids.push(k.id);
        last.xs.push(k.x);
      } else out.push({ isText: true, raw: k.x, ids: [k.id], xs: [k.x], parent: w });
      continue;
    }
    out.push(k);
  }
  const res = [];
  for (const n of out) {
    if (n.isText) {
      n.text = norm(n.raw);
      if (!n.text) {
        blank.push(...n.ids);
        continue;
      }
    }
    res.push(n);
  }
  res.blankIds = blank;
  return res;
}

export class Aligner {
  /** @param {Set<string>} wfComponentNames normalised Webflow component names (nodes kept as instance candidates) */
  constructor(wfComponentNames) {
    this.names = wfComponentNames;
    this.map = {}; // wf element id -> entry
    this.repoOnly = []; // repo nodes without a Webflow counterpart
    this.exact = 0;
  }

  // ---- repo side ------------------------------------------------------------------------
  /** Children with the components that are not Webflow components replaced by their own children. */
  rkids(n) {
    const out = [];
    for (const k of n.kids ?? []) {
      if (k.k === "comp" && !this.names.has(normName(k.name))) out.push(...this.rkids(k));
      else out.push(k);
    }
    return out;
  }

  // ---- scoring --------------------------------------------------------------------------
  sim(r, w) {
    if (w.isText) return r.k === "text" ? (r.text === w.text ? 3 : 0.5) : -1;
    if (r.k === "text") return -1;
    if (w.t === "ComponentInstance") return r.k === "comp" && normName(r.name) === normName(w.i.name) ? 10 : -1;
    if (r.k === "comp") return -1;
    const loose = LOOSE.has(w.t);
    if (r.tag !== wfTag(w) && !loose) return -1;
    const rc = new Set(classes(r.cls));
    const wc = new Set(classes(w.c));
    const inter = [...rc].filter((c) => wc.has(c)).length;
    if (inter === rc.size && inter === wc.size) return 4 + (rc.size === 0 ? -2.5 : 0);
    if (inter > 0) return 1 + (2 * inter) / (rc.size + wc.size - inter);
    if (rc.size === 0 && wc.size === 0) return 1.5;
    return loose ? 0.3 : -1;
  }

  /** Order-preserving best alignment; returns [[ri, wi], …] and the total score. */
  dp(R, W) {
    const n = R.length;
    const m = W.length;
    const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
    const sc = Array.from({ length: n }, (_, i) => W.map((w) => this.sim(R[i], w)));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--) {
        let best = Math.max(S[i + 1][j], S[i][j + 1]);
        if (sc[i][j] > 0) best = Math.max(best, sc[i][j] + S[i + 1][j + 1]);
        S[i][j] = best;
      }
    const pairs = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (sc[i][j] > 0 && S[i][j] === sc[i][j] + S[i + 1][j + 1]) {
        pairs.push([i, j]);
        i++;
        j++;
      } else if (S[i][j] === S[i + 1][j]) i++;
      else j++;
    }
    return { pairs, score: S[0][0] };
  }

  /** Aligns two child lists; unmatched wrappers on either side are opened up (flattened) to match their children. */
  alignLists(R, W, depth = 0) {
    const { pairs } = this.dp(R, W);
    const out = [];
    let pr = 0;
    let pw = 0;
    const gap = (r1, w1) => {
      const Rg = R.slice(pr, r1);
      const Wg = W.slice(pw, w1);
      if (Rg.length && Wg.length && depth < 6) out.push(...this.refine(Rg, Wg, depth));
    };
    for (const [i, j] of pairs) {
      gap(i, j);
      out.push([R[i], W[j]]);
      pr = i + 1;
      pw = j + 1;
    }
    gap(R.length, W.length);
    return out;
  }

  refine(Rg, Wg, depth) {
    const canOpenR = (n) => (n.k === "el" || n.k === "comp") && n.kids.length > 0;
    const canOpenW = (n) => !n.isText && n.t !== "ComponentInstance" && n.kids.length > 0;
    const openR = () => Rg.flatMap((n) => (canOpenR(n) ? this.rkids(n) : [n]));
    const openW = () => Wg.flatMap((n) => (canOpenW(n) ? wfKids(n) : [n]));
    const variants = [];
    const expR = Rg.some(canOpenR);
    const expW = Wg.some(canOpenW);
    if (expW) variants.push([Rg, openW()]);
    if (expR) variants.push([openR(), Wg]);
    if (expR && expW) variants.push([openR(), openW()]);
    let best = null;
    for (const [R2, W2] of variants) {
      const { score } = this.dp(R2, W2);
      if (score > 0 && (!best || score > best.score)) best = { score, R2, W2 };
    }
    return best ? this.alignLists(best.R2, best.W2, depth + 1) : [];
  }
}
