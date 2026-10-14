# Webflow snapshot: format

**Status:** the gate's partial dump was added in phase 5 (2026-10-13). Format from reconcile phase 1 (2026-10-10), map and diff added in phase 3 stage 1 (2026-10-13), reconcile report added in stage 2 (2026-10-13), updated with the user's decisions of
2026-10-11 and with what `scripts/webflow-snapshot.mjs` actually writes (reconcile phase 2 step b,
2026-10-11, baseline dump `20261011T194658Z`, repo commit `68829d4`). See
[`../plans/reconcile.md`](../plans/reconcile.md) for the plan and the measurements behind every
choice here.

The snapshot is a normalised copy of what the Webflow MCP returns for the production site, taken
right after a sync. It is the "base" of the three-way compare in the plan. It is never edited by
hand and never pushed to Webflow.

**Only this file and `accepted.json` are committed.** The data lives in `docs/webflow/snapshot/data/`,
which is gitignored, so the base exists on one machine only. `accepted.json` is a small curated list
of known repo-vs-Webflow differences (see "Accepted differences"); it is not Webflow state, so it
survives a rebuild and is shared. The changes reports (`docs/webflow/reconcile/<date>.md`) **are
committed** (user decision 2026-10-11): they are the lasting record of what changed between syncs. `data/manifest.json` records the repo commit
the snapshot matched; that commit, not git history of the snapshot, is the "base vs repo" side of
the compare. If `data/` is missing (new clone, cloud session, lost disk), see "Rebuilding the base".

## What it is built from

- Every read goes through the Webflow MCP data tools. They are headless: the Designer bridge is not
  needed (it was not connected during the measurements).
- The reads show the working copy of the site, not the published one (see "Unpublished edits" in
  the plan; verified by inference, to be confirmed by a real unpublished edit in phase 2).
- A raw dump is a set of saved MCP results. Raw dumps are cached in a gitignored folder.
  `scripts/webflow-snapshot.mjs` (built in phase 2) turns a raw dump into the files below. It is
  offline (no MCP), deterministic (no clock, no repo files read: two runs on one dump are
  byte-identical) and refuses an incomplete or inconsistent dump. See "Script".

## Layout

All paths below are inside `docs/webflow/snapshot/data/` (gitignored), except this README.

```text
docs/webflow/snapshot/
  README.md              this file (committed)
  accepted.json          known repo-vs-Webflow differences (committed, curated by hand)
  data/                  gitignored
  manifest.json          taken-at, repo commit matched, dump folder, site id, schema version, change signals,
                         counts, gaps, per-file sha256 and the sha256 of every raw dump file
  site.json              site settings, fonts, registered scripts, site-applied scripts, site head/footer code,
                         variable collections (site instruction meta: not in the dump yet, see "Gaps")
  variables.json         collection Flint: name -> id, type, value
  styles.jsonl           one line per style, sorted by selector
  tags are in styles.jsonl (type "tag": body, h1-h4, p, a, blockquote, img)
  components/<slug>.json one per component: meta, props, variants, definition tree
  pages/<slug>.json      one per page and template: settings, JSON-LD, scripts, head/footer
                         code, element tree (page instances carry their prop overrides)
  interactions/<name>.json  one per interaction, full triggers and timelines
  assets.json            id, displayName, contentType, altText, folderId, sorted by id
  cms.json               collections (id, name, slug) and fields (the field schemas from cms-collection-details.json or cms-details.json; null when the dump has neither); no items
  map/pages/<slug>.json  element id -> repo location, one per page (written by webflow-map.mjs, see "Map")
  map/components/<slug>.json  the same for each component definition
```

