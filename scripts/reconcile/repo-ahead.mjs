// Parsers for the repo-only changes the reconcile lists as REPO AHEAD: what a component file declares (props and
// variant values), the section sequence of a page file, the rows of the interactions registry.
// See docs/webflow/snapshot/README.md → "Reconcile report".
import { lis } from "./diff.mjs";

/** Props a component file declares in its `...Props` type or interface: Map(name -> { type, values: Set | null }). */
export function componentSurface(text) {
  const props = new Map();
  if (!text) return props;
  const head = /(?:type|interface)\s+\w*Props\s*(?:=\s*)?\{/g;
  let m;
  while ((m = head.exec(text))) {
    let depth = 1;
    let i = m.index + m[0].length;
    let line = "";
    const lines = [];
    for (; i < text.length && depth > 0; i++) {
      const ch = text[i];
      if (ch === "{" || ch === "(" || ch === "[") depth++;
      else if (ch === "}" || ch === ")" || ch === "]") depth--;
      if (ch === "\n" && depth === 1) {
        lines.push(line);
        line = "";
      } else if (depth === 1 || (depth === 2 && ch !== "\n")) line += ch;
    }
    lines.push(line);
    for (const l of lines) {
      const p = /^\s*(?:readonly\s+)?([A-Za-z_]\w*)(\?)?\s*:\s*(.+?);?\s*$/.exec(l);
      if (!p) continue;
      const type = p[3].replace(/;$/, "").trim();
      const lit = [...type.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
      const onlyLiterals = lit.length > 1 && type.replace(/"[^"]*"/g, "").replace(/[|\s]/g, "") === "";
      props.set(p[1], { type, values: onlyLiterals ? new Set(lit) : null });
    }
  }
  return props;
}

/** The imported sections and components a page file places, in JSX order (one entry per use). */
export function pageSequence(text) {
  if (!text) return [];
  const imported = new Set();
  for (const m of text.matchAll(/import\s+([^;]+?)\s+from\s+"(\.\.\/(?:sections|components)\/[^"]+)"/g)) {
    const spec = m[1];
    const def = /^(\w+)/.exec(spec)?.[1];
    if (def) imported.add(def);
    for (const n of /\{([^}]*)\}/.exec(spec)?.[1].split(",") ?? []) {
      const name = n.trim().split(/\s+as\s+/).pop();
      if (name) imported.add(name);
    }
  }
  return [...text.matchAll(/<([A-Z]\w*)\b/g)].map((m) => m[1]).filter((n) => imported.has(n));
}

/** Added, removed and moved entries between two sequences (a name used twice is told apart by its occurrence). */
export function sequenceDiff(a, b) {
  const keyed = (list) => {
    const n = new Map();
    return list.map((x) => {
      n.set(x, (n.get(x) ?? 0) + 1);
      return `${x}#${n.get(x)}`;
    });
  };
  const ka = keyed(a);
  const kb = keyed(b);
  const inA = new Set(ka);
  const inB = new Set(kb);
  const removed = ka.filter((k) => !inB.has(k));
  const added = kb.filter((k) => !inA.has(k));
  const ca = ka.filter((k) => inB.has(k));
  const cb = kb.filter((k) => inA.has(k));
  const keep = lis(cb.map((k) => ca.indexOf(k)));
  const moved = cb.filter((_, i) => !keep.has(i));
  const name = (k) => k.replace(/#\d+$/, "");
  return { added: added.map(name), removed: removed.map(name), moved: moved.map(name) };
}

/** Rows of the interactions registry by interaction name (`ix-…`): the table line, trimmed. */
export function registryRows(text) {
  const out = new Map();
  (text ?? "").split("\n").forEach((l, i) => {
    const m = /^\|\s*`(ix-[a-z0-9-]+)`/.exec(l);
    if (m && !out.has(m[1])) out.set(m[1], { text: l.trim(), line: i + 1 });
  });
  return out;
}
