// JSX runtime used ONLY by scripts/webflow-map.mjs (never by the Vite build). It wraps React's dev
// runtime so every element that is rendered to static markup says where in src/ it was written:
//  - a host element gets data-src="src/path.tsx:line:col" (the JSX opening tag);
//  - a function component is wrapped in <x-comp data-comp="Name" data-src="call site" data-props="json">
//    so the map knows where <Button …> was placed and which primitive props it got.
// Needs the `source` argument that Vite's dev JSX transform passes to jsxDEV.
import * as dev from "react/jsx-dev-runtime";

export const Fragment = dev.Fragment;

const rel = (file) => file.slice(file.lastIndexOf("/src/") + 1);

function simpleProps(props) {
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    const prim = (x) => typeof x === "string" || typeof x === "number" || typeof x === "boolean";
    if (prim(v) || (Array.isArray(v) && v.every(prim))) out[k] = v;
  }
  return out;
}

export function jsxDEV(type, props, key, isStatic, source, self) {
  if (!source || !source.fileName.includes("/src/")) return dev.jsxDEV(type, props, key, isStatic, source, self);
  const where = `${rel(source.fileName)}:${source.lineNumber}:${source.columnNumber}`;
  if (typeof type === "string") return dev.jsxDEV(type, { ...props, "data-src": where }, key, isStatic, source, self);
  if (typeof type === "function" && (type.displayName || type.name)) {
    const inner = dev.jsxDEV(type, props, null, isStatic, source, self);
    return dev.jsxDEV(
      "x-comp",
      { "data-comp": type.displayName || type.name, "data-src": where, "data-props": JSON.stringify(simpleProps(props)), children: inner },
      key,
      false,
      source,
      self,
    );
  }
  return dev.jsxDEV(type, props, key, isStatic, source, self);
}
