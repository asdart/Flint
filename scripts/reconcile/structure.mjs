// Structure of the repo render as the map sees it: the repo parent of every mapped Webflow id and the order of
// the children, from the order paths of the map entries (a repo node's path is its parent's path plus its index).
// Used by the three-way compare of moves. See docs/webflow/snapshot/README.md → "Reconcile report".

const cmpPath = (a, b) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
};
const isPrefix = (a, b) => a.length < b.length && a.every((v, i) => b[i] === v);

/** { parent: Map(id -> repo parent id | null), kids: Map(parent id | null -> ids in repo order) } */
export function repoLayout(elements) {
  const list = Object.entries(elements ?? {})
    .filter(([, e]) => Array.isArray(e.path))
    .map(([id, e]) => ({ id, path: e.path }))
    .sort((a, b) => cmpPath(a.path, b.path));
  const parent = new Map();
  const kids = new Map();
  const stack = [];
  for (const n of list) {
    while (stack.length && !isPrefix(stack.at(-1).path, n.path)) stack.pop();
    const p = stack.at(-1)?.id ?? null;
    parent.set(n.id, p);
    kids.set(p, [...(kids.get(p) ?? []), n.id]);
    stack.push(n);
  }
  return { parent, kids };
}

const memo = new WeakMap();
/** repoLayout, computed once per elements object. */
export function layoutOf(elements) {
  if (!elements) return null;
  if (!memo.has(elements)) memo.set(elements, repoLayout(elements));
  return memo.get(elements);
}