`<slug>` is the Webflow page slug (`home` for the page without one, `about`, `blog`, `404`) or, for a
CMS template page, `template-<singular title word>` (`template-posts`, `template-authors`,
`template-categories`, the names the dump's `tree-<slug>.json` files carry); components use the name
in kebab-case (`page-hero`, `logo-marquee`). Page ids and component ids are inside the file.

## File formats

### Element trees (pages and components)

One element per line, flat, in document order, inside an `elements` array so the file stays valid
JSON and a plain `diff` shows one changed element per changed line. The file is `{`, one header
entry per line (`"key":value`), then `"elements":[` with one element per line, then `]` and `}`:

```json
{"id":"e09eaa98-a732-87f2-a0c3-bef0cdf54a5a","p":null,"t":"Block","c":["fk-page"],"s":{"tag":"div"}}
{"id":"1d040ccb-fe66-3add-5abc-659a94674f89","p":"e09eaa98-…-54a59","t":"Section","c":["fk-section","is-padded-bottom"],"s":{"tag":"section"}}
{"id":"…","p":"…","t":"String","x":"Thanks for applying!"}
{"id":"…","p":"…","t":"ComponentInstance","i":{"comp":"76881060-…","props":{"Title":"Thanks for applying!"},"slots":["Options"]}}
```

Keys: `id` (the Webflow element id, `id.element`), `p` parent id, `t` type, `c` class list in order
(`styleNames`), `s` settings that differ from the default, `a` attributes (`data-*`, `aria-*`,
`href`, `id`, `loading`), `x` text of a `String` node, `i` component instance (`comp` component id,
`name` its name for readability, `props` only the ones with `hasOverride: true` keyed by prop name,
`slots` names, both omitted when empty). `c`, `s`, `a` and `i.props` are omitted when empty. The
root is the `Body` element of a page (`p: null`) or the component's root element.

Rules:

- Key order is fixed: `id, p, t, c, s, a, x, i`. Inside `s`, `a` and `i.props`, keys are sorted.
- `id.component` is dropped (it is the page id or component id, already in the file header).
- Dropped as noise: `settings.visibility` when `true`, `settings.block` and `settings.dom` (they
  repeat `settings.tag`), `instanceDetails.props[].propId` (the component file has the ids),
  `hasOverride: false` props (defaults, owned by the component file).
- Kept even when empty-looking: `String` nodes of whitespace-only text (they are real nodes).
- Per-page header (first lines of the file, in this order): `pageId`, `file`, `title`, `slug` (the
  published slug, `""` for Home; a template's is `detail_<collection>`), `publishedPath`, `draft`,
  `archived`, `seo`, `openGraph`, `collectionId` (templates only), `includeInSitemap` (`null` for
  templates and utility pages: the sitemap tool does not list them), `jsonLd` (object form, `null`
  when none), `jsonLdRaw` (the string with CMS tokens, only when present), `scripts` (id, location,
  version, attributes when set; `[]` when the page has none, which the MCP reports as a 404),
  `head` / `footer` custom code (see "Custom code") and `headUnreadable: true` on a template
  whose JSON-LD holds CMS tokens.
- Component header: `id`, `name`, `group`, `description`, `props` (`id`, `name`, `type`, `default`),
  `variants` (`id`, `name`, `order` = list position; `isSelected` is dropped as Designer UI state).

### Styles

`styles.jsonl`, one line per style, sorted by `selector` (the full dotted chain, `.fk-button.is-secondary`; tag
styles use the bare tag):

```json
{"sel":".fk-button","type":"global","base":{"hover":{"color":"var(color-ink)"},"noPseudo":{"display":"inline-flex","padding-top":"var(space-2-5)"}},"bp":{"medium":{"noPseudo":{"padding-top":"var(space-2)"}}}}
```

- `base` holds the desktop (Webflow `main`) styles by pseudo-state, `bp` the `medium`, `small`,
  `tiny` overrides by pseudo-state. The `main` breakpoint is a copy of `base.noPseudo` in the MCP
  result and is dropped.
- Line key order: `sel`, `type` (`global`, `combo` or `tag`), `base`, `bp` (omitted when empty).
  Property keys and pseudo-state keys are sorted. A variable value is written `var(<variable name>)`
  (the MCP returns an id; the name comes from the same dump's `variables.json`, so an unknown id
  fails the check). A literal stays a string, exactly as returned.
- Styles with no properties anywhere (794 of 1,494 in the first measurement: empty combo chains
  that Webflow creates by itself, see the skill) are not stored. The count goes in the manifest.
- The style GUID is not stored: a style that is removed and created again gets a new GUID, and the
  selector is the identity the repo uses.
- Pseudo-states read: the list in `recipes.md` → Diff. The MCP returned pseudo-states only at the
  base level in the production data (no `medium` + pseudo exists today); the snapshot keeps any
  that appear.

### Variables

`variables.json`: `{"color-ink":{"id":"variable-…","type":"Color","value":"#0f0e17"}, …}`, one
variable per line, sorted by name. A `Size` value is `{"value":16,"unit":"px"}`. `modeValues` and
`cssName` are dropped (a second mode makes the script warn). The collections are in `site.json`.

### Components

`components/<slug>.json`: the header above, then `elements` (definition tree, same format as above),
and, once a dump includes them, `variantStyles` (the overrides read with `get_variant_styles`, only
for the (variant, style, breakpoint, pseudo) triples listed in `components.md`; partial, see the
plan). **The baseline dump has none**: no component file has a `variantStyles` key yet (listed in the
manifest `gaps`; the next dump must read the listed triples). A sync that writes a triple not listed
there fails a check (phase 3). Accepted gap: an override added only in the Designer goes unnoticed.
Instance count is not stored (it moves whenever a page changes).

### Interactions

`interactions/<name>.json` (2-space JSON, keys sorted): the `get_interaction` result with `version`
kept (it counts edits and is the change signal), `pageId` dropped on the interaction and on every
timeline (it is the page the interaction was created on, which changes meaning if that page is
deleted), and every style id (the `wf:class` targets and the `addClass` selectors) replaced by
`{"class":"<selector>","id":"<raw id>"}` (all 31 ids of the baseline resolve; an unresolved id stays
a string). `ix-ticker` is 47 KB pretty-printed; it is stored in full.

### Custom code

Site and page head/footer code, registered scripts and their applied versions:

- Text up to 8 KB (8,192 bytes) is stored inline.
- Larger blocks (the footers of Home, Facility partners and Candidates carry bundled `x-*` scripts,
  28 to 38 KB) are stored as `{"length":N,"sha256":"…"}`, the hash of the exact text the MCP
  returned. There is no stored `source` path: it would make the output depend on repo files. The
  compare step finds the repo target (`docs/webflow/custom-code/*`, generated by `scripts/build-x-*.mjs`)
  by hash or containment. The hash is the change detector.
- Registered scripts (in `site.json`): `id`, `displayName`, `version`. The script's own `sha256` and
  `hostedLocation` are not stored: the first would need a download (the script is offline), the second
  has a random folder id per upload. Several versions of one script id are listed (`xmodal` has
  1.0.0, 1.1.0, 1.2.0); the applied version is in the page's `scripts`. Site-applied scripts are
  `siteScripts` (`[]` when the MCP answers 404, as for the baseline).
- Template head code that uses CMS tokens (`x-schema-post`) is not returned by the MCP. The page file
  records `"headUnreadable": true`, and the check stays on staging HTML.

### Manifest and change signals

`manifest.json` (2-space JSON, keys sorted; no clock, so it is reproducible):

```json
{
  "counts": { "assets": 197, "collections": 3, "components": 16, "elements": 2455, "emptyStyles": 794,
              "fonts": 4, "instances": 121, "interactions": 14, "pages": 13, "styles": 700,
              "stylesInDump": 1494, "variables": 74 },
  "dump": ".cache/webflow-dump/20261011T194658Z",
  "files": { "styles.jsonl": "<sha256>", "pages/home.json": "<sha256>" },
  "gaps": ["cms-details.json missing: …", "variantStyles: …"],
  "rawDump": { "styles.json": "<sha256 of the raw file>" },
  "repoCommit": "<hash of the repo commit the snapshot matched>",
  "schema": 1,
  "signals": {
    "collectionLastUpdated": { "<collectionId>": "…" },
    "interactionVersion": { "i-74d70492": 2 },
    "pageLastUpdated": { "<pageId>": "…" },
    "pageScriptsLastUpdated": { "<pageId>": "…" },
    "registeredScripts": [["xmodal", "1.2.0"]],
    "siteLastPublished": "…",
    "siteLastUpdated": "…"
  },
  "siteId": "6ab9ba4aeffb3329202448ee",
  "takenAt": "2026-10-11T19:46:58Z"
}
```

`takenAt` is read from the dump folder name; `files` and `rawDump` are sha256 of each normalised
file and each raw dump file (so a snapshot names the exact bytes it came from). `gaps` lists what
the dump did not contain. `pageScriptsLastUpdated` has an entry only for pages with scripts.

The signals are the values of the quick check. Everything else is compared by file hash.

Two optional fields exist only after a **partial refresh** (see "Refreshing the base" below; a full rebuild writes a manifest without them):

```json
{
  "refreshedRows": [{ "report": "2026-10-13", "rows": "2-5,7", "keys": ["element|page:home|…|text", "style|.fk-x|font-size|main|noPseudo"],
                      "newDump": ".cache/webflow-dump/20261013T060458Z", "at": "2026-10-13T08:00:00.000Z" }],
  "repoBase": { "css": [[".fk-input-field-label", "main", "noPseudo", "font-size", "15px"]], "tokens": { "color-brand": "#123456", "space-9": "36px" } }
}
```

`refreshedRows` lists which report rows were absorbed (row numbers for people, row `key`s for the tools, the dump they came from; the
`at` time is the one clock value in the file). `repoBase` says what the repo held for the absorbed styles and tokens (`null`: no such
property or token); the reconcile lays it over the repo-at-`repoCommit` values.

`repoCommit` replaces git history for the "base vs repo" column of the three-way compare. Repo
changes since base = changes since that commit (`git diff <repoCommit>`), plus uncommitted
working-tree changes. It is written when the snapshot is taken or refreshed after a sync, so the
repo should be committed at that moment. The baseline only needs `src/` (plus the CSS and tokens
it builds from) to have no uncommitted changes, not a fully clean tree (decided 2026-10-11): the
docs and scripts may differ. The script takes `--commit <hash>` (default `git rev-parse HEAD`) and
stores the full hash. If the commit is no longer reachable, the report says so and asks for a
rebuild.

## Volatile fields: what is dropped

Verified by reading the homepage tree twice (identical, 446 elements, same ids), the full style
dump twice (same order, same ids, same values) and by looking at the field names:

| Field | Where | Why dropped |
| --- | --- | --- |
| `lastUpdated`, `createdOn`, `lastPublished`, `fullSiteCompiledAt`, `previewUrl` | site, page, asset, collection records | change on publish or on unrelated saves; kept only as signals in the manifest |
| `size`, `hostedUrl`, `variants`, `originalFileName`, `siteId` | assets | `size` is `0` for fresh SVGs and filled later; the URL switches between the `s3.amazonaws.com` and CDN form |
| `hostedLocation` | registered scripts | random folder id per upload |
| `instanceCount`, `variants[].isSelected` | components | moves with every page edit; Designer UI state |
| `propId` of instance props, `id.component` | trees | already in the component / page header |
| Style GUIDs, empty combo chains | styles | recreated by Webflow, identity is the selector |
| `publishedOn`, `updatedAt` | site instruction | keep only `path`, `version` (the instruction is not in the baseline dump) |
| `cssName` | variables | derived from the name (`--_flint---<name>`) |
| `lastUpdated`, `createdOn`, `hostedUrl`, `uploadedOn` | fonts | keep family, weight, style, format, file name and `fileHash` |

Not volatile, kept: element ids (stable, see the plan), `interactions[].version`, component and
variable ids, page ids.

## Ordering

- Files in a folder: by slug. Lines in `styles.jsonl`: by selector, plain string order.
- Element lines: document order (it is the page order, and a move changes the order).
- Object keys: sorted, except the fixed order for element lines above.
- JSON is written with `JSON.stringify` (no trailing spaces), `\n` line ends, one final newline. Small
  documents (`manifest.json`, `site.json`, `cms.json`, interactions) are 2-space pretty-printed with
  keys sorted at every depth; `variables.json`, `assets.json`, `styles.jsonl` and the element lists
  have one entry per line.

## Identity

- Elements: the Webflow element id. Stable across reads, publishes, many Designer saves and
  `move_element` (74 element and component ids quoted in `sync-log.md` between 2026-09-26 and
  2026-10-10 are still in the live trees unchanged; see the plan). A deleted and re-created element, a duplicate and an element made
  by `transform_element_to_component` get a new id.
- Component definition elements: ids under the component, same rules.
- Styles: selector. Variables: name. Interactions: id (`i-…`), also keep the name. Pages: page id.
- Repo location: `map/pages/<slug>.json` and `map/components/<slug>.json` (spec in "Map" below). It is
  written by `scripts/webflow-map.mjs` when the snapshot is refreshed, from an alignment of the repo's
  traced render with the snapshot tree on a repo that equals Webflow. It is not part of the compare; it
  only tells the report where an edit goes.

## Map

*Changed 2026-10-13 (reconcile phase 3 stage 1): the spec said one `map/<slug>.json` with
`{file, path, text, occ}` per id. Built as below instead: pages and components in two folders (a slug
like `newsletter` could be both), and the location comes from the JSX itself, not from searching the
file. `map/` is part of the gitignored `data/`.*

`webflow-map.mjs` renders each repo page with Vite SSR and a JSX runtime that records where every
element was written (`scripts/reconcile/jsx-trace/`, used only by that script's own Vite server): a host
element carries `src/path.tsx:line:col` of its opening tag, a function component is wrapped with its call
site and its primitive props. The render is aligned with the snapshot tree (order, tag, classes, text;
components that are not Webflow components are transparent; Webflow-only wrappers and repo-only
wrappers are opened up when their children match) and each Webflow element id gets one entry.
Components are aligned with the best-matching repo render of that component (up to 25 call sites tried).

File shape (one entry per line inside `elements`):

```json
{
"schema":1, "kind":"page", "name":"home", "snapshotDump":".cache/webflow-dump/…", "snapshotRepoCommit":"…",
"repoHead":"…", "srcDirty":false, "total":446, "mapped":440, "byType":{"Block":[164,165],…},
"unmapped":[{"id":"…","type":"DynamoEmpty","classes":"fk-panel fk-bg-white","parent":"…","nodes":6,"reason":"webflow-only wrapper"}],
"repoOnly":[{"file":"src/sections/PostGrid.tsx","line":36,"tag":"div"}], "source":"src/pages/HomePage.tsx", "route":"/",
"elements":{
"<id>":{"k":"el","file":"src/sections/Hero.tsx","line":12,"col":15,"path":[0,1,0,0,0,0,0,0,0]},
"<id>":{"k":"text","file":"src/sections/Pricing.tsx","line":44,"locate":"literal","path":[…],"text":"Why is Flint free?"},
"<id>":{"k":"inst","comp":"Button","file":"src/pages/HomePage.tsx","line":23,"col":7,"path":[…],"compFile":"src/components/ui/Button.tsx",
        "props":{"Label":{"prop":"label","value":"Apply now","file":"…","line":31,"locate":"attr"}}},
"<id>":{"k":"el", …, "textBound":{"text":"December 3, 2025","locate":"manual","file":"…","line":22}}
}
}
```

- `k`: `body` (the page root), `el` (a host element: `file`, `line`, `col` of its opening JSX tag, `path` = child
  indexes from the render root, wrappers and text runs counted), `text` (a `String` node), `inst` (a component
  instance: `file:line:col` is the call site, `compFile` the component's own file).
- `text` entries: `text` is the Webflow string; `repoText` is added when the aligned repo text differs (text built
  from parts such as `"{n} min read"`, CMS-bound text). `part: [i, n]` when one repo run is several `String` nodes.
  `locate`: `literal` (the string is in the file at `line`), `partial` (only its first or last words are), `data`
  (found in another source file, for example `src/content/*.json`), `manual` (not found: edit by hand; `file:line` is the
  element that renders it). Search order: the call site of the prop that carries the text, the element's file, the
  enclosing call sites, then every file in `src/`. With several hits, the one at or after the element's line wins and
  the others are listed in `alts` (`occ` / `of` say which).
- `inst.props[<Webflow prop name>]`: `prop` is the repo prop (`null` when the repo has none, e.g. CMS-bound
  props), `value` the Webflow value, `locate` `attr` (the `prop=` attribute at the call site), `literal` / `data` (the
  string found elsewhere, e.g. in the array a section maps over), `default` (the component's own default,
  `compFile:line`), `manual`.
- `textBound`: the Webflow element has no text because it is bound to a component prop or a CMS field; the repo
  text and where it is written.
- `ra` (reconcile stage 3 part A, 2026-10-13): on an `el` entry, the attributes and settings where the repo
  render differs from Webflow's element, as `{ "<field>": <repo comparable value | null> }` (`null`: the repo has
  none), with the fields named like the diff (`attr.autocomplete`, `attr.role`, `settings.link`, `settings.altText`,
  `settings.assetId`, `settings.input`). Comparable values (`scripts/reconcile/fields.mjs`): an attribute as its
  string (`data-*` `""` equals `"true"`, React Router's `data-discover` and Webflow's `data-wait` ignored,
  camel-case names like `autoComplete` lower-cased); a link as `page:<published path>` for a page (resolved
  through the page ids of the snapshot) or its href; alt text with "none" equal to `""`; an image as its Webflow
  asset id (the repo `src` looked up in `webflow-ids.json` `assets`, else file name equal to the asset's name,
  else `file:<name>`); a form field as `name=…;type=…;required=…`. Not compared: `id` / `for` in a component with an ID
  prop (bound, not static), `href` / link / alt / asset below a Collection List, on a CMS template page, or in a
  component with a link / image prop (bound to the CMS or a prop), anything on Pagination elements, `role` on
  Collection List elements. Like `rc` and `repoValue` it is written only when it differs, so a map without
  it reads as "equal"; regenerate the stored map after upgrading.
- `repoOnly` (in memory for the working-tree maps; the file keeps the first 40): repo nodes with no Webflow
  counterpart now also carry `cls` (sorted classes) and `path`, and the unmatched top-level nodes are included.
  The reconcile uses the list of the alignment with the new tree to tell that a removed Webflow element is
  already gone from the repo.
- Not in `elements` (listed under `unmapped` as a group per top-most unmapped element, `nodes` counts its
  descendants): Collection List empty states, pagination, utility wrappers, a form field that is an instance on
  Webflow but plain markup in the repo (style guide templates), anything Webflow-only.
  `repoOnly` lists repo elements with no Webflow counterpart (CMS items beyond the first, scripts, iframes).
- Coverage at the baseline (2026-10-13, commit 831b811): 2,390 of 2,486 Webflow elements (96.1%); every page and
  component 100% except Home 98.7%, Blog / Categories template 73.5% (empty state, pagination), Posts template 82.3%,
  Style guide 54.1% (template instances), Featured post, Newsletter form, Post card 88 to 93%. 467 text entries:
  all but 7 sit on the line of their text.
- Deterministic (no clock): two runs give identical files (the test checks it).

## Size on disk

Measured on the baseline (2026-10-11), 49 files, 752 KB (the 2026-10-13 baseline: 51 files, 777 KB), none of it committed (`map/` adds 434 KB, 30 files):

| File | Size |
| --- | --- |
| `pages/*.json` (13 pages) | 359 KB (Candidates 91, Home 77, Facility 59, About 46, legal pages 17 to 22) |
| `components/*.json` (16) | 101 KB (Role Grid 20, Arc Stage 19, Testimonials 16, Footer 11) |
| `styles.jsonl` (700 lines) | 145 KB |
| `interactions/*.json` (14) | 100 KB (ix-ticker 47) |
| `assets.json` (197), `variables.json`, `cms.json`, `site.json`, `manifest.json` | 61 KB (assets 36) |

One reconcile run reads only the files that changed, never all of it.

## Raw dump cache (outside git)

- Location: `.cache/webflow-dump/<UTC timestamp>/` at the repo root, one file per MCP call
  (`pages-home.json`, `styles.json`, `components-trees.json`, …). `.cache/` is in `.gitignore`.
- The MCP client writes a result to a file only when it is large (about 90 KB); smaller results come
  back inline and a dump agent does not save them. So a dump repeats the action in one call until
  the result passes that size and the client saves it to a file, and a script then dedupes (the skill
  has the row; `data_element_tool` takes one `pageId` per call). The baseline dump has one
  `tree-<slug>.json` per page (13), `component-trees.json` (one result per component), `page-code.json`
  (26 results: `get_page_scripts` then `get_page_freeform_code` for each page), `interactions-full.json`
  (14 results) and `assets-1.json` / `assets-2.json`. **The raw shape varies between dumps** (the
  MCP client and the dumping agent save results differently): the script reads a plain
  `{label, action, result|error}` wrapper, an array of `{type:"text", text:"<json>"}` blocks, an array
  of wrappers, or a one-element array around either (and `interactions.json` with `result: [{items}]`),
  and skips blocks that are not a result (a leading `{session_id}`). Labels are ignored. The CMS
  details file may be named `cms-collection-details.json` (a map of label to wrapper) or `cms-details.json`.
- Raw dumps are kept for the last 3 runs (never the one `manifest.json → dump` names: the gate reuses its files) and are never committed. They are the proof behind a
  changes report, so the report names the dump folder it used.
- A raw dump is about 1.8 MB (styles 0.69, pages 0.55, page code 0.12, components 0.18, assets 0.17,
  interactions 0.05, the rest 0.05).
- The dump runs on Sonnet at low effort (it only calls read tools and saves results; the user dropped Haiku on
  2026-10-11). `webflow-snapshot.mjs --check` then verifies it (see "Script"); if the check fails, the run repeats. The expected totals
  at the baseline are 13 pages, **16 components** (Global / Featured post is registered, so not 15),
  **74 variables** (they match `src/styles/tokens.css`, not 68), 1,494 styles, 14 interactions, 197
  assets, 3 CMS collections. Everything that interprets the dump runs on Sonnet.
- The baseline dump was scanned for keys and secrets on 2026-10-11: clean (see the plan).

## Script

```text
node scripts/webflow-snapshot.mjs <dump-dir> [--out <dir>] [--commit <hash>] [--rebuild] [--yes] [--check]
```

`--refresh <report.json> --rows …` is a different mode (no dump run): it absorbs approved reconcile rows into the existing base; see "Apply and refresh".

- Default output: `docs/webflow/snapshot/data/`. It refuses to write into an existing, non-empty
  folder without `--rebuild`, and writes nothing from an incomplete or inconsistent dump.
- `--out <dir>` writes elsewhere, to compare a second dump without touching the base (`diff -r`).
- `--commit <hash>` sets `repoCommit` (default `git rev-parse HEAD`).
- `--check` only verifies the dump and prints the counts. It fails when an expected file is
  missing or holds an error; when `pages.json`, the trees, the schema, the page code, the sitemap,
  the interactions (list vs full, `hasMore`, versions), the assets (sum vs `pagination.total`, no
  duplicate id), the components (list vs trees) and the styles (no duplicate selector, every
  variable id resolves) disagree; when an element id repeats or an instance points at an unknown
  component; and when `site.lastUpdated`, `lastPublished` or a page `lastUpdated` moved between the
  `*-before` and `*-after` reads (someone edited during the dump). Missing optional data is listed
  as `GAP` (and stored in the manifest), not as an error. A stale `*-after` is the only guard
  against an edit during the dump, so the dump must keep both reads.
- Deterministic: it reads nothing but the dump (and `git rev-parse` for the commit), so two runs on
  one dump are byte-identical.

### Map and diff scripts (reconcile phase 3, stage 1)

```text
node scripts/webflow-map.mjs [--data <dir>] [--out <dir>] [--page <slug>] [--quiet]
node scripts/webflow-tree-diff-ids.mjs <base dir> <new dir> [--json <file>] [--quiet]
node --test scripts/test-reconcile.mjs
```

- `webflow-map.mjs` writes `<data>/map/` (or `--out`) and prints mapped / total per page and component. Run it
  once per sync, on a repo that equals Webflow. It reads only the snapshot and the repo.
- `webflow-tree-diff-ids.mjs` compares two snapshot folders by identity and prints one line per change; `--json`
  writes the machine-readable list (the input of the report stage). Exit code 1 when anything differs. The code
  is in `scripts/reconcile/diff.mjs`. It does not read `accepted.json` (that file is about repo vs Webflow; the
  report stage carries it).

Change object, one per difference:

```json
{ "area": "element", "where": "page:home", "id": "8a16145e-ee69-d410-8c15-f94add50aa78", "field": "text",
  "base": "Why Flint is free?", "new": "Why is Flint free?", "parent": "…", "ctx": { "t": "String", "x": "Why is Flint free?" } }
```

| `area` | `where` | `id` | `field` |
| --- | --- | --- | --- |
| `element` | `page:<file slug>` or `component:<file slug>` | Webflow element id | `added` / `removed` (`base` / `new` hold the element line, `parent`, `index`), `moved` (parent or sibling order; `base` / `new` = `{parent, index}`, `after` = the previous sibling), `text`, `classes`, `type`, `settings.<key>`, `attr.<name>`, `component`, `prop.<Webflow prop name>`, `slots`. `ctx` = type, tag, classes, text or component name of the element. A text run Webflow re-created under the same parent (equal counts) is one `text` change with `idChanged: true` and `newId` |
| `page` | `page:<slug>` | page id | `added` / `removed`, `title`, `slug`, `seo.*`, `openGraph.*`, `draft`, `jsonLd`, `jsonLdRaw`, `scripts`, `head`, `footer`, `includeInSitemap` |
| `component` | `component:<slug>` | component id | `added` / `removed`, `name`, `group`, `description`, `props[<prop id>].<key>` (also whole-prop add / remove), `variants[<variant id>].<key>`, `variantStyles…` |
| `style` | selector (`.fk-button.is-secondary`) | `null` | `added` / `removed` (whole style line), `type`, or a CSS property with `bp` (`main`, `medium`, `small`, `tiny`) and `pseudo` |
| `variable` | variable name | variable id | `added` / `removed`, `name` (a rename keeps the id), `type`, `value` |
| `interaction` | interaction name | `i-…` id | `added` / `removed`, or a top-level key (`version`, `triggers`, `timelines`, …) |
| `asset` | file name | asset id | `added` / `removed`, `altText`, `displayName`, `contentType`, `folderId` |
| `site`, `cms` | `site` / `cms` | `null` | dotted path inside `site.json` / `cms.json` (arrays of scripts, fonts, collections and fields are matched by id) |
| `signal`, `manifest` | `manifest` | `null` | `pageLastUpdated.<id>`, `siteLastUpdated`, … (noise by themselves: the compare, not the signal, decides) |

Elements are matched by id only, so a deleted and re-created element is one `removed` plus one `added`
(stage 2 pairs them by parent and position), and inserting a sibling does not make the later ones "moved"
(moves are the siblings out of order among those both sides share).

### Reconcile report (reconcile phase 3, stage 2)

```text
node scripts/webflow-reconcile.mjs <new-dump-dir> [--base <dir>] [--base-map <dir>] [--out <report.md>] [--json] [--date YYYY-MM-DD] [--summary <file.md>] [--quiet]
```

Offline, writes only `--out` (default `docs/webflow/reconcile/<date>.md`, committed) and, with `--json`, the same rows
as `<out>.json` (the input of the apply phase; not meant to be committed). `<new-dump-dir>` is a raw dump (checked with
`webflow-snapshot.mjs --check` first; the run is refused, exit code 2, when the check fails, when the site differs, or when
the base commit is no longer reachable) or an already normalised snapshot folder. Steps: normalise the dump to a scratch
folder, diff it against the base (`scripts/reconcile/diff.mjs`) for the Webflow side, work out the repo side, classify.

**The repo side, and when the stored map is valid.** The base is the repo at `manifest.repoCommit`. The map and the
repo CSS / tokens are valid for the working tree when `src/` (styles and tokens included) has no change since that
commit, committed or not (`git diff <repoCommit> -- src` plus untracked files under `src/`). Commit equality is not
the test: `HEAD` moves for docs, scripts and skill commits, and `repoHead` / `srcDirty` in a map header are only
information. The report header says which case applied:

- `src/` unchanged: the stored `map/` gives every location, and the repo equals the base, so no row can be CONFLICT or
  REPO AHEAD. Nothing is rendered.
- `src/` changed: every page and component is rendered again from the working tree and aligned with the base tree
  (`build-map.mjs`, in memory), and a second time with the new tree. For each id three values compare: the base value
  (the stored map: `text` / `repoText`, `rc`, `props.<name>.repoValue`, else Webflow's base value), the repo value now
  (this alignment) and the new Webflow value. Locations (`file:line`) come from the working-tree alignment, so they are
  current. CSS is compared per selector, breakpoint, state and property: `src/styles` at `repoCommit` (`git archive`
  into a scratch folder, through that commit's own `webflow-style-actions.mjs`) against the working tree, with
  `webflow-diff.mjs`'s normalisation. Tokens: `tokens.css` at both states. Other areas (page settings, component
  props, interactions, assets, custom code) use presence of the old / new value in the registry or source files at
  both states, or "did the target file change" when the value is not text.

Map additions for this (written by `webflow-map.mjs`): an `el` entry has `rc` (the repo's classes, sorted, only when
they differ from Webflow's); an `inst` prop has `repoValue` (the repo's primitive value when it differs from Webflow's).
Regenerate the stored map after upgrading, or the base values fall back to Webflow's.

**Classification** (the plan's three-way table): Webflow changed and repo same = `PULL`; both changed and ended at the
same value = `CONVERGED`; both changed otherwise = `CONFLICT`; repo changed, Webflow same = `REPO AHEAD` (listed, no
action). **CONVERGED wins over the base:** whenever the repo's value now equals the new Webflow value the row is CONVERGED, even
when the repo did not change since the base (a pre-existing repo-vs-Webflow difference that Webflow now resolves, such as an attribute
Webflow added that the repo already renders, or one removed that the repo never rendered). A re-created text run (new id) the alignment
cannot pair is CONVERGED when the page's / component's source file holds the new text and no longer holds the old one; else PULL
("find the text by hand"). Lines of `accepted.json` `style` are subtracted by exact text when the repo and the new Webflow value differ by
exactly that line (the count goes in the footer); Webflow grid defaults are ignored. `signal` and `manifest` changes,
interactions whose only change is the version counter, and the CMS field schemas a first dump lacked are footer lines,
not rows.

**Element rows** (stage 3 part A). What the repo has now is read off the alignment of the working tree with the NEW
Webflow tree (the one with the base tree is lost by a restructure and only used as a fallback):

- *Text, classes, instance props, attributes and settings* (`attr.*`, `settings.*`): compared by value, repo
  base (the stored map, else Webflow's base value) against repo now against the new Webflow value. `attr.href` is
  folded into the `settings.link` row of the same element. A component's ID prop binds `id` / `for`: the removal of
  that static attribute is a footer line ("bound"), not a change.
- *Added / removed*: an added element is CONVERGED when the new-tree alignment finds a matching repo element; a
  removed one when no repo node of the new-tree alignment is left that looks like it (same classes, under the same
  parent), PULL when one is.
- *Moved*: the parent id and the order among the shared siblings, three-way: Webflow base to new (the diff), the repo
  base to now (order paths of the maps), and the repo against the new tree. A Webflow-only move is PULL with the
  element's `file:line` and its new neighbour (`target`: the nearest earlier sibling with a repo location, else the new
  parent as "first child of"); the repo already in the new place is CONVERGED; the repo moved it elsewhere is
  CONFLICT. A move that only follows an add (into a new wrapper) or a remove (out of a deleted one) is not a row: it is
  noted on that add / remove.
- *Restructure*: two or more adds / removes / moves under one parent are one row, `sub: restructure`, `id` the parent,
  with `members` (each: `change`, `element`, `direction`, `file`, `line`, `target`, `notes`). The row is PULL when any
  member is, CONFLICT when any is and none is PULL, else CONVERGED; the notes say how many already match.
- Webflow-only changes to other fields (`type`, `slots`, `component`) are PULL with a note.

**REPO AHEAD** lists: styles and tokens (as before); element text, classes, instance props and attributes whose
repo value changed (aligned with the new tree; a text pair that shares no word with the Webflow text is a
misalignment and is dropped to the footer); **components** (props and variant values added or removed in
`src/components` and `src/sections` files of a Webflow component, parsed from the `...Props` type, only props that
Webflow also lacks (added) or still has (removed); new and removed component files); **pages** (sections added,
removed or reordered in the page files, from the imported `sections` / `components` used in the JSX);
**interactions** (rows of `interactions.md` added, removed or changed; `src/ix` files other than the shipped
`x*.ts`); **custom code** (changed files in `docs/webflow/custom-code`, `scripts/build-x-*.mjs`, `src/ix/x*.ts`,
`src/styles/exceptions`). A repo change that Webflow also made is not listed.

**Pre-existing differences** (footer section and `footer.preexisting` in the JSON): repo-vs-Webflow differences in
attributes, settings and classes that exist in the base and still exist against the new tree, where Webflow did not
change the field (so no row), and not in `accepted.json`. They come from `ra` / `rc` of the maps, are listed once per
element and field (grouped by page or component and field in the markdown), and carry `acceptLine` for
`accepted.json`'s `element` list. Example: the `autocomplete="email"` the repo sets on the Input Field input and the
Webflow template does not have.

**Rows.** `#` is stable for the same inputs: PULL and CONFLICT first, then CONVERGED, then REPO AHEAD; within them by
area (Elements, Styles, Variables, Components, Pages, Custom code, Interactions, Assets, Site and CMS), `where`, and
document order. The markdown has a header table (base dump, new dump, repo HEAD, src state, map used, counts), one
table per area for PULL and CONFLICT rows, then converged and repo-ahead tables, a footer (signals and noise) and the
Pre-existing differences table. Columns: `#`, Area (the field), Where (page, component, class or variable), Element,
Base → Webflow (a conflict adds `repo:` with the repo value), Direction, Proposed repo edit (`file:line`, what to do,
notes; a move adds "after `file:line`"; a restructure lists its members), Mode. JSON row fields: `n`, `key`,
`area`, `sub`, `where`, `element`, `base`, `webflow`, `repo`, `repoBase`, `direction`, `mode`, `edit`, `notes`, `members`
(restructure), `ref` (the diff change it came from). `edit.op` is one of `replace-text` (`file`, `line`, `old`, `new`,
`locate`, `occ`, `of`, `alts`), `change-classes` (`remove`, `add`), `set-prop` (`comp`, `prop`, `repoProp`, `locate`),
`set-attr.<name>` / `set-settings.<name>` (`old`, `new`), `set-declaration` / `add-declaration` /
`remove-declaration` / `add-rule` / `remove-rule` (CSS: `file`, `line`, `decl`, `old`, `new`, a literal that equals one
token gets a "snap to token" note), `set-token` / `add-token` / `remove-token` / `rename-token` (`tokens.css` line and
the `tokens.md` line), `add-element` / `remove-element` / `move-element` (`target`) / `restructure` (`parent`,
`members`), component and page ops (registry line in `components.md`), `set-custom-code` (`file`, `builder`, `source`:
change the source and regenerate), and interaction, asset, site and cms ops. `mode` is `auto` when the edit is
mechanical (the old value is at that line, one place, no shorthand, not a generated file) and `assisted` otherwise
(`—` for converged and repo-ahead rows). A new class (`add-rule`, the whole style or one missing state, into the family's CSS file) and a new Color or Size token (`add-token`) are `auto` too (2026-10-13, phase 4) because the apply script can write them; each leaves a follow-up (registry row). `meta.new.input` is the path of the new dump as it was given to the CLI (repo-relative when inside the repo): the apply and refresh tools read it back.

**Known limits** (kept in the plan): an alignment is only as good as the two trees are alike: a page rewritten in the
repo (the Style guide after D-67) pairs elements wrongly, which shows as footer "misaligned" lines and a few
spurious pre-existing differences; an instance that the repo renders as plain markup has no prop entry (PULL, edit by
hand); component meta (description, variants) and page settings still use presence or file-change heuristics and err
towards CONFLICT, except a prop default (read from the repo prop's default parameter) and a description equal to the
sync pattern; the `removed` test cannot tell an element removed from the repo from one the alignment paired with
another Webflow element; an element missing from the map is a PULL with "edit by hand".

### Apply and refresh (reconcile phase 4)

```text
node scripts/webflow-reconcile-apply.mjs <report.json> --rows <1-5,8|auto|all> [--dry-run] [--refresh] [--build]
          [--base <snapshot dir>] [--new <dump or snapshot>] [--tasks-json <file>] [--force] [--no-verify]
node scripts/webflow-reconcile-apply.mjs <report.json> --record-commit [<hash>]
node scripts/webflow-snapshot.mjs --refresh <report.json> --rows <1-5,8|auto|all> [--new <dump>] [--base <dir>] [--force] [--no-verify]
```

`<report.json>` is the file `webflow-reconcile.mjs --json` wrote next to the report (gitignored, with the other row JSON). `--rows`
takes the numbers of the report ("1-5,8"), `auto` (every PULL row marked `auto`) or `all` (every row except repo-ahead ones). Offline;
no Webflow call; no git commit. The scripts read and write the repo at `FLINT_ROOT` (default: this checkout).

**What is edited and what is not.** A row is edited only when it is a **PULL**, the report marks it **`auto`**, and its guard holds
(the old value is still where the report says, exactly once, or exactly once in that file). Everything else is **not edited**: it is
printed as a task (`#n [direction] area · where · element`, why it was not automatic, old → new, what to do with `file:line`, the contract
reminders) and the script exits with code 3. `--tasks-json` writes the same list as JSON.

| Row | Applied by the script | Left to the agent (task) |
| --- | --- | --- |
| Text (`replace-text`) | the string at `file:line` (JSX text, an attribute, a JS string or a JSON value), escaped for its context (`"` in an attribute, `\'` in a JS string, no `{ } < >` in JSX text) | several places hold the string, text built from parts, text that spans lines, a new text JSX can't hold as is |
| Classes (`change-classes`) | one class swapped for one other on the recorded line | more than one class, a class list built in a helper |
| Instance prop (`set-prop`), attribute, alt (`set-attr.*`, `set-settings.altText`) | a string at the call site or in a data array (`label="…"`, `alt="…"`) | a prop passed as `label={buttonLabel}`, numbers, booleans, a prop the repo doesn't pass |
| CSS declaration | `set-declaration`, `remove-declaration` (one-line declarations), `add-declaration` (to a rule with one selector) in `src/styles/**` | a shorthand (`padding`), a multi-line value (`transition`), a rule shared by several selectors, `utilities.css` (generated: change the token or `gen-utilities.mjs`), a value that equals a token (rule 2: ask, then `var(--x)`) |
| New class (`add-rule`) | the rule (all states and breakpoints) appended to the class family's CSS file; Webflow's grid defaults left out | a family with no CSS file, a tag style, a removed class (`remove-rule`) |
| Token (`set-token`, `add-token`) | `tokens.css` (a new token goes after the nearest of its scale), the `tokens.md` value cell, a new variable's id in `webflow-ids.json`; `gen-utilities.mjs` runs for a new `space-*` token | the `tokens.md` row of a new token, a renamed or removed token, a Font or other type |
| Structure (`add/remove/move-element`, `restructure`), components (props, variants, rename, new), pages, interactions, assets, site and CMS rows, custom code (`set-custom-code`) | nothing | all of it: the task names the files, the registry rows and, for custom code, the source and the build script (never the generated output) |
| CONFLICT, REPO AHEAD, CONVERGED | nothing (a conflict needs the user's choice; repo ahead and converged have nothing to apply) | a conflict is a task with both values |

Some rows apply and still leave a **follow-up** (the class registry row in `classes.md` for a new class, the `tokens.md` row of a new
token, an empty rule left behind): the script prints them under the task list and exits with 3. `--dry-run` prints `diff -u` of
everything it would write and writes nothing. `--build` runs `npm run build` and `npm run lint` afterwards (exit 4 when one fails); by
default it does not, because the agent still edits the task-list rows and runs them once at the end. A report whose base moved (the
base was rebuilt) is refused (exit 2), `--force` overrides. Rows the manifest already lists in `refreshedRows` for the same dump are
reported as "already applied". The "Applied" record: `<report>.applied.json` (rows, how, files) and a `## Applied` section in the
markdown report (rows, how, files, base refreshed, commit), written on every non-dry run; `--record-commit` adds the commit hash after
the user commits.

#### Refreshing the base

`webflow-snapshot.mjs --refresh` (or `--refresh` on the apply script, for the rows it applied plus the approved rows that were already
converged) makes the base items behind the given rows equal to the new dump, and nothing else:

1. **Verify.** Unless `--no-verify`, it runs the reconcile against the same new dump first: every approved row must now be CONVERGED or
   gone. A row that is still PULL or CONFLICT is refused (listed, exit 3 when nothing was refreshed): the repo does not have Webflow's
   value yet. `--force` refreshes it anyway (the repo then shows as ahead of the base). Repo-ahead rows are skipped.
2. **Units.** The row `ref`s (a restructure row: its members; a page row: its whole group; an interaction row: all its changes) select
   the changes of the id diff. Each is copied from the new snapshot into the base file by identity: an element's field, an added or
   removed subtree (with the moves that only follow them), a style property, a variable, a component or page header path, a whole
   interaction file, an asset field, a path of `site.json` / `cms.json`. Files are written in the normaliser's exact format (a file that
   would not round-trip stops the refresh: rebuild the base).
3. **Map.** The `map/` entries of refreshed elements take the new value (text without `repoText`, no `rc`, `ra`, prop `repoValue`;
   removed elements are dropped; a re-created text run moves to its new id). Added and moved elements get no entry (no location is known
   until the next rebuild).
4. **Manifest.** `files` hashes, `refreshedRows`, `repoBase` (styles and tokens), and the signals: a page's (or interaction's) signal takes
   the new dump's value when its file is now equal to the new one; when every base file equals the new snapshot, all signals, `dump`,
   `takenAt`, `counts`, `gaps` and `rawDump` do too.

**How base-vs-repo stays valid after a partial refresh.** `repoCommit` does **not** move. The applied edits may be uncommitted, and the
working tree has other changes since that commit (repo ahead) that must stay visible. So the repo side of a refreshed item is not "the
repo at `repoCommit`" any more but the value that was applied: for styles and tokens it is `manifest.repoBase`, which
`webflow-reconcile.mjs` lays over the values it reads from `repoCommit`; for element text, classes, props and attributes it is the
updated `map/` entry; for everything else the new base equals Webflow, so there is nothing to report. A later Webflow edit of an
absorbed item is therefore a plain PULL (not a CONFLICT), and a repo edit of it is REPO AHEAD. Committing the applied edits changes
nothing (`repoCommit` still points at the old commit; the diff against it includes them). A full rebuild after the commit
(`webflow-snapshot.mjs <dump> --rebuild`) sets `repoCommit` to HEAD and drops `refreshedRows` and `repoBase`. Known limits: the map has no
entry for elements added or moved by a refresh; a restructure the agent did leaves REPO AHEAD rows for component files and page sections
until the next rebuild.

## Rebuilding the base

`node scripts/webflow-snapshot.mjs <dump-dir> --rebuild` takes a fresh dump and replaces the
default `data/` (it removes only the files it writes: `manifest.json`, `site.json`, `variables.json`,
`styles.jsonl`, `assets.json`, `cms.json`, `pages/`, `components/`, `interactions/`; `map/` is left
for the map step to rewrite). It prints this warning and waits for a typed `yes` before it writes
anything (`--yes` answers it for a non-interactive run; without a terminal and without `--yes` it
stops):

> Rebuilding resets the base. Any Webflow edit made since the last sync is absorbed silently
> instead of reported. If the old `data/` still exists, run a reconcile first.

The warning applies to the default `data/` only; an `--out` folder is a scratch copy. Consequences:
the base exists on one machine only, and the changes reports are the only record of what changed
between syncs.

## Accepted differences

`accepted.json` (committed) lists the repo-vs-Webflow differences that already existed at the
baseline: 10 style lines from `scripts/webflow-diff.mjs`, the tree-diff noise on About, and (`element`, `unaligned`) 8 by-design element patterns and the Style guide page. Each
entry has the exact diff `line` (it contains both the repo and the Webflow value), the parsed
selector, breakpoint, pseudo, property and values, and a reason. Reconcile subtracts these lines
from a repo-vs-Webflow compare by exact text, so a value that moves on either side is reported
again. Remove an entry when the difference is fixed. An optional `element` list holds the same for the
**Pre-existing differences** section of the report: `{ "line": "<the acceptLine of the footer entry>", "reason": … }`
(`<where> <element> <field>: <repo> → <Webflow>`, as the JSON footer's `acceptLine` has it). An `element` entry may
carry a `pattern` (a JavaScript regular expression tested against that line) instead of `line`, to silence a whole
family (the five `is-default` combos of `UI / Stat`); anchor it with `^`/`$` and the `<where>` and field. An optional
`unaligned` list, `{ "where": "page:style-guide", "reason": … }`, marks a page or component whose element pairing is not
trustworthy (the repo page and the Webflow page differ too much): its pre-existing differences are counted in the
footer ("not listed because the page is marked `unaligned`") but not listed; rows (changes since the base) are
unaffected. Accept only differences that are **by design** (a component variant that replaces a combo, an attribute
webflow.js writes at runtime, a bound prop, a tree-read gap confirmed on staging); real drift stays listed until one
side is fixed. The 2026-10-13 triage is in `plans/reconcile.md` → "Phase 3 done".

**Report summary.** `--summary <file.md>` inserts a hand-written markdown file under the report title as `## Summary`
(what changed, what needs a decision, the drift list). Keep it next to the report
(`docs/webflow/reconcile/<date>.summary.md`) so a re-run regenerates the same report.

## Gaps in the baseline dump

Recorded in the manifest, to close in the next dump (the 2026-10-11 second dump already has the CMS field schemas, `cms-collection-details.json`): `get_variant_styles` for the triples in `components.md`, and the
site instruction (`search_instructions` path and version).

## How the quick check decides what to re-read

Five calls, about 21 KB: `get_site`, `list_pages`, `list_interactions`, `get_collection_list`,
`get_registered_scripts`. Compare with `manifest.json → signals`:

| Signal moved | Re-read |
| --- | --- |
| a page `lastUpdated` | that page's tree, settings, JSON-LD, scripts and head/footer code |
| an interaction `version`, a new or missing interaction id | that interaction |
| a collection `lastUpdated` | that collection's fields |
| a registered script id or version | the registered scripts and the page scripts |
| `siteLastUpdated` only | site head/footer code, fonts, site instruction, assets |
| nothing | still re-read styles, components and variables (see below) |

Styles, components and variables have **no timestamp** in any MCP result, and a component or
style edit does not bump the `lastUpdated` of the pages that use it (the legal pages did not move
after the 2026-10-10 Page Hero changes). So these three are always re-read: 3 calls, about 0.9 MB,
saved to files by the client, compared by hash against `manifest.json → files`. Page trees of
pages whose signal did not move are not re-read.

Measured in phase 2 step (d) (2026-10-11): a page text edit that was never published moved that
page's `lastUpdated` (and the schema's, which carries the same value, and `siteLastUpdated`;
`siteLastPublished` stayed put), so the page signal catches text. The style, variable and
component edits of the same session moved no timestamp of their own, and `siteLastUpdated` equals
the latest page save, so it cannot stand in for them. The three always-re-read reads stay.

## The gate: a partial dump (reconcile phase 5)

A gate (the reconcile before a sync stage or a publish) does not need the full dump of about 58 reads. The dump agent
saves the five quick-check reads, `scripts/webflow-gate.mjs` says which others the signals ask for, and `--compose` builds a
**complete raw dump** from those reads plus the unchanged files of the base's raw dump. `webflow-reconcile.mjs` then runs on it
unchanged. Offline, no Webflow call.

```text
node scripts/webflow-gate.mjs --plan <partial-dir> [--base <data dir>] [--from <base raw dump>] [--json]
node scripts/webflow-gate.mjs --compose <partial-dir> [--out <dump dir>] [--base <data dir>] [--from <base raw dump>] [--force]
```

1. **Signals.** Save to `<partial-dir>` (a new folder in `.cache/webflow-dump/`, e.g. `<UTC>-gate/`; the file names are the dump's own):
   `site-before.json` (`get_site`), `pages-before.json` (`list_pages`), `interactions.json` (`list_interactions`),
   `cms-collections.json` (`get_collection_list`), `registered-scripts.json` (`get_registered_scripts`). `--plan` on a folder
   without them prints exactly these five reads (exit 2).
2. **Plan.** With the signals in place `--plan` compares them with `manifest.json → signals` and prints the other reads:

   | Signal | Re-read |
   | --- | --- |
   | Always (these have no timestamp) | `styles.json`, `components.json`, `component-trees.json`, `variables.json` |
   | A page `lastUpdated` moved, or a page is new | that page's `tree-<file>.json` and its two code results in `page-code.json` (labels `p-<x>` and `f-<x>`); plus `schema.json` and `sitemap.json` when any page moved or the page set changed |
   | An interaction `version` moved or a new interaction | that interaction's entry in `interactions-full.json` (a result labelled with the id) |
   | A collection `lastUpdated` moved | that collection's entry in `cms-details.json` |
   | A registered script id or version moved | `site-code.json` and every page's code in `page-code.json` |
   | `siteLastUpdated` or `siteLastPublished` moved (any page save or publish does it) | `site-code.json`, `fonts.json`, `assets-1.json` (`assets-2.json` as `pagination.total` needs) |
   | Always, last | `site-after.json`, `pages-after.json` (nothing was edited during the dump) |

   Cost: **11 calls** when nothing moved (5 signals, 4 always, 2 end), about 1 MB of which 0.9 MB (styles, component trees)
   is written to files by the client; **+2 per moved page** (tree, code in one call), +2 when any page moved (schema,
   sitemap), +1 per changed interaction batch and collection batch, **+4 after a publish or any page save** (site code, fonts,
   2 asset pages). A typical gate after one page edit is about 20 calls, against 58. Accepted gaps of the partial dump: an
   asset or font edited with no site-level timestamp moving is not seen (a full dump catches it); a pure style, component or
   variable edit is always seen (always-read).
3. **Compose.** `--compose` verifies that everything the plan asked for is in the folder (exit 2, listing what is missing, and
   nothing is written), that nothing moved between the `-before` and `-after` reads (exit 1), writes the full dump to
   `--out` (default `.cache/webflow-dump/<UTC>`), runs `webflow-snapshot.mjs --check` on it and prints the reconcile command.
   Unchanged files come from the base's raw dump, which the plan hashes against `manifest.json → rawDump`. The composed folder
   is a full dump: it can be the `<new-dump>` of a reconcile, of `--refresh`, and of `--rebuild` (its `COMPOSED.txt` says
   what came from where).
4. **When a full dump is required** (exit 3, the reasons are printed): no base (`data/manifest.json` missing; the rebuild
   warning applies), the raw dump folder the manifest names is gone or one of its files no longer matches `rawDump`, the base was
   partially refreshed by an apply (its raw dump no longer equals the base: finish with the sync's full rebuild first), or
   `get_site` returned another site. Keep the dump folder named in `manifest.dump` when you clear `.cache/` (the "last 3 runs"
   rule must not delete it).

Tested in `scripts/test-reconcile.mjs` (three `gate:` tests): no signal moved (the composed dump normalises byte for byte to
the full dump), a moved page plus a changed interaction plus a publish (exact read list, missing reads named, merge,
reconcile on the composed dump), and every full-dump case.

## Not in the snapshot

CMS items (posts stay Webflow-first), form submissions, assets' bytes, the published HTML, the
301 redirect map, `robots.txt`, `llms.txt`, per-page noindex, site SEO settings and the canonical
URL (none of them is readable through the MCP; the repo files stay the source and staging is the
check), element settings the tree does not return (image `altText` inherit vs decorative, which
routine runs do not compare; only changed images get `get_settings`;
HTML Embed `code`, text-field validations): the plan lists the partial reads and the workaround
for each.
