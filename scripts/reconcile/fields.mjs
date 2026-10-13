// Element attributes and settings (link href, image asset and alt, loading, ids, form field name / type /
// required) as one comparable string per field, on the Webflow side and from the repo render, so the map can
// record where the repo differs (`ra`) and the reconcile can compare repo-vs-base-vs-new by value.
// See docs/webflow/snapshot/README.md → map/ (`ra`).
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.mjs";

/** Pages by id -> published path and assets by id -> name / alt, for one snapshot. */
export function fieldCtx(snap) {
  const pagePath = {};
  for (const p of Object.values(snap.pages)) pagePath[p.pageId] = p.publishedPath ?? `/${p.slug}`;
  const assets = {};
  for (const a of snap.assets ?? []) assets[a.id] = { name: a.displayName, alt: a.altText };
  // Repo asset path (as an <img src>) -> Webflow asset id, from the registry of what was uploaded.
  let uploaded = {};
  try {
    uploaded = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/webflow/webflow-ids.json"), "utf8")).assets ?? {};
  } catch {
    // no registry: asset sources are compared by file name only
  }
  return { pagePath, assets, uploaded, paths: new Set(Object.values(pagePath)) };
}

/** Ids of the elements below a Collection List: their links, images and alt texts come from the CMS item. */
export function cmsIds(root) {
  const ids = new Set();
  (function walk(n, inside) {
    const here = inside || n.t === "DynamoWrapper";
    if (here) ids.add(n.id);
    for (const k of n.kids ?? []) walk(k, here);
  })(root, false);
  return ids;
}

const INPUT_TAGS = new Set(["input", "select", "textarea"]);
const PLAIN_ATTRS = new Set(["id", "role", "tabindex", "for", "autocomplete", "draggable", "type"]);

/** Does the repo's attribute `k` have a Webflow `a` counterpart (so a difference is meaningful)? */
function attrKey(k, tag, boundId) {
  if (k === "class" || k === "style" || k === "data-src" || k === "data-name") return false;
  if (boundId && (k === "id" || k === "for")) return false; // bound to the component's ID prop, not a static attribute
  if (k === "type" && INPUT_TAGS.has(tag)) return false; // form fields: settings.input
  if (k === "href") return tag === "a";
  if (k === "data-discover" || k === "data-wait") return false; // React Router / Webflow's own attributes
  return k.startsWith("data-") || k.startsWith("aria-") || PLAIN_ATTRS.has(k);
}

const base = (src) => (src ? path.basename(String(src).split("?")[0]).toLowerCase() : undefined);

/** The Webflow asset id of a repo image source, when the registry knows the file. */
const assetOf = (src, fc) => fc.uploaded[src]?.id ?? fc.uploaded[String(src).replace(/^\//, "")]?.id;

/** data-* attributes written as a bare attribute on Webflow ("") and as a boolean in JSX ("true") mean the same to `[data-x]`. */
const sameAttr = (k, wv, rv) => wv === rv || (k.startsWith("data-") && ((wv === "" && rv === "true") || (wv === "true" && rv === "")));

/** Repo href in Webflow terms: a route that is a page's path is a page link. */
function repoHref(href, fc) {
  if (href === undefined) return undefined;
  return fc.paths.has(href) ? `page:${href}` : href;
}

/** A Webflow raw value of `field` as the comparable string the repo side is reduced to (`undefined`: none). */
export function wfCmp(field, raw, fc, type) {
  if (raw === null || raw === undefined) return field === "settings.altText" ? "" : undefined;
  if (field.startsWith("attr.")) return String(raw);
  if (field === "settings.link") return raw.linkType === "page" ? `page:${fc.pagePath[raw.pageId] ?? raw.pageId}` : (raw.href ?? JSON.stringify(raw));
  if (field === "settings.altText") return String(raw);
  if (field === "settings.assetId") return String(raw);
  if (field === "settings.input") return type === "FormSelect" ? `name=${raw.inputName ?? ""}` : `name=${raw.inputName ?? ""};type=${raw.inputType ?? "text"};required=${!!raw.isRequired}`;
  return JSON.stringify(raw);
}

/** Display form of a raw Webflow value (an asset id as its file name, a link as its target). */
export function wfShow(field, raw, fc) {
  if (raw === null || raw === undefined) return null;
  if (field === "settings.assetId") return fc.assets[raw]?.name ?? raw;
  if (field === "settings.link") return wfCmp(field, raw, fc);
  return raw;
}

/**
 * The fields where the repo node `r` differs from the Webflow element `w`: { field: repo comparable value | null }.
 * `boundId`: the element is in a component with an ID prop (type id), so `id` / `for` are bound, not static.
 */
export function repoDiffs(r, w, fc, { boundId = false, cms = false, boundImage = false, boundLink = false } = {}) {
  const out = {};
  // React writes some attribute names in camel case (autoComplete): attribute names are case-insensitive.
  const A = Object.fromEntries(Object.entries(r.attrs ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  const wa = w.a ?? {};
  const ws = w.s ?? {};
  const put = (field, wv, rv) => {
    if (wv !== rv && !sameAttr(field.slice(5), wv, rv)) out[field] = rv ?? null;
  };
  // Webflow's own Pagination elements carry their roles and labels natively; a Collection List its list roles.
  if (/^Pagination/.test(w.t)) return out;
  const keys = new Set([...Object.keys(wa), ...Object.keys(A)].filter((k) => attrKey(k, r.tag, boundId) && !((cms || boundLink) && k === "href") && !(k === "role" && /^Dynamo/.test(w.t))));
  for (const k of [...keys].sort()) {
    if (k === "href" && ws.link) continue;
    if (k === "href" && w.t !== "Link") continue;
    put(`attr.${k}`, wa[k] === undefined ? undefined : String(wa[k]), A[k]);
  }
  if (ws.link && !cms && !boundLink) put("settings.link", wfCmp("settings.link", ws.link, fc), repoHref(A.href, fc));
  if (w.t === "Image" && !cms && !boundImage) {
    put("settings.altText", ws.altText ?? "", A.alt ?? "");
    if (ws.assetId && A.src) {
      // The registry says which asset a repo file became; else the file name must equal the asset's display name.
      const name = (fc.assets[ws.assetId]?.name ?? "").toLowerCase();
      put("settings.assetId", String(ws.assetId), assetOf(A.src, fc) ?? (base(A.src) === name ? String(ws.assetId) : `file:${base(A.src)}`));
    }
    if (A.loading !== undefined) put("attr.loading", wa.loading ?? "lazy", A.loading);
  }
  if (w.t === "FormTextInput" && ws.input) put("settings.input", wfCmp("settings.input", ws.input, fc, w.t), `name=${A.name ?? ""};type=${A.type ?? "text"};required=${"required" in A}`);
  if (w.t === "FormSelect" && ws.input) put("settings.input", wfCmp("settings.input", ws.input, fc, w.t), `name=${A.name ?? ""}`);
  return out;
}
